import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { requestVoucher } from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

const validationSchema = yup.object({
  name: yup
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
});

/**
 * VoucherRequestForm Component
 * Modal form for requesting a voucher
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.voucherId - Voucher ID to request
 */
export default function VoucherRequestForm({ open, onClose, voucherId }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    if (!voucherId) {
      setError("Please visit our Vouchers page to select a voucher first.");
      return;
    }

    // Prevent double submission
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await ensureSweetAlertReady();

      const response = await requestVoucher({
        voucher_id: voucherId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      if (response.data && response.data.success) {
        const emailSent = response.data.email_sent !== false;
        const voucherCode = response.data.voucher_code;
        
        // Close dialog first so alert can display properly
        reset();
        setError(null);
        if (onClose) {
          onClose();
        }
        
        // Show success alert after dialog is closed
        setTimeout(async () => {
          try {
            await swalSuccess(
              "Voucher Code Sent!",
              emailSent
                ? `Please check your email at ${data.email}. If you don't see it, please check your spam/junk folder.`
                : `Your voucher code is: ${voucherCode || 'N/A'}. Please check your email (including spam folder) at ${data.email}.`
            );
          } catch (swalErr) {
            // Error handled silently
          }
        }, 100);
      } else {
        const errorMsg = response.data?.error || "Failed to request voucher";
        setError(errorMsg);
        setSubmitting(false); // Ensure submitting is false when error is shown
        // Close dialog first, then show error
        setTimeout(async () => {
          try {
            await swalError("Request Failed", errorMsg);
          } catch (swalErr) {
            // Error handled silently
          }
        }, 100);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to request voucher. Please try again.";
      setError(errorMessage);
      setSubmitting(false); // Ensure submitting is false when error is shown
      // Close dialog first, then show error
      setTimeout(async () => {
        try {
          await swalError("Request Failed", errorMessage);
        } catch (swalErr) {
          // Error showing alert - silently fail
        }
      }, 100);
    } finally {
      // Always stop loading state
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
        },
      }}
    >
      <DialogTitle>
        <Box>
          <Typography component="span" variant="h6" sx={{ fontWeight: 600, display: "block" }}>
            Request Voucher
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Fill in your details to receive your voucher code via email.
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box 
          component="form" 
          id="voucher-request-form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 2 }}
        >
          {!voucherId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please visit our{" "}
              <Link
                href="/vouchers"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/vouchers";
                }}
                sx={{ color: "primary.main", textDecoration: "underline" }}
              >
                Vouchers page
              </Link>{" "}
              to select a voucher first.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  required
                  placeholder="Enter your full name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
              )}
            />

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
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            borderRadius: 0,
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="voucher-request-form"
          variant="contained"
          disabled={submitting || !voucherId}
          sx={{
            borderRadius: 0,
            backgroundColor: "secondary.main",
            px: 4,
            "&:hover": {
              backgroundColor: "secondary.dark",
            },
            "&:disabled": {
              backgroundColor: "action.disabledBackground",
            },
          }}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
              Requesting...
            </>
          ) : (
            "Request Voucher"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

