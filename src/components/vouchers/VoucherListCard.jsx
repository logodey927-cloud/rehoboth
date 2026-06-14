import React from "react";
import { Box } from "@mui/material";
import VoucherTicketCard from "./VoucherTicketCard";

/**
 * My-Vouchers list card — thin wrapper around VoucherTicketCard (list variant).
 */
export default function VoucherListCard({ voucher }) {
  return (
    <Box sx={{ mb: 2 }}>
      <VoucherTicketCard variant="list" voucher={voucher} />
    </Box>
  );
}
