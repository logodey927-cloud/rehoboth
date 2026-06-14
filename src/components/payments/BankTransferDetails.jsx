import React from "react";
import { Box, Typography, Paper, Alert, Divider } from "@mui/material";
import { AccountBalance, Payment } from "@mui/icons-material";

/**
 * BankTransferDetails Component
 * Reusable component to display bank transfer instructions
 * Shows bank account details AFTER payment amount
 * 
 * @param {object} props
 * @param {string} props.reference - Bank transfer reference number
 * @param {number} props.amount - Amount to pay
 */
export default function BankTransferDetails({ reference, amount }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: "#ffffff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <AccountBalance sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          Bank Transfer Instructions
        </Typography>
      </Box>

      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3, 
          color: "text.secondary",
          fontSize: "0.875rem",
        }}
      >
        Please transfer the amount above to the following account:
      </Typography>

      {/* Bank Account Details */}
      <Box
        sx={{
          bgcolor: "grey.50",
          p: 2.5,
          borderRadius: 2,
          mb: 2.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            Account Details
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
                minWidth: 120,
              }}
            >
              Account Name:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.primary",
                fontWeight: 600,
                textAlign: "right",
                flex: 1,
              }}
            >
              REHOBOTH WELLNESS CLINIC AND PROPERTY VENTURES LTD
            </Typography>
          </Box>
          
          <Divider />
          
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Account Number:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.primary",
                fontWeight: 600,
                fontFamily: "monospace",
                fontSize: "1rem",
              }}
            >
              76899762
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Sort Code:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.primary",
                fontWeight: 600,
                fontFamily: "monospace",
                fontSize: "1rem",
              }}
            >
              309950
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Bank:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              LLOYDS BANK
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Payment Amount & Reference */}
      <Box
        sx={{
          bgcolor: "grey.50",
          p: 2.5,
          borderRadius: 2,
          mb: 2.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Payment sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            Payment Information
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Amount to Pay:
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "primary.main",
                fontWeight: 700,
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              £{amount.toFixed(2)}
            </Typography>
          </Box>
          
          <Divider sx={{ borderColor: "primary.main", opacity: 0.3 }} />
          
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              Reference Number:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: "text.primary",
                fontWeight: 600,
                fontFamily: "monospace",
                fontSize: "1rem",
                wordBreak: "break-all",
              }}
            >
              {reference}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Important Notice */}
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 2,
          backgroundColor: "#fff",
          "& .MuiAlert-icon": {
            color: "info.main",
          },
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          <strong>Important:</strong> Please include the reference number{" "}
          <strong style={{ fontFamily: "monospace" }}>{reference}</strong> in your transfer notes. 
          Your appointment will be confirmed after we verify your payment.
        </Typography>
      </Alert>
    </Paper>
  );
}

