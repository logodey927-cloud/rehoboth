import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  NotificationsNone, LocalOffer, CalendarToday,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { profileCardSx, profileSectionTitleSx, profileViewAllSx } from "./profileStyles";

const TYPE_ICON = {
  appointment: { Icon: CalendarToday, color: "#3b82f6", bg: "#eff6ff" },
  voucher: { Icon: LocalOffer, color: "#f59e0b", bg: "#fffbeb" },
  reminder: { Icon: NotificationsNone, color: "#84994f", bg: "#f0f4e8" },
  default: { Icon: NotificationsNone, color: "#84994f", bg: "#f0f4e8" },
};

export default function NotificationsPreviewCard({ notifications = [] }) {
  return (
    <Paper elevation={0} sx={{ ...profileCardSx, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={profileSectionTitleSx}>Notifications</Typography>
        <Typography component={RouterLink} to="/my-account/notifications" sx={profileViewAllSx}>
          View All
        </Typography>
      </Box>

      {notifications.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No notifications.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notifications.map((n, i) => {
            const { Icon, color, bg } = TYPE_ICON[n.type] || TYPE_ICON.default;
            return (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 0,
                    bgcolor: bg,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 18, color }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography fontSize="0.85rem" color="text.primary" lineHeight={1.5}>
                    {n.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
                    {n.timeLabel}
                  </Typography>
                </Box>
                {n.unread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                      mt: 0.75,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
