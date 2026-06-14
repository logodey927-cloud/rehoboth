import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { profileCardSx, profileSectionTitleSx, profileViewAllSx } from "./profileStyles";
import VoucherTicketCard from "../vouchers/VoucherTicketCard";
import { ACTIVE_STATUSES } from "../vouchers/voucherDisplayUtils";

export default function VoucherWidget({ vouchers = [] }) {
  const active  = vouchers.filter((v) => ACTIVE_STATUSES.includes(v.status));
  const display = active[0] || null;

  if (!display) return null;

  return (
    <Paper elevation={0} sx={profileCardSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={profileSectionTitleSx}>Your Vouchers</Typography>
        <Typography component={RouterLink} to="/my-account/vouchers" sx={profileViewAllSx}>
          View All
        </Typography>
      </Box>
      <VoucherTicketCard variant="compact" voucher={display} />
    </Paper>
  );
}
