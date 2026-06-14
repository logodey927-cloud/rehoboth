import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { verifyVoucherCodeAdmin } from "../../api/api";
import VoucherStatusEditor from "../components/vouchers/VoucherStatusEditor";
import VoucherQrScanner from "../components/vouchers/VoucherQrScanner";

export default function VoucherVerifyPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voucherIssue, setVoucherIssue] = useState(null);
  const initialCodeHandled = useRef(false);

  const handleSearch = useCallback(async (searchCode = null) => {
    let codeToSearch = searchCode;
    
    // If no searchCode provided, use the input field value
    if (!codeToSearch) {
      codeToSearch = code;
    }
    
    // Extract string value - handle if it's an object or nested property
    let codeString = "";
    if (typeof codeToSearch === "string") {
      codeString = codeToSearch.trim().toUpperCase();
    } else if (codeToSearch && typeof codeToSearch === "object") {
      // If it's an object, try to extract the code property
      codeString = (codeToSearch.code || codeToSearch.toString() || "").toString().trim().toUpperCase();
    } else {
      codeString = String(codeToSearch || "").trim().toUpperCase();
    }
    
    if (!codeString || codeString === "[OBJECT OBJECT]") {
      setError("Please enter a valid voucher code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Don't clear voucherIssue immediately - keep it until new data loads

      const response = await verifyVoucherCodeAdmin(codeString);
      
      if (response.data?.success) {
        setVoucherIssue(response.data.issue);
        // Update the code input to match the searched code
        setCode(codeString);
      } else {
        setError(response.data?.error || "Voucher code not found");
        setVoucherIssue(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to verify voucher code. Please try again."
      );
      setVoucherIssue(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    const fromUrl = searchParams.get("code");
    if (fromUrl && !initialCodeHandled.current) {
      initialCodeHandled.current = true;
      handleSearch(fromUrl);
    }
  }, [searchParams, handleSearch]);

  const handleRefresh = () => {
    // Refresh using the current voucher issue code if available
    let codeToRefresh = null;
    
    if (voucherIssue?.code) {
      // Extract code from voucherIssue - ensure it's a string
      if (typeof voucherIssue.code === "string") {
        codeToRefresh = voucherIssue.code;
      } else if (typeof voucherIssue.code === "object" && voucherIssue.code.code) {
        codeToRefresh = voucherIssue.code.code;
      } else {
        codeToRefresh = String(voucherIssue.code);
      }
    } else if (code && code.trim()) {
      codeToRefresh = code.trim();
    }
    
    if (codeToRefresh && codeToRefresh !== "[object Object]") {
      handleSearch(codeToRefresh);
    } else {
      setError("Unable to refresh: invalid voucher code");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDiscount = (voucher) => {
    if (!voucher) return "-";
    if (voucher.discount_type === "percent") {
      return `${voucher.discount_value}% OFF`;
    } else if (voucher.discount_type === "amount") {
      return `£${voucher.discount_value} OFF`;
    } else if (voucher.discount_type === "free_service") {
      return "FREE SERVICE";
    }
    return "SPECIAL OFFER";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      issued: { bg: "#2196f315", color: "#2196f3" },
      reserved: { bg: "#ff980015", color: "#ff9800" },
      client_completed: { bg: "#f58c0015", color: "#f58c00" },
      used: { bg: "#4caf5015", color: "#4caf50" },
      expired: { bg: "#9e9e9e15", color: "#9e9e9e" },
    };
    return statusColors[status] || { bg: "#e0e0e0", color: "#757575" };
  };

  const renderEligibleTreatments = (voucher) => {
    if (!voucher) return null;
    const raw = voucher.eligible_services;

    // If controller populated full service objects
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object") {
      const titles = raw
        .map((s) => s?.title || s?.name || s?.id)
        .filter(Boolean);
      if (titles.length === 0) return "—";
      return titles.join(", ");
    }

    // If stored as JSONB array of ids (strings) or empty array
    if (Array.isArray(raw)) {
      return raw.length > 0 ? raw.join(", ") : "All treatments (no restrictions)";
    }

    // If stored as string / unknown
    if (typeof raw === "string" && raw.trim()) return raw.trim();

    return "All treatments (no restrictions)";
  };

  return (
    <Box>
      <HeroPageSection
        title="Voucher Verification"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Voucher Verification" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4 }}>
        <VoucherQrScanner onScan={handleSearch} disabled={loading} />

        <Paper sx={{ p: 4, borderRadius: 0, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Search Voucher Code
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Voucher Code"
              placeholder="Enter voucher code (e.g., RHB-A1B2-2025)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              InputProps={{
                sx: { fontFamily: "monospace", textTransform: "uppercase" },
              }}
            />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              // Wrap to avoid passing the click event into handleSearch
              onClick={() => handleSearch()}
              disabled={loading || !code.trim()}
              sx={{
                borderRadius: 0,
                minWidth: 150,
                backgroundColor: "secondary.main",
                "&:hover": {
                  backgroundColor: "secondary.dark",
                },
              }}
            >
              Verify
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 0, mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {voucherIssue && (
          <Paper sx={{ p: 4, borderRadius: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Voucher Details
              </Typography>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading || !voucherIssue}
                sx={{
                  borderRadius: 0,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                Refresh
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Voucher Code
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontFamily: "monospace", mb: 2 }}
                >
                  {voucherIssue.code}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={voucherIssue.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(voucherIssue.status).bg,
                        color: getStatusColor(voucherIssue.status).color,
                        fontWeight: 500,
                        borderRadius: 0,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                  {voucherIssue.id && (
                    <VoucherStatusEditor
                      voucherIssueId={voucherIssue.id}
                      currentStatus={voucherIssue.status}
                      onStatusUpdate={handleRefresh}
                    />
                  )}
                </Box>
              </Grid>

              {voucherIssue.vouchers && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Voucher Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Title
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {voucherIssue.vouchers.title}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Discount
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "secondary.main", mb: 2 }}>
                      {formatDiscount(voucherIssue.vouchers)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Validity Period
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(voucherIssue.vouchers.validity_start)} -{" "}
                      {formatDate(voucherIssue.vouchers.validity_end)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Eligible Treatments
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {renderEligibleTreatments(voucherIssue.vouchers)}
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Client Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Client Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {voucherIssue.client_name}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {voucherIssue.client_email}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {voucherIssue.client_phone || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Issued At
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(voucherIssue.issued_at)}
                </Typography>
              </Grid>

              {voucherIssue.used_at && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Used At
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(voucherIssue.used_at)}
                  </Typography>
                </Grid>
              )}

              {voucherIssue.booking_id && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Booking ID
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "monospace", fontSize: "0.875rem", mb: 2 }}
                  >
                    {voucherIssue.booking_id}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

