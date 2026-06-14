import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import UnderlinedInput from "./UnderlinedInput";
import StyledButton from "./StyledButton";
import { submitContactForm } from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

// Validation schema
const schema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .required("First Name is required"),
  lastName: yup
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .required("Last Name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .test("phone-format", "Invalid phone number format", (value) => {
      if (!value || value.trim() === "") return true; // Optional field
      return /^[0-9+()-\s]{7,}$/.test(value);
    }),
  message: yup
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .required("Message is required"),
});

const ContactForm = ({ headline, BgImg, btnText }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
    resolver: yupResolver(schema),
    mode: "onSubmit", // Validate on submit to show errors immediately
    reValidateMode: "onChange", // Re-validate on change after first error
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await ensureSweetAlertReady();
    
    try {
      const res = await submitContactForm(data);
      if (res.data && res.data.success) {
        await swalSuccess(
          "Message sent!",
          "Thank you for contacting us. We'll get back to you soon!"
        );
        reset(); // Clear form after successful submission
      } else {
        await swalError(
          "Failed to send message",
          res.data?.error || "Please try again."
        );
      }
    } catch (err) {
      await swalError(
        "Network or server error",
        err.response?.data?.error ||
          err.message ||
          "Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission with proper validation
  const handleFormSubmit = handleSubmit(
    async (data) => {
      await onSubmit(data);
    },
    async (validationErrors) => {
      // This callback runs when validation fails
      
      // Scroll to first error field
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey) {
        const errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        }
      }
      
      await ensureSweetAlertReady();
      
      // Get all error messages
      const errorMessages = Object.values(validationErrors)
        .map(err => err?.message)
        .filter(Boolean);
      
      const errorMessage = errorMessages.length > 0
        ? errorMessages[0] // Show first error
        : "Please fill in all required fields correctly.";
      
      await swalError(
        "Validation Error",
        errorMessage
      );
    }
  );

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        backgroundImage: `url(${BgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: { xs: 6, md: 6, lg: 8 },
        px: { xs: 3, md: 5, lg: 8 },
        backgroundColor: "transparent",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          mb: 1,
          color: "#1a1f2e",
          fontWeight: 400,
          fontSize: "2.5rem",
          fontFamily: '"Raleway", sans-serif',
        }}
      >
        {headline}
      </Typography>

      <Box
        component="form"
        onSubmit={handleFormSubmit}
        noValidate
        sx={{ maxWidth: 800, mx: "auto" }}
      >
        <Grid container spacing={2}>
          {["firstName", "lastName", "email", "phone", "message"].map(
            (field) => (
              <Grid size={{ xs: 12 }} key={field}>
                <Controller
                  name={field}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <UnderlinedInput
                      {...controllerField}
                      onBlur={() => {
                        controllerField.onBlur();
                        trigger(field);
                      }}
                      label={
                        field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")
                      }
                      type={
                        field === "email"
                          ? "email"
                          : field === "phone"
                          ? "tel"
                          : "text"
                      }
                      multiline={field === "message"}
                      rows={field === "message" ? 4 : undefined}
                      required={field !== "phone"}
                      error={!!errors[field] || !!fieldState.error}
                      helperText={errors[field]?.message || fieldState.error?.message || ""}
                    />
                  )}
                />
              </Grid>
            )
          )}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <StyledButton 
            type="submit" 
            text={isSubmitting ? "Sending..." : btnText || "Send Message"} 
            variant="seconda.dark"
            isDisabled={isSubmitting}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ContactForm;
