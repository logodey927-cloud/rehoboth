import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress, Alert } from "@mui/material";
import { getMyProfile, updateMyProfile, getMyAppointments, getMyVouchers, unwrapApiData } from "../../api/api";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { swalSuccess, swalError } from "../../utils/swal";

import PersonalInfoCard from "../../components/profile/PersonalInfoCard";
import RecentAppointmentsCard from "../../components/profile/RecentAppointmentsCard";
import UpcomingAppointmentWidget from "../../components/profile/UpcomingAppointmentWidget";
import VoucherWidget from "../../components/profile/VoucherWidget";
import QuickLinksWidget from "../../components/profile/QuickLinksWidget";
import NotificationsPreviewCard from "../../components/profile/NotificationsPreviewCard";
import MessagesPreviewCard from "../../components/profile/MessagesPreviewCard";
import BookingModal from "../../components/booking/BookingModal";
import { quickLinks } from "../../data/profileData";

function userToForm(u) {
  return {
    first_name: u?.first_name || "",
    last_name: u?.last_name || "",
    phone: u?.phone || "",
    gender: u?.gender || "",
    date_of_birth: u?.date_of_birth || "",
    address: u?.address || "",
    avatar_url: u?.avatar_url || "",
  };
}


export default function MyProfilePage() {
  const { accessToken, user, updateUser } = useUserAuth();
  const { notifications } = useNotifications();

  const [form, setForm] = useState(() => userToForm(user));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setProfileLoading(false);
      if (user) setForm(userToForm(user));
      return;
    }

    getMyProfile(accessToken)
      .then((res) => {
        if (res.data?.success) {
          const u = res.data.user ?? unwrapApiData(res);
          if (u) {
            setForm(userToForm(u));
            updateUser(u);
            setProfileError("");
          }
        }
      })
      .catch(() => {
        if (user) {
          setForm(userToForm(user));
          setProfileError("");
        } else {
          setProfileError("Failed to load profile.");
        }
      })
      .finally(() => setProfileLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per session token
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setDataLoading(false);
      return;
    }

    Promise.allSettled([
      getMyAppointments(accessToken),
      getMyVouchers(accessToken),
    ]).then(([apptResult, voucherResult]) => {
      if (apptResult.status === "fulfilled") {
        setAppointments(apptResult.value.data?.appointments ?? []);
      }
      if (voucherResult.status === "fulfilled") {
        setVouchers(voucherResult.value.data?.vouchers ?? []);
      }
      if (apptResult.status === "rejected" && voucherResult.status === "rejected") {
        setDataError("Failed to load dashboard data. Please refresh.");
      } else {
        setDataError("");
      }
    }).finally(() => setDataLoading(false));
  }, [accessToken]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (url) => {
    setForm((prev) => ({ ...prev, avatar_url: url }));
    updateUser({ ...user, avatar_url: url });
  };

  const handleRemoveAvatar = async () => {
    if (!accessToken) return;
    try {
      const res = await updateMyProfile(accessToken, { avatar_url: null });
      if (res.data?.success) {
        const u = res.data.user ?? unwrapApiData(res);
        updateUser(u);
        setForm(userToForm(u));
      }
    } catch {
      setForm((prev) => ({ ...prev, avatar_url: "" }));
      updateUser({ ...user, avatar_url: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address?.trim() || form.address.trim().length < 5) {
      setProfileError("Please enter a valid address (at least 5 characters).");
      return;
    }
    setSaving(true);
    setProfileError("");
    try {
      const payload = {
        ...form,
        avatar_url: form.avatar_url || null,
      };
      const res = await updateMyProfile(accessToken, payload);
      if (res.data?.success) {
        const u = res.data.user ?? unwrapApiData(res);
        updateUser(u);
        setForm(userToForm(u));
        setEditing(false);
        swalSuccess("Profile Updated", "Your profile has been saved successfully.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update profile.";
      setProfileError(msg);
      swalError("Update Failed", msg);
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading && dataLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const upcoming =
    appointments.find((a) => !["completed", "cancelled", "client_completed", "rejected"].includes(a.status)) || null;

  return (
    <Box>
      <Box data-aos="fade-down" data-aos-duration="600" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color="secondary.dark"
          sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
        >
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your personal information and account preferences.
        </Typography>
      </Box>

      {dataError && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
          {dataError}
        </Alert>
      )}

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          <PersonalInfoCard
            user={user}
            accessToken={accessToken}
            form={form}
            email={user?.email}
            editing={editing}
            saving={saving}
            error={profileError}
            onEdit={() => setEditing((prev) => !prev)}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onAvatarChange={handleAvatarChange}
            onRemoveAvatar={handleRemoveAvatar}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <UpcomingAppointmentWidget appointment={upcoming} onBookNow={() => setBookingOpen(true)} />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex" }} data-aos="fade-up" data-aos-delay="150" data-aos-duration="600">
          <Box sx={{ width: "100%", display: "flex" }}>
            <RecentAppointmentsCard appointments={appointments} fullHeight onBookNow={() => setBookingOpen(true)} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex" }} data-aos="fade-up" data-aos-delay="250" data-aos-duration="600">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "100%",
              height: "100%",
            }}
          >
            <VoucherWidget vouchers={vouchers} />
            <QuickLinksWidget
              links={quickLinks.map((link) =>
                link.id === "book"
                  ? { ...link, onClick: () => setBookingOpen(true), path: undefined }
                  : link
              )}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} data-aos="fade-up" data-aos-delay="100" data-aos-duration="600">
          <NotificationsPreviewCard notifications={notifications} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
          <MessagesPreviewCard />
        </Grid>
      </Grid>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialStep={1}
        title="Book New Appointment"
      />
    </Box>
  );
}
