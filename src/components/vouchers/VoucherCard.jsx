import React from "react";
import VoucherTicketCard from "./VoucherTicketCard";

/**
 * Public voucher catalog card — thin wrapper around VoucherTicketCard (shop variant).
 * All props are forwarded as-is so Vouchers.jsx spread syntax continues to work.
 */
export default function VoucherCard(props) {
  return <VoucherTicketCard variant="shop" {...props} />;
}
