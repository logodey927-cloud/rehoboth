import React, { useMemo } from "react";
import { Box, Typography, Chip, CircularProgress, Alert, Avatar } from "@mui/material";
import { CardGiftcard as GiftIcon } from "@mui/icons-material";
import DataTable from "../DataTable";
import { PaymentStatusChip } from "../payments/PaymentDetailsModal";
import VoucherIssuanceDetailsModal, { IssuanceStatusChip } from "./VoucherIssuanceDetailsModal";

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Voucher issuances table — DataTable layout aligned with admin appointments/payments.
 */
export default function VoucherIssuesTable({
  issues = [],
  loading = false,
  error = null,
  showVoucherColumn = false,
  onOpenVoucher = null,
  paymentStatusFilter = "all",
  searchable = true,
  searchPlaceholder = "Search by code, name or email...",
  onIssueUpdated = null,
}) {
  const sortedIssues = useMemo(() => {
    let filtered = issues;
    if (paymentStatusFilter && paymentStatusFilter !== "all") {
      filtered = filtered.filter(
        (i) => (i.payment_status || "").toLowerCase() === paymentStatusFilter
      );
    }
    return filtered;
  }, [issues, paymentStatusFilter]);

  const renderCustomerCell = (_, row) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, py: 0.5 }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          bgcolor: "secondary.light",
          color: "secondary.dark",
          flexShrink: 0,
          fontWeight: 700,
          fontSize: "0.875rem",
        }}
      >
        {(row.client_name || "?").charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1a1f2e", fontSize: "0.8125rem", lineHeight: 1.3 }}
          noWrap
        >
          {row.client_name || "—"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 180,
          }}
        >
          {row.code}
        </Typography>
      </Box>
    </Box>
  );

  const essentialColumns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    {
      id: "client_name",
      label: "Customer",
      width: 240,
      render: renderCustomerCell,
    },
    ...(showVoucherColumn
      ? [
          {
            id: "voucher_title",
            label: "Voucher",
            width: 160,
            render: (value, row) =>
              value ? (
                <Chip
                  icon={<GiftIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label={value}
                  size="small"
                  clickable={Boolean(onOpenVoucher && row.voucher_id)}
                  onClick={
                    onOpenVoucher && row.voucher_id
                      ? (e) => {
                          e.stopPropagation();
                          onOpenVoucher(row);
                        }
                      : undefined
                  }
                  sx={{
                    backgroundColor: "#84994f15",
                    color: "secondary.dark",
                    fontWeight: 600,
                    borderRadius: 0,
                    maxWidth: 160,
                    cursor: onOpenVoucher && row.voucher_id ? "pointer" : "default",
                  }}
                />
              ) : (
                "—"
              ),
          },
        ]
      : []),
    {
      id: "issued_at",
      label: "Issued",
      width: 120,
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value ? formatDate(value) : "—"}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 130,
      render: (value) => <IssuanceStatusChip status={value} />,
    },
    {
      id: "payment_status",
      label: "Payment",
      width: 110,
      render: (value) => (value ? <PaymentStatusChip status={value} /> : "—"),
    },
    {
      id: "payment_amount",
      label: "Amount",
      width: 100,
      render: (value) => {
        const amount = value != null ? Number(value) : null;
        return (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {amount != null && Number.isFinite(amount) ? `£${amount.toFixed(2)}` : "—"}
          </Typography>
        );
      },
    },
  ];

  const allColumns = [
    ...essentialColumns,
    {
      id: "code",
      label: "Voucher code",
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
          {value}
        </Typography>
      ),
    },
    {
      id: "client_email",
      label: "Email",
      render: (value) => value || "—",
    },
    {
      id: "client_phone",
      label: "Phone",
      render: (value) => value || "—",
    },
    {
      id: "voucher_type",
      label: "Voucher type",
      render: (value) => value || "—",
    },
    {
      id: "payment_method",
      label: "Payment method",
      render: (value) => {
        const map = { stripe: "Stripe", bank_transfer: "Bank Transfer" };
        return map[value] || value || "—";
      },
    },
    {
      id: "payment_transaction_id",
      label: "Reference",
      render: (value) =>
        value ? (
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem", wordBreak: "break-all" }}>
            {value}
          </Typography>
        ) : (
          "—"
        ),
    },
    {
      id: "payment_date",
      label: "Payment date",
      render: (value) => formatDateTime(value),
    },
    {
      id: "payment_verified_at",
      label: "Verified at",
      render: (value) => formatDateTime(value),
    },
    {
      id: "expires_at",
      label: "Expires",
      render: (value) => formatDateTime(value),
    },
    {
      id: "used_at",
      label: "Used at",
      render: (value) => formatDateTime(value),
    },
    {
      id: "booking_id",
      label: "Booking ID",
      render: (value) =>
        value ? (
          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
            {value}
          </Typography>
        ) : (
          "—"
        ),
    },
    {
      id: "created_at",
      label: "Created",
      render: (value) => formatDateTime(value),
    },
  ];

  const renderDetails = (row, onClose, isOpen) => (
    <VoucherIssuanceDetailsModal
      open={isOpen}
      onClose={onClose}
      issue={row}
      onOpenVoucher={onOpenVoucher}
      onVerified={onIssueUpdated}
    />
  );

  if (loading && issues.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 0 }}>
        {error}
      </Alert>
    );
  }

  return (
    <DataTable
      essentialColumns={essentialColumns}
      allColumns={allColumns}
      rows={sortedIssues}
      loading={loading && issues.length === 0}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      renderDetails={renderDetails}
      detailsActionIcon="more"
    />
  );
}
