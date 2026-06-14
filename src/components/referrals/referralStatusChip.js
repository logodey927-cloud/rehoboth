export const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#92400e",
    bgcolor: "#fef3c7",
  },
  signed_up: {
    label: "Signed Up",
    color: "#1e40af",
    bgcolor: "#dbeafe",
  },
  qualified: {
    label: "Qualified",
    color: "#065f46",
    bgcolor: "#d1fae5",
  },
  rewarded: {
    label: "Rewarded",
    color: "#47672f",
    bgcolor: "#f0f4e8",
  },
  voided: {
    label: "Voided",
    color: "#6b7280",
    bgcolor: "#f3f4f6",
  },
};

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? { label: status, color: "#6b7280", bgcolor: "#f3f4f6" };
}
