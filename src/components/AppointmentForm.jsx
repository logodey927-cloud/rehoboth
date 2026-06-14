// client/src/components/AppointmentForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  TextField,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  Chip,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { prepareAppointment, getAvailableDates, getServices, getAutoAssignedTeamMember, getTeamMemberTimeRange, createPayPalIntentOrder, verifyVoucherCode } from "../api/api";
import { swalError, ensureSweetAlertReady } from "../utils/swal";
import { useUserAuth } from "../contexts/UserAuthContext";
import PaymentBreakdown from "./payments/PaymentBreakdown";
import PaymentConfirmationStep from "./payments/PaymentConfirmationStep";
import PaymentGatewaySelector from "./payments/PaymentGatewaySelector";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import InfoSection from "./common09/InfoSection";
import StyledButton from "../components/common09/StyledButton";
import VoucherCodeInput from "./vouchers/VoucherCodeInput";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";

// Predefined UI format for date/time strings stored in form state
const DATE_FMT = "YYYY-MM-DD";
const TIME_FMT = "HH:mm";

const steps = [
  "Personal Info",
  "Service Selection",
  "Date & Time",
  "Payment",
  "Confirmation",
];

const validationSchema = yup.object({
  full_name: yup
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^[+()\-\d\s]{7,}$/i, "Enter a valid phone number")
    .required("Phone is required"),
  client_gender: yup
    .string()
    .oneOf(["male", "female", "other"], "Please select your gender")
    .required("Please select your gender"),
  service: yup.string().required("Please select a service"),
  treatment: yup.string().required("Please select a treatment"),
  duration: yup.number().required("Please select a duration"),
  date: yup.string().required("Please choose a date"),
  time: yup.string().required("Please choose a time"),
  note: yup.string().max(500, "Too long"),
  voucher_code: yup.string().nullable(),
});

function AvailabilityPickersDay(props) {
  const { day, outsideCurrentMonth, calendarData, ...other } = props;

  if (!day || outsideCurrentMonth) {
    return <PickersDay {...other} day={day} />;
  }

  const date = dayjs(day).startOf("day");
  const today = dayjs().startOf("day");

  const year = date.year();
  const month = date.month() + 1;
  const key = date.format(DATE_FMT);

  const isPast = date.isBefore(today, "day");
  const isOtherMonth =
    year !== calendarData.year || month !== calendarData.month;

  // Use new availableDates format if available, otherwise fall back to legacy format
  const dateInfo = calendarData.availableDates?.[key];
  const isAvailable = dateInfo ? dateInfo.available : false;
  const isBlocked = dateInfo ? !dateInfo.available && dateInfo.reason : !!calendarData.blockedDates[key];
  const reason = dateInfo?.reason || null;
  
  // Legacy format fallback
  const bookings = calendarData.bookedDates[key] || [];
  const isFullyBooked = bookings.length >= 5;
  const hasSomeBookings = bookings.length > 0 && !isFullyBooked;

  let bgColor;
  if (isPast) {
    bgColor = "rgba(158, 158, 158, 0.15)"; // grey
  } else if (!isOtherMonth) {
    if (isBlocked || !isAvailable) {
      bgColor = "rgba(158, 158, 158, 0.4)"; // darker grey - blocked or unavailable
    } else if (isFullyBooked) {
      bgColor = "rgba(244, 67, 54, 0.35)"; // red
    } else if (hasSomeBookings) {
      bgColor = "rgba(255, 193, 7, 0.35)"; // amber
    } else {
      bgColor = "rgba(76, 175, 80, 0.35)"; // green - available
    }
  }

  const sxProps = other.sx ? { ...other.sx } : {};
  return (
    <PickersDay
      {...other}
      day={day}
      sx={{
        ...sxProps,
        backgroundColor: bgColor,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.15) !important",
          color: "#000 !important",
          fontWeight: 600,
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(255, 152, 0, 0.8) !important",
          color: "#fff !important",
          "&:hover": {
            backgroundColor: "rgba(255, 152, 0, 0.9) !important",
            color: "#fff !important",
          },
        },
        "&.Mui-disabled": {
          "&:hover": {
            backgroundColor: bgColor,
          },
        },
      }}
      title={reason || (isAvailable ? "Available" : "Not available")}
    />
  );
}

// Legacy functions - kept for potential future use but currently unused
// Parse availability string from team member (e.g. "monday:10am-4pm,tuesday:11:00-18:00")
// into a map: { monday: "10am-4pm", tuesday: "11:00-18:00", ... }
const _parseAvailabilityString = (value) => {
  const map = {};
  if (!value || typeof value !== "string") return map;

  if (!value.includes(":")) return map;

  value.split(",").forEach((item) => {
    const [day, time] = item.trim().split(":");
    if (day && time) {
      map[day.trim().toLowerCase()] = time.trim();
    }
  });

  return map;
};

