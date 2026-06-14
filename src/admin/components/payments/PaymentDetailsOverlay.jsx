import PaymentDetailsModal from "./PaymentDetailsModal";

/**
 * @deprecated Use PaymentDetailsModal directly. Kept for backward compatibility.
 */
export default function PaymentDetailsOverlay({ open, onClose, appointment, onPaymentVerified }) {
  return (
    <PaymentDetailsModal
      open={open}
      onClose={onClose}
      appointment={appointment}
      onPaymentVerified={onPaymentVerified}
    />
  );
}
