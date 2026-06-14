import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import HeroPageSection from "../../components/sections/HeroPageSection";
import { getVoucherByIdAdmin, getVoucherIssues } from "../../api/api";
import VoucherIssuesTable from "../components/vouchers/VoucherIssuesTable";

export default function VoucherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [voucher, setVoucher] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "history" ? 1 : 0
  );

  useEffect(() => {
    fetchVoucher();
    if (activeTab === 1) {
      fetchIssues();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 1 && voucher) {
      fetchIssues();
    }
  }, [activeTab]);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      const response = await getVoucherByIdAdmin(id);
      if (response.data?.success) {
        setVoucher(response.data.voucher);
      } else {
        setError("Failed to load voucher");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      setIssuesLoading(true);
      const response = await getVoucherIssues(id);
      if (response.data?.success) {
        setIssues(response.data.issues || []);
      }
    } catch {
      // silently ignore — loading state cleared in finally
    } finally {
      setIssuesLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDiscount = (voucher) => {
    if (voucher.discount_type === "percent") {
      return `${voucher.discount_value}% OFF`;
    } else if (voucher.discount_type === "amount") {
      return `£${voucher.discount_value} OFF`;
    } else if (voucher.discount_type === "free_service") {
      return "FREE SERVICE";
    } else if (voucher.discount_type === "full_coverage") {
      return "FULL COVERAGE";
    }
    return "SPECIAL OFFER";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !voucher) {
    return (
      <Box>
        <HeroPageSection
          title="Voucher Details"
          breadcrumb={[
            { label: "Home", link: "/" },
            { label: "Admin", link: "/admin" },
            { label: "Vouchers", link: "/admin/vouchers" },
            { label: "Details" },
          ]}
          borderRadius={true}
        />
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {error || "Voucher not found"}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title="Voucher Details"
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Vouchers", link: "/admin/vouchers" },
          { label: "Details" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/vouchers")}
          sx={{
            borderRadius: 0,
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to Vouchers
        </Button>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {voucher.title}
              </Typography>
              <Chip
                label={voucher.status}
                size="small"
                sx={{
                  backgroundColor:
                    voucher.status === "active" ? "#4caf5015" : "#9e9e9e15",
                  color: voucher.status === "active" ? "#4caf50" : "#9e9e9e",
                  fontWeight: 500,
                  borderRadius: 0,
                  textTransform: "capitalize",
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/admin/vouchers/edit/${id}`)}
              sx={{
                borderRadius: 0,
                backgroundColor: "secondary.main",
                "&:hover": {
                  backgroundColor: "secondary.dark",
                },
              }}
            >
              Edit
            </Button>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                borderRadius: 0,
                textTransform: "none",
              },
            }}
          >
            <Tab label="Details" />
            <Tab label="Issuance History" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {voucher.description || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Voucher Type
                </Typography>
                <Chip
                  label={
                    voucher.voucher_type === "promo"
                      ? "Promotional"
                      : voucher.voucher_type === "gift"
                        ? "Gift Card"
                        : "Voucher"
                  }
                  size="small"
                  sx={{
                    backgroundColor:
                      voucher.voucher_type === "promo"
                        ? "#f58c0015"
                        : voucher.voucher_type === "gift"
                          ? "#84994f15"
                          : "#3b82f615",
                    color:
                      voucher.voucher_type === "promo"
                        ? "#f58c00"
                        : voucher.voucher_type === "gift"
                          ? "secondary.dark"
                          : "#3b82f6",
                    fontWeight: 500,
                    borderRadius: 0,
                    mb: 2,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Discount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "secondary.main", mb: 2 }}>
                  {formatDiscount(voucher)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Usage Limit
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {voucher.usage_limit || "Unlimited"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Validity Period
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(voucher.validity_start)} - {formatDate(voucher.validity_end)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  First-time Only
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {voucher.first_time_only ? "Yes" : "No"}
                </Typography>
              </Grid>

              {voucher.image_front_url && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Front Image
                  </Typography>
                  <Box
                    component="img"
                    src={voucher.image_front_url}
                    alt="Front"
                    sx={{
                      maxWidth: "100%",
                      height: "auto",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                </Grid>
              )}

              {voucher.image_back_url && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Back Image
                  </Typography>
                  <Box
                    component="img"
                    src={voucher.image_back_url}
                    alt="Back"
                    sx={{
                      maxWidth: "100%",
                      height: "auto",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                </Grid>
              )}
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Issuance History ({issues.length})
              </Typography>
              <VoucherIssuesTable
                issues={issues}
                loading={issuesLoading}
                error={null}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