// Parse a time like "10am", "4pm", "10:30am", "16:00" into minutes since midnight
const _parseClockToMinutes = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  let value = raw.trim().toLowerCase();

  // Remove spaces
  value = value.replace(/\s+/g, "");

  const match = value.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]; // am/pm or undefined

  if (period) {
    const isPM = period === "pm";
    if (hours === 12) {
      hours = isPM ? 12 : 0;
    } else {
      hours = isPM ? hours + 12 : hours;
    }
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

// Parse a range like "10am-4pm" or "10:00-16:30" to [{ start, end }] in minutes
const _parseTimeRangeToMinutes = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== "string") return [];
  const [startRaw, endRaw] = rangeStr.split("-").map((s) => s && s.trim());
  if (!startRaw || !endRaw) return [];

  const start = _parseClockToMinutes(startRaw);
  const end = _parseClockToMinutes(endRaw);

  if (start == null || end == null) return [];

  if (end <= start) {
    // If end is not after start, ignore (invalid)
    return [];
  }

  return [{ start, end }];
};

export default function AppointmentForm({
  initialStep = 0,
  initialVoucherCode = "",
  initialService = "",
  onComplete,
  isModal = false,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, isAuthenticated } = useUserAuth();
  const [activeStep, setActiveStep] = useState(initialStep);
  const [voucherCode, setVoucherCode] = useState(initialVoucherCode);
  const [voucherValidation, setVoucherValidation] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null); // only set for voucher-100% case
  const [intentId, setIntentId] = useState(null); // booking_intents.id for Stripe/PayPal flows
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null); // "stripe" | "paypal" | null
  const [creatingAppointment, setCreatingAppointment] = useState(false); // step 2 -> 3 progress spinner
  const [calendarData, setCalendarData] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
    bookedDates: {},
    blockedDates: {},
    blockedTimeSlots: [], // Array of blocked time slots: [{ date, start_time, end_time, reason, is_full_day }]
    availableDates: {}, // New format: { "2024-12-01": { available: true, timeSlots: ["09:00", "10:00"], reason: null } }
  });
  const [_calendarLoading, setCalendarLoading] = useState(false);
  const [_calendarError, setCalendarError] = useState(null);
  // Time slots per date (from backend). Currently not used directly to restrict selection,
  // but kept for future enhancements and debugging.
  const [_availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Service selection state
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesFetchError, setServicesFetchError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [_autoAssignedTeamMember, setAutoAssignedTeamMember] = useState(null);
  const [teamMemberTimeRange, setTeamMemberTimeRange] = useState({ start: null, end: null, available: false });
  // Tracks when service is set programmatically on initial load so the watchedService
  // effect skips its treatment/duration reset for that one trigger.
  const skipServiceResetRef = useRef(false);

  const buildUserFullName = useCallback(() => {
    if (!user) return "";
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.join(" ");
  }, [user]);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      full_name: buildUserFullName(),
      email: user?.email || "",
      phone: user?.phone || "",
      client_gender: user?.gender || user?.client_gender || "",
      service: "",
      treatment: "",
      duration: null,
      date: "",
      time: "",
      note: "",
      voucher_code: initialVoucherCode || "",
      // Hidden field used to send the auto-assigned team member to the backend
      team_member_id: null,
    },
    // Validate on change so errors (like time required) clear as soon as the user selects a value
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Re-populate fields if user logs in after form mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const currentName = getValues("full_name");
      if (!currentName) setValue("full_name", buildUserFullName());
      const currentEmail = getValues("email");
      if (!currentEmail) setValue("email", user.email || "");
      const currentPhone = getValues("phone");
      if (!currentPhone) setValue("phone", user.phone || "");
      const currentGender = getValues("client_gender");
      if (!currentGender) setValue("client_gender", user.gender || user.client_gender || "");
    }
  }, [isAuthenticated, user, getValues, setValue, buildUserFullName]);

  const watchedService = watch("service");
  const watchedTreatment = watch("treatment");
  const watchedDuration = watch("duration");
  const watchedGender = watch("client_gender");

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Pre-fill service category from initialService prop once services are loaded
  useEffect(() => {
    if (!initialService || servicesLoading || services.length === 0) return;
    const match = services.find((s) => s.title === initialService);
    if (match) {
      skipServiceResetRef.current = true;
      setValue("service", initialService);
    }
  }, [initialService, services, servicesLoading, setValue]);

  // Auto-validate initialVoucherCode on mount (covers pre-filled code that user never blurs)
  useEffect(() => {
    if (!initialVoucherCode || initialVoucherCode.trim() === "") return;
    const code = initialVoucherCode.trim().toUpperCase();
    const formatRegex = /^RHB-[A-Z0-9]{4}-\d{4}$/;
    if (!formatRegex.test(code)) return;

    verifyVoucherCode(code)
      .then((response) => {
        if (response.data?.success) {
          const voucher = response.data.voucher;
          setVoucherValidation({ valid: voucher.is_valid, voucher, error: voucher.is_valid ? null : voucher.message });
        }
      })
      .catch(() => {});
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selected service when service changes
  useEffect(() => {
    if (watchedService && services.length > 0) {
      const service = services.find((s) => s.title === watchedService);
      if (service) {
        setSelectedService(service);
      } else {
        setSelectedService(null);
      }
      // Skip reset when service is set programmatically on initial pre-fill
      if (skipServiceResetRef.current) {
        skipServiceResetRef.current = false;
      } else {
        setValue("treatment", "");
        setValue("duration", null);
        setSelectedTreatment(null);
        setSelectedDuration(null);
        setSelectedPrice(null);
      }
    } else {
      setSelectedService(null);
      setValue("treatment", "");
      setValue("duration", null);
      setSelectedTreatment(null);
      setSelectedDuration(null);
      setSelectedPrice(null);
    }
  }, [watchedService, services, setValue]);

  // Update selected treatment when treatment changes
  useEffect(() => {
    if (watchedTreatment && selectedService) {
      const treatment = selectedService.items?.find((item) => item.name === watchedTreatment);
      if (treatment) {
        setSelectedTreatment(treatment);
      } else {
        setSelectedTreatment(null);
      }
      // Reset duration when treatment changes
      setValue("duration", null);
      setSelectedDuration(null);
      setSelectedPrice(null);
    } else {
      setSelectedTreatment(null);
      setValue("duration", null);
      setSelectedDuration(null);
      setSelectedPrice(null);
    }
  }, [watchedTreatment, selectedService, setValue]);

  // Re-validate voucher when treatment changes and the voucher has eligible-service restrictions
  useEffect(() => {
    if (!voucherCode || voucherCode.trim() === "") return;
    const code = voucherCode.trim().toUpperCase();
    const formatRegex = /^RHB-[A-Z0-9]{4}-\d{4}$/;
    if (!formatRegex.test(code)) return;

    verifyVoucherCode(code)
      .then((response) => {
        if (response.data?.success) {
          const voucher = response.data.voucher;
          setVoucherValidation({ valid: voucher.is_valid, voucher, error: voucher.is_valid ? null : voucher.message });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedTreatment]);

  // Update selected duration and price when duration changes
  useEffect(() => {
    if (watchedDuration && selectedTreatment) {
      const duration = selectedTreatment.durations?.find((d) => d.minutes === watchedDuration);
      setSelectedDuration(duration || null);
      setSelectedPrice(duration ? parseFloat(duration.price) : null);
    } else {
      setSelectedDuration(null);
      setSelectedPrice(null);
    }
  }, [watchedDuration, selectedTreatment]);

  // Auto-assign team member based on selected service/treatment and client gender
  useEffect(() => {
    const assignTeamMember = async () => {
      try {
        // Require service/treatment and client gender before attempting assignment
        if (!watchedService || !watchedTreatment || !watchedGender) {
          setAutoAssignedTeamMember(null);
          setValue("team_member_id", null);
          return;
        }

        const serviceName = selectedTreatment
          ? selectedTreatment.name
          : watchedService;

        const response = await getAutoAssignedTeamMember(
          serviceName,
          watchedTreatment,
          watchedGender
        );

        if (response.data?.success && response.data.team_member) {
          const member = response.data.team_member;
          setAutoAssignedTeamMember(member);
          // Store assigned team member ID in form data so backend uses it explicitly
          setValue("team_member_id", member.id);
        } else {
          // No suitable member found - clear any previous assignment
          setAutoAssignedTeamMember(null);
          setValue("team_member_id", null);
        }
      } catch (err) {
        setAutoAssignedTeamMember(null);
        setValue("team_member_id", null);
      }
    };

    assignTeamMember();
  }, [watchedService, watchedTreatment, watchedGender, selectedTreatment, setValue]);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      setServicesFetchError("");
      const response = await getServices();
      if (response.data?.success) {
        setServices(response.data.services || []);
      } else {
        setServicesFetchError("Could not load services. Please try again.");
      }
    } catch (err) {
      setServicesFetchError(
        err?.code === "ERR_NETWORK"
          ? "Cannot reach the server. Please check your connection."
          : "Failed to load services. Please refresh and try again."
      );
    } finally {
      setServicesLoading(false);
    }
  };


  const loadMonthAvailability = async (dateObj) => {
    try {
      setCalendarLoading(true);
      setCalendarError(null);
      const year = dateObj.year();
      const month = dateObj.month() + 1;
      
      // Get service_id from selected service
      const serviceId = selectedService?.id || null;
      
      const res = await getAvailableDates(year, month, serviceId);
      if (res.data?.success) {
        // Handle new format with availableDates
        const availableDates = res.data.availableDates || {};
        
        // Also keep legacy format for backward compatibility
        const bookedDates = res.data.bookedDates || {};
        const blockedDates = res.data.blockedDates || {};
        const blockedTimeSlots = res.data.blockedTimeSlots || [];
        
        setCalendarData({
          year,
          month,
          bookedDates,
          blockedDates,
          blockedTimeSlots, // Array of blocked time slots
          availableDates, // New structured format
        });
      } else {
        setCalendarError("Failed to load availability. You can still request a date.");
      }
    } catch (err) {
      setCalendarError("Failed to load availability. You can still request a date.");
    } finally {
      setCalendarLoading(false);
    }
  };

  // Load availability when service is selected or month changes
  React.useEffect(() => {
    // Only load if a service is selected
    if (selectedService) {
      loadMonthAvailability(dayjs());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  // Update available time slots when date is selected
  React.useEffect(() => {
    const selectedDate = getValues("date");

    if (!selectedDate) {
      setAvailableTimeSlots([]);
      setTeamMemberTimeRange({ start: null, end: null, available: false });
      return;
    }

    const dateMoment = dayjs(selectedDate, DATE_FMT);
    const year = dateMoment.year();
    const month = dateMoment.month() + 1;

    // If availability for this month hasn't been loaded yet, load it and wait
    if (calendarData.year !== year || calendarData.month !== month) {
      if (selectedService) {
        loadMonthAvailability(dateMoment);
      }
      setAvailableTimeSlots([]);
      setTeamMemberTimeRange({ start: null, end: null, available: false });
      return;
    }

    if (!calendarData.availableDates) {
      setAvailableTimeSlots([]);
      setTeamMemberTimeRange({ start: null, end: null, available: false });
      return;
    }

    const dateKey = dateMoment.format(DATE_FMT);
    const dateInfo = calendarData.availableDates[dateKey];

    if (dateInfo && dateInfo.available && Array.isArray(dateInfo.timeSlots)) {
      setAvailableTimeSlots(dateInfo.timeSlots);
    } else {
      setAvailableTimeSlots([]);
    }

    // Reset time when date changes
    setValue("time", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues("date"), calendarData.year, calendarData.month, calendarData.availableDates, selectedService]);

  // Fetch team member availability time range when team member and date are selected
  React.useEffect(() => {
    const fetchTeamMemberAvailability = async () => {
      const teamMemberId = getValues("team_member_id");
      const selectedDate = getValues("date");

      if (!teamMemberId || !selectedDate) {
        setTeamMemberTimeRange({ start: null, end: null, available: false });
        return;
      }

      try {
        const response = await getTeamMemberTimeRange(teamMemberId, selectedDate);
        if (response.data?.success) {
          setTeamMemberTimeRange({
            start: response.data.start_time,
            end: response.data.end_time,
            available: response.data.available,
          });
        } else {
          setTeamMemberTimeRange({ start: null, end: null, available: false });
        }
      } catch (err) {
        setTeamMemberTimeRange({ start: null, end: null, available: false });
      }
    };

    fetchTeamMemberAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues("team_member_id"), getValues("date")]);

  const handleNext = async () => {
    let fields = [];
    if (activeStep === 0) fields = ["full_name", "email", "phone", "client_gender"];
    if (activeStep === 1) fields = ["service", "treatment", "duration"];
    if (activeStep === 2) fields = ["date", "time"];
    if (activeStep === 3) {
      // Payment step - handled by PaymentUploadForm
      return;
    }
    if (fields.length) {
      const ok = await trigger(fields);
      if (!ok) return;
    }
    
    // If moving from Date & Time step, create appointment first
    if (activeStep === 2) {
      await handleCreateAppointment();
      return;
    }
    
    setActiveStep((s) => s + 1);
  };
  
  const handleBack = () => {
    // If going back from confirmation step, don't allow
    if (activeStep === 4) {
      return;
    }
    setActiveStep((s) => s - 1);
  };
  
  const handleCreateAppointment = async () => {
    // Prevent double-submit
    if (creatingAppointment) return;
    // Validate required fields again before submit (prevents empty time/date)
    const isValid = await trigger([
      "full_name",
      "email",
      "phone",
      "client_gender",
      "service",
      "treatment",
      "duration",
      "date",
      "time",
    ]);

    if (!isValid) {
      return;
    }

    await ensureSweetAlertReady();

    // If user typed a code but never blurred (validation is null), validate now before proceeding
    if (voucherCode && voucherCode.trim() !== "" && voucherValidation === null) {
      const code = voucherCode.trim().toUpperCase();
      const formatRegex = /^RHB-[A-Z0-9]{4}-\d{4}$/;
      if (formatRegex.test(code)) {
        try {
          const resp = await verifyVoucherCode(code);
          if (resp.data?.success) {
            const v = resp.data.voucher;
            setVoucherValidation({ valid: v.is_valid, voucher: v, error: v.is_valid ? null : v.message });
            if (!v.is_valid) {
              await swalError("Voucher Error", v.message || "This voucher code is not valid.");
              return;
            }
          }
        } catch (_e) {
          // Non-fatal: proceed without voucher
          setVoucherValidation({ valid: false, error: "Could not verify voucher" });
        }
      } else {
        await swalError("Voucher Error", "Invalid voucher code format. Please remove it or enter a valid code (RHB-XXXX-YYYY).");
        return;
      }
    }

    setCreatingAppointment(true);
    const formData = getValues();
    
    // Send treatment name (item name) as service name for backend compatibility
    // The backend calculateServicePrice function matches by service title or item name
    // Using treatment name ensures accurate price matching
    const serviceName = selectedTreatment 
      ? selectedTreatment.name
      : formData.service;
    
    // Include voucher code if provided and validated
    const bookingData = {
      ...formData,
      service: serviceName, // Send treatment name for accurate price matching
      service_item_id: selectedTreatment?.id || null, // Exact DB id — bypasses fuzzy lookup for voucher eligibility
      duration: formData.duration, // Duration in minutes
      client_gender: formData.client_gender, // Client gender for auto-assignment
      treatment: formData.treatment, // Treatment/service item name for auto-assignment
      voucher_code: voucherCode && voucherCode.trim() !== "" && voucherValidation?.valid
        ? voucherCode.trim()
        : null,
    };

    try {
      const res = await prepareAppointment(bookingData);
      if (res.data && res.data.success) {
        setPaymentBreakdown(res.data.paymentBreakdown || {});
        setStripeCheckoutUrl(res.data.checkoutUrl || null);
        setIntentId(res.data.intentId || null);
        setSelectedGateway(null); // require explicit selection on the payment step
        // Voucher covers full amount — appointment already inserted; skip to confirmation
        if (res.data.paymentRequired === false || Number(res.data.paymentBreakdown?.final_amount) <= 0) {
          setAppointmentData(res.data.appointment || null);
          setActiveStep(4);
        } else {
          // Payment required: show gateway selection first (no auto-redirect)
          if (!res.data.checkoutUrl) {
            await swalError("Payment Error", "Payment session could not be created. Please try again.");
            return;
          }
          setActiveStep(3);
        }
      } else {
        const errorMessage = res.data?.error || "Please try again.";
        // Create a short, meaningful title from the error message
        let errorTitle = "Booking Error";
        if (errorMessage.toLowerCase().includes("not available")) {
          errorTitle = "Not Available";
        } else if (errorMessage.toLowerCase().includes("sorry")) {
          errorTitle = "Unavailable";
        } else if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("required")) {
          errorTitle = "Validation Error";
        } else if (errorMessage.toLowerCase().includes("voucher")) {
          errorTitle = "Voucher Error";
        }

        await swalError(
          errorTitle,
          errorMessage
        );
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Please check your connection and try again.";
      
      // Determine if it's a network/server error or a validation error
      const isNetworkError = !err.response || 
                             err.code === "ECONNABORTED" || 
                             err.code === "ERR_NETWORK" ||
                             err.message?.includes("Network Error") ||
                             err.message?.includes("timeout");
      
      // Create a short, meaningful title
      let errorTitle;
      if (isNetworkError) {
        errorTitle = "Network Error";
      } else {
        // Extract a short title based on error content
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes("not available")) {
          errorTitle = "Not Available";
        } else if (lowerMessage.includes("sorry")) {
          errorTitle = "Unavailable";
        } else if (lowerMessage.includes("invalid") || lowerMessage.includes("required")) {
          errorTitle = "Validation Error";
        } else if (lowerMessage.includes("voucher")) {
          errorTitle = "Voucher Error";
        } else {
          errorTitle = "Booking Error";
        }
      }
      
      await swalError(
        errorTitle,
        errorMessage
      );
    } finally {
      setCreatingAppointment(false);
    }
  };

  const onSubmit = async () => {
    // This is now handled by handleCreateAppointment
    // The form submission happens when moving from step 2 to step 3
  };

  const isStepValid = (step) => {
    if (step === 0) return !errors.full_name && !errors.email && !errors.phone && !errors.client_gender;
    if (step === 1) return !errors.service && !errors.treatment && !errors.duration;
    if (step === 2) return !errors.date && !errors.time;
    if (step === 3) return false; // Payment step handled separately
    return true;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    required
                    placeholder="Enter your full name"
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0 },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    placeholder="your@email.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    required
                    placeholder="(555) 123-4567"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="client_gender"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" error={!!errors.client_gender} fullWidth>
                    <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                      Gender <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <RadioGroup
                      {...field}
                      row
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <FormControlLabel value="male" control={<Radio />} label="Male" />
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                      <FormControlLabel value="other" control={<Radio />} label="Other" />
                    </RadioGroup>
                    {errors.client_gender && (
                      <FormHelperText>{errors.client_gender.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            {servicesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : services.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 0, mb: 3 }}>
                {servicesFetchError || "No services available. Please contact us to book an appointment."}
              </Alert>
            ) : (
              <>
                {/* Service Selection */}
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.service} sx={{ mb: 3 }}>
                      <InputLabel>Select Service Category</InputLabel>
                      <Select
                        {...field}
                        label="Select Service Category"
                        sx={{ borderRadius: 0 }}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset treatment and duration when service changes
                          setValue("treatment", "");
                          setValue("duration", null);
                        }}
                      >
                        {services.map((service) => (
                          <MenuItem key={service.id} value={service.title}>
                            {service.title}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="error">
                        {errors.service?.message}
                      </Typography>
                    </FormControl>
                  )}
                />

                {/* Treatment Selection - Only show if service is selected */}
                {selectedService && selectedService.items && selectedService.items.length > 0 && (
                  <Controller
                    name="treatment"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.treatment} sx={{ mb: 3 }}>
                        <InputLabel>Select Treatment</InputLabel>
                        <Select
                          {...field}
                          label="Select Treatment"
                          sx={{ borderRadius: 0 }}
                          onChange={(e) => {
                            field.onChange(e);
                            // Reset duration when treatment changes
                            setValue("duration", null);
                          }}
                        >
                          {selectedService.items.map((item) => (
                            <MenuItem key={item.id} value={item.name}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <Typography variant="caption" color="error">
                          {errors.treatment?.message}
                        </Typography>
                      </FormControl>
                    )}
                  />
                )}

                {/* Duration & Price Selection - Only show if treatment is selected */}
                {selectedTreatment && selectedTreatment.durations && selectedTreatment.durations.length > 0 && (
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.duration} sx={{ mb: 3 }}>
                        <InputLabel>Select Duration & Price</InputLabel>
                        <Select
                          {...field}
                          label="Select Duration & Price"
                          sx={{ borderRadius: 0 }}
                          value={field.value || ""}
                        >
                          {selectedTreatment.durations
                            .sort((a, b) => a.minutes - b.minutes)
                            .map((duration) => (
                              <MenuItem key={duration.id} value={duration.minutes}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                  <Typography variant="body1">
                                    {duration.minutes} minutes
                                  </Typography>
                                  <Chip
                                    label={`£${parseFloat(duration.price).toFixed(2)}`}
                                    color="primary"
                                    size="small"
                                    icon={<AttachMoneyIcon />}
                                    sx={{
                                      fontWeight: 600,
                                      borderRadius: 1,
                                      ml: 2,
                                    }}
                                  />
                                </Box>
                              </MenuItem>
                            ))}
                        </Select>
                        <Typography variant="caption" color="error">
                          {errors.duration?.message}
                        </Typography>
                      </FormControl>
                    )}
                  />
                )}

                {/* Selected Service Summary Card */}
                {selectedPrice && (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="overline" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 1, 
                            color: "primary.main",
                            letterSpacing: 1,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Selected Service
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 1, 
                            color: "text.primary",
                            fontSize: "1.1rem",
                          }}
                        >
                          {selectedService?.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: "text.secondary", 
                            mb: 1,
                            fontWeight: 500,
                          }}
                        >
                          {selectedTreatment?.name}
                        </Typography>
                        {selectedDuration && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: "text.secondary",
                                fontSize: "0.875rem",
                              }}
                            >
                              ⏱ {selectedDuration.minutes} minutes
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box 
                        sx={{ 
                          textAlign: "right",
                          pl: 2,
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          minWidth: 120,
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "text.secondary", 
                            display: "block", 
                            mb: 0.5,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Total Price
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            fontFamily: '"Raleway", sans-serif',
                            fontSize: "1.75rem",
                          }}
                        >
                          £{selectedPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* Info Box */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    backgroundColor: "grey.50",
                    borderRadius: 0,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If you have a voucher code, you can apply it in the next step (Date & Time).
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="date"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Preferred Date"
                    value={value ? dayjs(value, DATE_FMT) : null}
                    onChange={(v) =>
                      onChange(v ? dayjs(v).format(DATE_FMT) : "")
                    }
                    minDate={dayjs()}
                    onMonthChange={(newMonth) => {
                      if (newMonth) {
                        loadMonthAvailability(newMonth);
                      }
                    }}
                    slots={{
                      day: AvailabilityPickersDay,
                    }}
                    slotProps={{
                      day: { calendarData },
                      textField: {
                        required: true,
                        fullWidth: true,
                        error: !!errors.date,
                        helperText: errors.date?.message,
                        sx: { "& .MuiOutlinedInput-root": { borderRadius: 0 } },
                      },
                    }}
                    shouldDisableDate={(dayValue) => {
                      if (!dayValue) return false;

                      const day = dayValue.startOf("day");
                      const today = dayjs().startOf("day");
                      if (day.isBefore(today, "day")) return true;

                      const year = day.year();
                      const month = day.month() + 1;
                      const key = day.format(DATE_FMT);

                      // Only have data for the currently loaded month
                      if (
                        year !== calendarData.year ||
                        month !== calendarData.month
                      ) {
                        return false;
                      }

                      // Use new availableDates format if available
                      const dateInfo = calendarData.availableDates?.[key];
                      if (dateInfo !== undefined) {
                        return !dateInfo.available; // Disable if not available
                      }

                      // Fallback to legacy format
                      // Blocked by admin
                      if (calendarData.blockedDates[key]) {
                        return true;
                      }

                      const bookings = calendarData.bookedDates[key] || [];

                      // Follow same logic as calendar: fully booked if 5+ bookings
                      if (bookings.length >= 5) {
                        return true;
                      }

                      return false;
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="time"
                control={control}
                render={({ field: { value, onChange } }) => {
                  const selectedDate = getValues("date");
                  const teamMemberId = getValues("team_member_id");
                  
                  // Convert time range to dayjs objects for minTime/maxTime
                  let minTime = null;
                  let maxTime = null;
                  if (teamMemberTimeRange.available && teamMemberTimeRange.start && teamMemberTimeRange.end) {
                    const [startHour, startMin] = teamMemberTimeRange.start.split(":").map(Number);
                    const [endHour, endMin] = teamMemberTimeRange.end.split(":").map(Number);
                    minTime = dayjs().hour(startHour).minute(startMin).second(0);
                    maxTime = dayjs().hour(endHour).minute(endMin).second(0);
                  }

                  // Format time range for display
                  const formatTimeRange = () => {
                    if (!teamMemberTimeRange.available || !teamMemberTimeRange.start || !teamMemberTimeRange.end) {
                      return null;
                    }
                    const [startHour, startMin] = teamMemberTimeRange.start.split(":").map(Number);
                    const [endHour, endMin] = teamMemberTimeRange.end.split(":").map(Number);
                    const start12 = dayjs().hour(startHour).minute(startMin).format("h:mm A");
                    const end12 = dayjs().hour(endHour).minute(endMin).format("h:mm A");
                    return `${start12} - ${end12}`;
                  };

                  const timeRangeDisplay = formatTimeRange();

                  return (
                    <Box>
                      <TimePicker
                        label="Preferred Time"
                        value={value ? dayjs(value, TIME_FMT) : null}
                        onChange={(v) => onChange(v ? v.format(TIME_FMT) : "")}
                        minTime={minTime}
                        maxTime={maxTime}
                        ampm
                        slotProps={{
                          textField: {
                            required: true,
                            fullWidth: true,
                            error: !!errors.time,
                            helperText: errors.time?.message || 
                              (selectedDate
                                ? timeRangeDisplay
                                  ? `Available: ${timeRangeDisplay}`
                                  : "Choose any available time"
                                : "Please select a date first"),
                            disabled: !selectedDate,
                            sx: { "& .MuiOutlinedInput-root": { borderRadius: 0 } },
                          },
                        }}
                      />
                      {teamMemberId && selectedDate && timeRangeDisplay && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Therapist available: {timeRangeDisplay}
                        </Typography>
                      )}
                    </Box>
                  );
                }}
              />
            </Grid>
            {/* Display blocked time slots for selected date */}
            {(() => {
              const selectedDate = watch("date");
              if (!selectedDate) return null;

              // Filter blocked time slots for the selected date
              const dateBlockedSlots = calendarData.blockedTimeSlots?.filter(
                (slot) => {
                  let slotDate = slot.date;
                  if (slotDate instanceof Date) {
                    slotDate = slotDate.toISOString().split("T")[0];
                  } else if (typeof slotDate === "string") {
                    slotDate = slotDate.split("T")[0];
                  }
                  return slotDate === selectedDate && !slot.is_full_day;
                }
              ) || [];

              if (dateBlockedSlots.length === 0) return null;

              // Format blocked time ranges
              const formatTime12Hour = (time24) => {
                if (!time24) return "";
                const [hours, minutes] = time24.split(":").map(Number);
                const period = hours >= 12 ? "pm" : "am";
                const hour12 = hours % 12 || 12;
                return `${hour12}:${String(minutes).padStart(2, "0")}${period}`;
              };

              const blockedRanges = dateBlockedSlots.map((slot) => {
                const start = formatTime12Hour(slot.start_time);
                const end = formatTime12Hour(slot.end_time);
                return { start, end, reason: slot.reason };
              });

              return (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mt: 1, borderRadius: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Blocked Time Slots:
                    </Typography>
                    {blockedRanges.map((range, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {range.start} - {range.end} is not available
                        {range.reason && ` (${range.reason})`}
                      </Typography>
                    ))}
                  </Alert>
                </Grid>
              );
            })()}
            <Grid size={{ xs: 12 }}>
              <VoucherCodeInput
                value={voucherCode}
                onChange={(code, validation) => {
                  setVoucherCode(code);
                  setVoucherValidation(validation);
                  // Update form value
                  setValue("voucher_code", code && code.trim() !== "" ? code.trim() : null);
                }}
                error={voucherValidation && !voucherValidation.valid && voucherCode !== ""}
                helperText={
                  voucherValidation && !voucherValidation.valid && voucherCode !== ""
                    ? voucherValidation.error
                    : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional Notes (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any special requests or notes..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      case 3:
        // Payment Step (Stripe Checkout redirect screen)
        if (!paymentBreakdown) {
          return (
            <Box>
              <Typography>Loading payment details...</Typography>
            </Box>
          );
        }

        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>

              {/* Payment Breakdown */}
              <PaymentBreakdown
                servicePrice={paymentBreakdown.service_price}
                voucherDiscount={paymentBreakdown.voucher_discount_amount || 0}
                finalAmount={paymentBreakdown.final_amount}
                serviceName={getValues("service")}
              />

              <Box sx={{ mb: 3 }}>
                <PaymentGatewaySelector
                  selectedGateway={selectedGateway}
                  onSelect={(gateway) => {
                    setSelectedGateway(gateway);
                    // Don't auto-redirect - user must click Continue button
                  }}
                />
              </Box>

              <StyledButton
                text="Continue to Secure Payment"
                onClick={async () => {
                  if (selectedGateway === "stripe" && stripeCheckoutUrl) {
                    window.location.href = stripeCheckoutUrl;
                  } else if (selectedGateway === "paypal" && intentId) {
                    try {
                      setCreatingAppointment(true);
                      const resp = await createPayPalIntentOrder(intentId);
                      if (resp.data?.success && resp.data?.approvalUrl) {
                        window.location.href = resp.data.approvalUrl;
                      } else {
                        await swalError("Payment Error", resp.data?.error || "Failed to create PayPal payment session.");
                      }
                    } catch (err) {
                      await swalError("Payment Error", err.response?.data?.error || err.message || "Failed to create payment session.");
                    } finally {
                      setCreatingAppointment(false);
                    }
                  }
                }}
                variant="secondary"
                isDisabled={!selectedGateway || (selectedGateway === "stripe" && !stripeCheckoutUrl) || (selectedGateway === "paypal" && !intentId)}
                loading={creatingAppointment && selectedGateway === "paypal"}
                loadingText="Please wait..."
                sx={{ mb: 2 }}
              />

              <Alert severity="info" sx={{ borderRadius: 0, mt: 1 }}>
                Please select a payment method above to continue.
              </Alert>
            </Grid>
          </Grid>
        );
      case 4:
        // Confirmation Step - Waiting for Payment Verification
        return (
          <PaymentConfirmationStep
            appointmentData={appointmentData}
            paymentRequired={Number(paymentBreakdown?.final_amount || 0) > 0}
            onReturnHome={() => {
              if (onComplete) onComplete();
              else navigate("/");
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 900, mx: "auto", my: isModal ? 0 : 6, px: { xs: 2, md: 0 } }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          {!isModal && (
            <InfoSection
              subtitle="Book Your Appointment"
              title="Schedule an Appointment Today"
              description="Ready to book your appointment? Simply fill out the form below and we'll be in touch to confirm your appointment time."
              align="center"
              btnAlign="center"
            />
          )}

          <Stepper
            activeStep={activeStep}
            orientation={isMobile ? "vertical" : "horizontal"}
            alternativeLabel={!isMobile}
            sx={{ mb: 4, mt: 6 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <StyledButton
                text="Back"
                onClick={handleBack}
                variant="secondary"
                isDisabled={activeStep === 0}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                {activeStep === steps.length - 1 ? (
                  // Confirmation step - show return home button
                  <StyledButton
                    text={isModal ? "Close" : "Return to Home"}
                    onClick={() => { if (onComplete) onComplete(); else navigate("/"); }}
                    variant="secondary"
                    sx={{ borderRadius: 0, px: 4 }}
                  />
                ) : activeStep === 3 ? (
                  // Payment step - no next button (handled by PaymentUploadForm)
                  null
                ) : (
                  <StyledButton
                    text="Next"
                    onClick={handleNext}
                    variant="secondary"
                isDisabled={!isStepValid(activeStep) || creatingAppointment}
                sx={{ borderRadius: 0, px: 4, minWidth: 140 }}
                loading={creatingAppointment}
                loadingText="Please wait..."
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

      </Box>
    </LocalizationProvider>
  );
}
