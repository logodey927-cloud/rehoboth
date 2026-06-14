import React, { useState } from "react";
import {
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { verifyVoucherCode } from "../../api/api";

/**
 * VoucherCodeInput Component
 * Reusable component for entering and validating voucher codes
 * 
 * @param {Object} props
 * @param {string} props.value - Current voucher code value
 * @param {Function} props.onChange - Change handler (receives code and validation result)
 * @param {boolean} props.error - Whether there's an error
 * @param {string} props.helperText - Helper text to display
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.autoValidate - Whether to validate automatically on blur
 */
export default function VoucherCodeInput({
  value = "",
  onChange,
  error = false,
  helperText,
  disabled = false,
  autoValidate = true,
}) {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [localError, setLocalError] = useState(null);

  const handleBlur = async () => {
    if (!autoValidate || !value || value.trim() === "") {
      return;
    }

    const code = value.trim().toUpperCase();
    
    // Basic format validation (RHB-XXXX-YYYY)
    const formatRegex = /^RHB-[A-Z0-9]{4}-\d{4}$/;
    if (!formatRegex.test(code)) {
      setLocalError("Invalid voucher code format. Format: RHB-XXXX-YYYY");
      setValidationResult(null);
      if (onChange) {
        onChange(code, { valid: false, error: "Invalid format" });
      }
      return;
    }

    // Validate with API
    try {
      setValidating(true);
      setLocalError(null);
      const response = await verifyVoucherCode(code);
      
      if (response.data && response.data.success) {
        const voucher = response.data.voucher;
        setValidationResult({
          valid: voucher.is_valid,
          voucher: voucher,
          message: voucher.message,
        });
        if (onChange) {
          onChange(code, {
            valid: voucher.is_valid,
            voucher: voucher,
            error: voucher.is_valid ? null : voucher.message,
          });
        }
      } else {
        setValidationResult({
          valid: false,
          message: response.data?.error || "Voucher code not found",
        });
        setLocalError(response.data?.error || "Voucher code not found");
        if (onChange) {
          onChange(code, {
            valid: false,
            error: response.data?.error || "Voucher code not found",
          });
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to verify voucher code";
      setValidationResult({
        valid: false,
        message: errorMsg,
      });
      setLocalError(errorMsg);
      if (onChange) {
        onChange(code, { valid: false, error: errorMsg });
      }
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    setValidationResult(null);
    setLocalError(null);
    if (onChange) {
      onChange(newValue, null);
    }
  };

  const displayError = error || localError;
  const displayHelperText = helperText || localError;

  return (
    <Box>
      <TextField
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        label="Voucher Code (Optional)"
        placeholder="RHB-XXXX-YYYY"
        fullWidth
        disabled={disabled || validating}
        error={!!displayError}
        helperText={displayHelperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {validating ? (
                <CircularProgress size={20} />
              ) : validationResult?.valid ? (
                <CheckCircleIcon color="success" />
              ) : validationResult && !validationResult.valid ? (
                <ErrorIcon color="error" />
              ) : null}
            </InputAdornment>
          ),
        }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
      />
      {validationResult?.voucher &&
        (validationResult.voucher.title ||
          validationResult.voucher.code ||
          validationResult.voucher.discount_type) && (
        <Alert
          severity={validationResult.valid ? "success" : "warning"}
          sx={{ mt: 1, borderRadius: 0 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {validationResult.valid ? "Voucher Valid! " : "Voucher Not Applied. "}
            {validationResult.voucher.discount_type === "percent" 
              ? `${validationResult.voucher.discount_value}% OFF`
              : validationResult.voucher.discount_type === "amount"
              ? `£${validationResult.voucher.discount_value} OFF`
              : "Special Offer"}
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            {validationResult.message ||
              (validationResult.valid
                ? "This voucher will be applied to your booking."
                : "This voucher cannot be applied right now.")}
          </Typography>

          {/* Eligible treatments (from API) */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
              Eligible Treatments:
            </Typography>
            {Array.isArray(validationResult.voucher.eligible_services) &&
            validationResult.voucher.eligible_services.length > 0 ? (
              <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                {validationResult.voucher.eligible_services.map((s) => (
                  <li key={s.id || s.title}>
                    <Typography variant="caption">
                      {s.title}
                      {s.is_active === false ? " (currently unavailable)" : ""}
                    </Typography>
                  </li>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ display: "block" }}>
                All treatments (no restrictions).
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
}

