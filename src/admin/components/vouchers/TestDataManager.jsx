import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  CheckCircle,
  Error as ErrorIcon,
  SkipNext,
  PlayArrow,
} from "@mui/icons-material";
import { createVoucher } from "../../../api/api";
import { swalSuccess, swalError, ensureSweetAlertReady } from "../../../utils/swal";

/**
 * TestDataManager Component
 * Reusable component for creating test vouchers
 * 
 * @param {Object} props
 * @param {Function} props.onComplete - Callback after test data creation
 * @param {boolean} props.showDetails - Whether to show detailed results
 */
export default function TestDataManager({ onComplete, showDetails = true }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const testVouchers = [
    {
      title: "Summer Special",
      description: "Get 20% off all services during summer months. Perfect for relaxing and rejuvenating!",
      voucher_type: "promo",
      discount_type: "percent",
      discount_value: "20",
      validity_start: "2025-06-01T00:00:00.000Z",
      validity_end: "2025-08-31T23:59:59.000Z",
      allowed_days: {
        Mon: [10, 11, 12, 13, 14, 15, 16],
        Tue: [10, 11, 12, 13, 14, 15, 16],
        Wed: [10, 11, 12, 13, 14, 15, 16],
        Thu: [10, 11, 12, 13, 14, 15, 16],
        Fri: [10, 11, 12, 13, 14, 15, 16],
      },
      first_time_only: false,
      usage_limit: 1,
      status: "active",
      image_front_url: "https://via.placeholder.com/600x300/FF6B6B/FFFFFF?text=Summer+Special+20%25+OFF",
      image_back_url: "https://via.placeholder.com/600x300/FF6B6B/FFFFFF?text=Summer+Special+Back",
    },
    {
      title: "Gift Card",
      description: "Perfect gift for your loved ones! £50 off any service. Valid any day and time.",
      voucher_type: "gift",
      discount_type: "amount",
      discount_value: "50",
      validity_start: "2025-01-01T00:00:00.000Z",
      validity_end: "2025-12-31T23:59:59.000Z",
      allowed_days: null,
      first_time_only: false,
      usage_limit: 1,
      status: "active",
      image_front_url: "https://via.placeholder.com/600x300/4ECDC4/FFFFFF?text=Gift+Card+£50+OFF",
      image_back_url: "https://via.placeholder.com/600x300/4ECDC4/FFFFFF?text=Gift+Card+Back",
    },
    {
      title: "Free Swedish Massage",
      description: "First-time clients only! Get a free Swedish Massage. Available Tuesday to Thursday, 10 AM to 2 PM.",
      voucher_type: "promo",
      discount_type: "free_service",
      discount_value: "Swedish Massage",
      validity_start: "2025-05-01T00:00:00.000Z",
      validity_end: "2025-05-31T23:59:59.000Z",
      allowed_days: {
        Tue: [10, 11, 12, 13, 14],
        Wed: [10, 11, 12, 13, 14],
        Thu: [10, 11, 12, 13, 14],
      },
      first_time_only: true,
      usage_limit: 1,
      status: "active",
      image_front_url: "https://via.placeholder.com/600x300/95E1D3/FFFFFF?text=Free+Swedish+Massage",
      image_back_url: "https://via.placeholder.com/600x300/95E1D3/FFFFFF?text=Free+Service+Back",
    },
    {
      title: "Weekend Special",
      description: "Enjoy 15% off all services on weekends! Perfect way to unwind after a busy week.",
      voucher_type: "promo",
      discount_type: "percent",
      discount_value: "15",
      validity_start: "2025-06-01T00:00:00.000Z",
      validity_end: "2025-12-31T23:59:59.000Z",
      allowed_days: {
        Sat: [10, 11, 12, 13, 14, 15, 16],
        Sun: [10, 11, 12, 13, 14, 15, 16],
      },
      first_time_only: false,
      usage_limit: 2,
      status: "active",
      image_front_url: "https://via.placeholder.com/600x300/F38181/FFFFFF?text=Weekend+Special+15%25+OFF",
      image_back_url: "https://via.placeholder.com/600x300/F38181/FFFFFF?text=Weekend+Special+Back",
    },
  ];

  const handleCreateTestData = async () => {
    setLoading(true);
    setResults(null);
    await ensureSweetAlertReady();

    const results = {
      success: [],
      failed: [],
      skipped: [],
    };

    for (const voucher of testVouchers) {
      try {
        const response = await createVoucher(voucher);
        if (response.data?.success) {
          results.success.push({
            title: voucher.title,
            id: response.data.voucher?.id,
          });
        } else {
          const errorMsg = response.data?.error || "Unknown error";
          // Check if it's a duplicate error
          if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
            results.skipped.push({ title: voucher.title, reason: "Already exists" });
          } else {
            results.failed.push({ title: voucher.title, error: errorMsg });
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || "Unknown error";
        // Check if it's a duplicate error
        if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
          results.skipped.push({ title: voucher.title, reason: "Already exists" });
        } else {
          results.failed.push({ title: voucher.title, error: errorMsg });
        }
      }
    }

    setResults(results);
    setLoading(false);

    const totalCreated = results.success.length;
    const totalFailed = results.failed.length;
    const totalSkipped = results.skipped.length;

    if (totalFailed === 0) {
      await swalSuccess(
        "Test Data Created!",
        `Successfully created ${totalCreated} voucher(s). ${totalSkipped > 0 ? `${totalSkipped} already existed.` : ""}`
      );
    } else {
      await swalError(
        "Partial Success",
        `Created ${totalCreated} voucher(s), but ${totalFailed} failed. Check details below.`
      );
    }

    if (onComplete) {
      onComplete(results);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle color="success" />;
      case "failed":
        return <ErrorIcon color="error" />;
      case "skipped":
        return <SkipNext color="warning" />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 0 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Test Data Manager
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create 4 test vouchers for development and testing purposes.
      </Typography>

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
        onClick={handleCreateTestData}
        disabled={loading}
        sx={{
          borderRadius: 0,
          backgroundColor: "secondary.main",
          "&:hover": {
            backgroundColor: "secondary.dark",
          },
          mb: 3,
        }}
      >
        {loading ? "Creating Test Vouchers..." : "Create Test Vouchers"}
      </Button>

      {results && showDetails && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Chip
              label={`Created: ${results.success.length}`}
              color="success"
              sx={{ borderRadius: 0 }}
            />
            <Chip
              label={`Skipped: ${results.skipped.length}`}
              color="warning"
              sx={{ borderRadius: 0 }}
            />
            {results.failed.length > 0 && (
              <Chip
                label={`Failed: ${results.failed.length}`}
                color="error"
                sx={{ borderRadius: 0 }}
              />
            )}
          </Box>

          {results.success.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Successfully Created:
              </Typography>
              <List dense sx={{ bgcolor: "success.light", borderRadius: 0, p: 1 }}>
                {results.success.map((item, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getResultIcon("success")}
                    </ListItemIcon>
                    <ListItemText primary={item.title} secondary={item.id} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {results.skipped.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Skipped (Already Exists):
              </Typography>
              <List dense sx={{ bgcolor: "warning.light", borderRadius: 0, p: 1 }}>
                {results.skipped.map((item, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getResultIcon("skipped")}
                    </ListItemIcon>
                    <ListItemText primary={item.title} secondary={item.reason} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {results.failed.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Failed:
              </Typography>
              <List dense sx={{ bgcolor: "error.light", borderRadius: 0, p: 1 }}>
                {results.failed.map((item, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getResultIcon("failed")}
                    </ListItemIcon>
                    <ListItemText primary={item.title} secondary={item.error} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      {!results && !loading && (
        <Alert severity="info" sx={{ borderRadius: 0, mt: 2 }}>
          Click the button above to create test vouchers. This will create 4 test vouchers:
          Summer Special, Gift Card, Free Swedish Massage, and Weekend Special.
        </Alert>
      )}
    </Paper>
  );
}

