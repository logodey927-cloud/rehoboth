import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar,
} from "@mui/material";
import { People } from "@mui/icons-material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";
import { getStatusConfig } from "./referralStatusChip";

const GENDER_LABEL = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function StatusChip({ status }) {
  const { label, color, bgcolor } = getStatusConfig(status);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.25,
        py: 0.35,
        fontSize: "0.72rem",
        fontWeight: 700,
        color,
        bgcolor,
        borderRadius: 0,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}

const headerCellSx = {
  fontWeight: 700,
  fontSize: "0.78rem",
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  py: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  whiteSpace: "nowrap",
};

const COLUMNS = [
  { key: "no", label: "No.", width: 48 },
  { key: "friend", label: "Friend", minWidth: 180 },
  { key: "gender", label: "Gender", width: 90 },
  { key: "date", label: "Date Referred", width: 120 },
  { key: "status", label: "Status", width: 100 },
  { key: "reward", label: "Reward", minWidth: 120 },
];

export default function ReferralsTable({ referrals }) {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, p: 0, overflow: "hidden" }}>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 }, pb: 1.5 }}>
        <Typography sx={profileSectionTitleSx}>Friends You've Referred</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4, fontSize: "0.82rem" }}>
          Track friends who signed up using your link.
        </Typography>
      </Box>

      {referrals.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 5,
            px: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <People sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No referrals yet. Share your link to get started!
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      ...headerCellSx,
                      width: col.width,
                      minWidth: col.minWidth,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {referrals.map((ref, index) => (
                <TableRow
                  key={ref.id}
                  sx={{
                    bgcolor: ref.status === "pending" ? "#fafafa" : "transparent",
                    "&:last-child td": { border: 0 },
                  }}
                >
                  <TableCell sx={{ py: 1.5, color: "text.secondary", fontSize: "0.82rem" }}>
                    {index + 1}
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                      <Avatar
                        src={ref.avatarUrl}
                        alt={ref.friendName}
                        sx={{
                          width: 36,
                          height: 36,
                          flexShrink: 0,
                          bgcolor: "secondary.light",
                          color: "secondary.dark",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(ref.friendName)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontSize="0.875rem" fontWeight={600} color="text.primary" noWrap>
                          {ref.friendName}
                        </Typography>
                        {ref.friendEmail && (
                          <Typography fontSize="0.75rem" color="text.disabled" noWrap>
                            {ref.friendEmail}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Typography fontSize="0.82rem" color="text.secondary">
                      {GENDER_LABEL[ref.gender] || ref.gender || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Typography fontSize="0.82rem" color="text.secondary" whiteSpace="nowrap">
                      {formatDate(ref.referredAt)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <StatusChip status={ref.status} />
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      fontSize="0.82rem"
                      color={ref.rewardLabel === "—" ? "text.disabled" : "secondary.dark"}
                      fontWeight={ref.rewardLabel === "—" ? 400 : 600}
                    >
                      {ref.rewardLabel}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
