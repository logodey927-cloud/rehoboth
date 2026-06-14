import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Chip,
  Divider,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import { useParams, useNavigate } from "react-router-dom";
import BlogSidebar from "../components/common09/BlogSidebar";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";
import { getVoucherById, getAllVouchers, purchaseVoucher, createPayPalVoucherOrder } from "../api/api";
import VoucherRequestForm from "../components/vouchers/VoucherRequestForm";
import PaymentGatewaySelector from "../components/payments/PaymentGatewaySelector";
import { useUserAuth } from "../contexts/UserAuthContext";

const DEFAULT_DESCRIPTION = "Relax • Revive • Reconnect. Your premier destination for health and wellness in Rochdale, Greater Manchester, United Kingdom.";

export default function VoucherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allVouchers, setAllVouchers] = useState([]);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseStep, setPurchaseStep] = useState("form"); // form | redirect
  const [selectedGateway, setSelectedGateway] = useState(null); // "stripe" | "paypal" | null
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("");

  // Ensure page starts at top when navigating/refreshing this view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  // Fetch voucher details
  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const response = await getVoucherById(id);
        if (response.data && response.data.success) {
          setVoucher(response.data.voucher);
        } else {
          setError("Voucher not found");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load voucher");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVoucher();
    }
  }, [id]);

  // Fetch all vouchers for sidebar
  useEffect(() => {
    const fetchAllVouchers = async () => {
      try {
        const response = await getAllVouchers();
        if (response.data && response.data.success) {
          setAllVouchers(response.data.vouchers || []);
        }
      } catch {
        // Error handled silently
      }
    };

    fetchAllVouchers();
  }, []);

  const categories = useMemo(() => {
    const cats = allVouchers.map((v) => v.voucher_type || "Other");
    return ["All", ...new Set(cats)];
  }, [allVouchers]);

  const tags = useMemo(() => {
    const tagList = allVouchers.flatMap((v) => {
      const tags = [];
      if (v.discount_type) tags.push(v.discount_type);
      if (v.voucher_type) tags.push(v.voucher_type);
      return tags;
    });
    return [...new Set(tagList)];
  }, [allVouchers]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDiscount = () => {
    if (!voucher) return "";
    if (voucher.discount_type === "percent") {
      return `${voucher.discount_value}% OFF`;
    } else if (voucher.discount_type === "amount") {
      return `£${voucher.discount_value} OFF`;
    } else if (voucher.discount_type === "free_service") {
      return "FREE SERVICE";
    }
    if (voucher.discount_type === "full_coverage") {
      return "FULL COVERAGE";
    }
    return "SPECIAL OFFER";
  };
  const isPurchasable =
    Boolean(voucher?.purchase_price) ||
    voucher?.voucher_type === "purchased" ||
    voucher?.voucher_type === "gift";

  const eligibleTreatmentsList = useMemo(() => {
    const eligible = voucher?.eligible_services;
    
    if (!eligible || !Array.isArray(eligible) || eligible.length === 0) {
      return null;
    }
    
    // Check if first element is an object with a title property
    const firstItem = eligible[0];
    
    if (firstItem && typeof firstItem === "object" && firstItem !== null) {
      // Filter out service categories (type: "service") and only keep treatments
      // But if we only have service categories, we should still show them with a note
      const treatments = eligible
        .filter((s) => s && (s.title || s.name))
        .map((s) => ({
          id: s.id,
          title: s.title || s.name,
          description: s.description,
          category: s.category,
          type: s.type || "service",
          parent_service_title: s.parent_service_title,
        }));
      
      // If we have treatments (type: "treatment"), return them
      // If we only have services (categories), the backend should have expanded them
      // But if not, we'll show what we have
      return treatments.length > 0 ? treatments : null;
    }
    
    // If we only have IDs (strings), return null (backend should populate them)
    return null;
  }, [voucher]);

  const handleOpenPurchase = () => {
    setPurchaseError(null);
    setPurchaseStep("form");
    setSelectedGateway(null);
    if (user) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
      setCustomerName(fullName || "");
      setCustomerEmail(user.email || "");
      setCustomerPhone(user.phone || "");
    } else {
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    }
    setPurchaseOpen(true);
  };

  const handleStartPurchase = async () => {
    if (!voucher?.id) return;
    if (!selectedGateway) {
      setPurchaseError("Please select a payment method.");
      return;
    }

    // Validate required fields
    if (!customerName?.trim()) {
      setPurchaseError("Please enter your name.");
      return;
    }
    if (!customerEmail?.trim()) {
      setPurchaseError("Please enter your email address.");
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setPurchaseError("Please enter a valid email address.");
      return;
    }

    try {
      setPurchaseLoading(true);
      setPurchaseError(null);

      if (selectedGateway === "stripe") {
        // Stripe payment flow
        const resp = await purchaseVoucher({
          voucher_id: voucher.id,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim().toLowerCase(),
          customer_phone: customerPhone.trim() || "", // Optional
          payment_gateway: "stripe",
        });

        if (!resp.data?.success) {
          setPurchaseError(resp.data?.error || "Failed to start voucher purchase.");
          return;
        }

        const checkoutUrl = resp.data?.checkoutUrl;
        if (!checkoutUrl) {
          setPurchaseError("Payment session could not be created. Please try again.");
          return;
        }

        setPurchaseStep("redirect");
        window.location.href = checkoutUrl;
      } else if (selectedGateway === "paypal") {
        // PayPal payment flow
        // First create voucher issue
        const purchaseResp = await purchaseVoucher({
          voucher_id: voucher.id,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim().toLowerCase(),
          customer_phone: customerPhone.trim() || "", // Optional
          payment_gateway: "paypal",
        });

        if (!purchaseResp.data?.success || !purchaseResp.data?.voucher_issue?.id) {
          setPurchaseError(purchaseResp.data?.error || "Failed to create voucher purchase.");
          return;
        }

        const voucherIssueId = purchaseResp.data.voucher_issue.id;

        // Create PayPal order
        const orderResp = await createPayPalVoucherOrder(voucherIssueId);
        if (!orderResp.data?.success || !orderResp.data?.approvalUrl) {
          setPurchaseError(orderResp.data?.error || "Failed to create PayPal payment session.");
          return;
        }

        setPurchaseStep("redirect");
        window.location.href = orderResp.data.approvalUrl;
      } else {
        setPurchaseError("Selected payment method is not supported.");
      }
    } catch (err) {
      setPurchaseError(err.response?.data?.error || err.message || "Failed to start voucher purchase.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const formatAllowedDays = () => {
    if (!voucher || !voucher.allowed_days) return "Any day";
    try {
      const days = typeof voucher.allowed_days === "string" 
        ? JSON.parse(voucher.allowed_days) 
        : voucher.allowed_days;
      
      if (typeof days === "object" && days !== null) {
        const dayNames = Object.keys(days);
        if (dayNames.length === 0) return "Any day";
        return dayNames.join(", ");
      }
    } catch {
      // Parse error handled silently
    }
    return "Any day";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !voucher) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Alert severity="error">{error || "Voucher not found."}</Alert>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#ffffff" }}
    >
      <SEO
        title={voucher.title}
        description={voucher.description || `Discover ${voucher.title} at Rehoboth Health & Wellness Clinic. ${DEFAULT_DESCRIPTION}`}
        image={voucher.image_front_url}
        keywords={`voucher, ${voucher.voucher_type}, ${voucher.discount_type}, wellness, spa`}
      />
      <HeroPageSection
        title={voucher.title}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Vouchers", link: "/vouchers" },
          { label: voucher.title },
        ]}
      />

      <Grid
        container
        spacing={2}
        sx={{ py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 6 } }}
      >
        {/* Main content */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ px: { xs: 0, md: 2 }, py: { xs: 3, md: 4 } }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
            }}
          >
            {/* Top image */}
            {voucher.image_front_url && (
              <Box
                component="img"
                src={voucher.image_front_url}
                alt={voucher.title}
                sx={{
                  width: "100%",
                  height: { xs: 220, md: 450 },
                  objectFit: "cover",
                  mb: 2,
                }}
                onError={(event) => {
                  event.target.src = "https://via.placeholder.com/800x400?text=Voucher";
                }}
              />
            )}

            {/* Title and meta */}
            <Typography variant="overline" sx={{ color: "secondary.dark" }}>
              {voucher.voucher_type === "promo"
                ? "Promotional Voucher"
                : voucher.voucher_type === "purchased"
                  ? "Voucher"
                  : "Gift Card"}
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 300,
                mb: 1,
                fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
              }}
            >
              {voucher.title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                mb: 3,
                color: "secondary.main",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
              }}
            >
              {formatDiscount()}
            </Typography>

            {/* Description */}
            {voucher.description && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  mb: 3,
                  color: "#757575",
                }}
              >
                {voucher.description}
              </Typography>
            )}

            {/* Voucher Details */}
            <Box
              sx={{
                mt: 3,
                fontFamily: '"Raleway", sans-serif',
                "& h2, & h3, & h4": {
                  fontWeight: 600,
                  color: "#1a1f2e",
                  mt: 4,
                  mb: 2,
                  lineHeight: 1.3,
                },
                "& h2": {
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                },
                "& p": {
                  color: "#495057",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  lineHeight: 1.8,
                  mb: 2.5,
                  textAlign: "justify",
                },
                "& ul, & ol": {
                  mb: 2.5,
                  pl: 3,
                  "& li": {
                    color: "#495057",
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    lineHeight: 1.8,
                    mb: 1,
                  },
                },
              }}
            >
              <Typography variant="h4" component="h2">
                Voucher Details
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {isPurchasable && (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Price:</strong>{" "}
                      <span style={{ fontWeight: 800 }}>
                        {voucher.purchase_price ? `£${Number(voucher.purchase_price).toFixed(2)}` : "—"}
                      </span>
                    </Typography>
                    {eligibleTreatmentsList && eligibleTreatmentsList.length > 0 ? (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                          Eligible Treatments:
                        </Typography>
                        {(() => {
                          // Filter out service categories (type: "service") - we only want treatments
                          const treatmentsOnly = eligibleTreatmentsList.filter(t => t.type === "treatment" || !t.type);
                          
                          // Group treatments by parent service category
                          const grouped = treatmentsOnly.reduce((acc, treatment) => {
                            const category = treatment.parent_service_title || treatment.category || "Other";
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(treatment);
                            return acc;
                          }, {});

                          return Object.entries(grouped).map(([category, treatments]) => (
                            <Box key={category} sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "secondary.main",
                                  mb: 0.75,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {category}
                              </Typography>
                              <Box
                                component="ul"
                                sx={{
                                  margin: 0,
                                  paddingLeft: 3,
                                  listStyle: "none",
                                  "& li": {
                                    marginBottom: 0.5,
                                    position: "relative",
                                    "&::before": {
                                      content: '"•"',
                                      position: "absolute",
                                      left: -20,
                                      color: "secondary.main",
                                      fontWeight: "bold",
                                    },
                                  },
                                }}
                              >
                                {treatments.map((treatment, index) => (
                                  <Box
                                    component="li"
                                    key={treatment.id || treatment.title || index}
                                    sx={{ mb: 0.5 }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500, color: "text.primary" }}
                                    >
                                      {treatment.title}
                                    </Typography>
                                    {treatment.description && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          display: "block",
                                          color: "text.secondary",
                                          ml: 1,
                                          mt: 0.25,
                                        }}
                                      >
                                        {treatment.description.length > 80
                                          ? `${treatment.description.substring(0, 80)}...`
                                          : treatment.description}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          ));
                        })()}
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Eligible Treatments:</strong>{" "}
                        {voucher?.eligible_services && Array.isArray(voucher.eligible_services) && voucher.eligible_services.length > 0
                          ? `${voucher.eligible_services.length} selected treatment(s)`
                          : "All treatments (no restriction)"}
                      </Typography>
                    )}
                  </>
                )}
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Validity Period:</strong> {formatDate(voucher.validity_start)} - {formatDate(voucher.validity_end)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Allowed Days:</strong> {formatAllowedDays()}
                </Typography>
                {voucher.first_time_only && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Restriction:</strong> First-time clients only
                  </Typography>
                )}
                {voucher.usage_limit && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Usage Limit:</strong> {voucher.usage_limit} time(s)
                  </Typography>
                )}
              </Box>

              {voucher.rules && (
                <>
                  <Typography variant="h4" component="h2">
                    Rules & Restrictions
                  </Typography>
                  <Box
                    component="div"
                    dangerouslySetInnerHTML={{
                      __html: typeof voucher.rules === "string" 
                        ? voucher.rules 
                        : JSON.stringify(voucher.rules),
                    }}
                  />
                </>
              )}
            </Box>

            {/* Tags */}
            <Stack direction="row" flexWrap="wrap" gap={1.2} sx={{ mt: 3 }}>
              <Chip
                label={
                  voucher.voucher_type === "purchased"
                    ? "Voucher"
                    : voucher.voucher_type === "gift"
                      ? "Gift Card"
                      : voucher.voucher_type === "promo"
                        ? "Promotional Voucher"
                        : voucher.voucher_type || "Voucher"
                }
                variant="outlined"
                sx={{ borderRadius: 0 }}
              />
              <Chip
                label={voucher.discount_type || "Special"}
                variant="outlined"
                sx={{ borderRadius: 0 }}
              />
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Request Button */}
            <Box sx={{ mt: 4, mb: 2 }}>
              {isPurchasable ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenPurchase}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: "secondary.main",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": {
                      backgroundColor: "secondary.dark",
                    },
                  }}
                >
                  Buy This Voucher
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setRequestFormOpen(true)}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: "secondary.main",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": {
                      backgroundColor: "secondary.dark",
                    },
                  }}
                >
                  Request This Voucher
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
              p: { xs: 2, md: 3 },
              borderLeft: { xs: "none", md: "1px solid #eee" },
            }}
          >
            <BlogSidebar
              searchTerm={searchTerm}
              onSearchChange={(v) => setSearchTerm(v)}
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={(v) => {
                setActiveCategory(v);
                navigate("/vouchers");
              }}
              tags={tags}
              activeTag={activeTag}
              onTagChange={(t) => {
                setActiveTag(t);
                navigate("/vouchers");
              }}
              searchPlaceholder="Search vouchers..."
            />
          </Box>
        </Grid>
      </Grid>

      {/* Voucher Request Form Modal */}
      <VoucherRequestForm
        open={requestFormOpen}
        onClose={() => setRequestFormOpen(false)}
        voucherId={voucher.id}
      />

      {/* Voucher Purchase Modal (Prepaid vouchers) */}
      <Dialog
        open={purchaseOpen}
        onClose={() => (purchaseLoading ? null : setPurchaseOpen(false))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderRadius: 0 }}>
          Buy Voucher
        </DialogTitle>
        <DialogContent dividers sx={{ borderRadius: 0 }}>
          {purchaseError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
              {purchaseError}
            </Alert>
          )}

          {purchaseStep === "form" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {voucher.title}
                {voucher.purchase_price ? ` — £${Number(voucher.purchase_price).toFixed(2)}` : ""}
              </Typography>

              {user ? (
                /* Logged-in: show who it's being purchased as, skip data-entry fields */
                <Box
                  sx={{
                    px: 2, py: 1.5,
                    bgcolor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 0,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Purchasing as
                  </Typography>
                  <Typography fontWeight={700} fontSize="0.95rem" color="secondary.dark">
                    {customerName || user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.82rem">
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ display: "block", mt: 0.5 }}>
                    Voucher code will be sent to this email address.
                  </Typography>
                </Box>
              ) : (
                /* Guest: collect contact details */
                <>
                  <TextField
                    label="Name"
                    required
                    fullWidth
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 } }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 } }}
                    helperText="Voucher code will be sent to this email"
                  />
                  <TextField
                    label="Phone Number (Optional)"
                    type="tel"
                    fullWidth
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    InputProps={{ sx: { borderRadius: 0 } }}
                  />
                </>
              )}

              <PaymentGatewaySelector
                selectedGateway={selectedGateway}
                onSelect={(gateway) => setSelectedGateway(gateway)}
              />

              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                Payment details are collected securely by the selected payment provider.
              </Typography>
            </Box>
          )}

          {purchaseStep === "redirect" && (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              Redirecting you to the selected payment provider… If you are not redirected, please close this dialog and try again.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ borderRadius: 0 }}>
          <Button
            onClick={() => setPurchaseOpen(false)}
            disabled={purchaseLoading}
            sx={{ borderRadius: 0 }}
          >
            Close
          </Button>
          {purchaseStep === "form" && (
            <Button
              variant="contained"
              onClick={handleStartPurchase}
              disabled={purchaseLoading || !selectedGateway}
              sx={{ borderRadius: 0, backgroundColor: "secondary.main" }}
            >
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Testimonials */}
      <TestimonialsSection />
    </Box>
  );
}

