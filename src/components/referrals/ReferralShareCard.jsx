import React, { useState } from "react";
import {
  Box, Typography, Paper, TextField, Button,
  Snackbar, Alert, Tooltip, Divider,
} from "@mui/material";
import {
  ContentCopy, Email, WhatsApp, Share,
} from "@mui/icons-material";
import { profileCardSx, profileSectionTitleSx } from "../profile/profileStyles";
import ReferralQrCode from "./ReferralQrCode";

const SHARE_MESSAGE = (url) =>
  `I've been loving Rehoboth Health & Wellness — book your wellness session here: ${url}`;

const INPUT_ROW_HEIGHT = 42;

const shareButtonSx = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 500,
  fontSize: { xs: "0.75rem", sm: "0.82rem" },
  borderColor: "divider",
  color: "text.secondary",
  flex: { xs: 1, sm: "none" },
  minWidth: 0,
  px: { xs: 0.5, sm: 1.5 },
  py: 0.85,
  whiteSpace: "nowrap",
};

export default function ReferralShareCard({ referralUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
    });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Join me at Rehoboth Health & Wellness");
    const body = encodeURIComponent(SHARE_MESSAGE(referralUrl));
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(SHARE_MESSAGE(referralUrl));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Rehoboth Health & Wellness",
        text: SHARE_MESSAGE(referralUrl),
        url: referralUrl,
      });
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Paper elevation={0} sx={{ ...profileCardSx }}>
      <Typography sx={{ ...profileSectionTitleSx, mb: 0.5 }}>Your Referral Link</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: "0.82rem" }}>
        Share this link with friends to earn a reward when they book their first appointment.
      </Typography>

      {/* Row 1: link input + copy (always one row) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 1,
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        <TextField
          fullWidth
          value={referralUrl}
          InputProps={{ readOnly: true }}
          inputProps={{
            "aria-label": "Your referral link",
            style: { fontFamily: "monospace", fontSize: "0.82rem" },
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              bgcolor: "#fafafa",
              height: INPUT_ROW_HEIGHT,
            },
            "& .MuiOutlinedInput-input": {
              py: 0,
              height: "100%",
              boxSizing: "border-box",
            },
          }}
        />
        <Tooltip title={copied ? "Copied!" : "Copy link"}>
          <Button
            onClick={handleCopy}
            variant="contained"
            startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 0,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "secondary.main",
              color: "#fff",
              flexShrink: 0,
              px: { xs: 1.5, sm: 2 },
              height: INPUT_ROW_HEIGHT,
              minHeight: INPUT_ROW_HEIGHT,
              alignSelf: "stretch",
              "&:hover": { bgcolor: "secondary.dark" },
              "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.5 } },
            }}
            aria-label="Copy referral link"
          >
            Copy
          </Button>
        </Tooltip>
      </Box>

      {/* Row 2: share actions (one row on mobile) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          mb: 3,
          width: "100%",
        }}
      >
        <Button
          onClick={handleEmail}
          startIcon={<Email sx={{ fontSize: { xs: 16, sm: 17 } }} />}
          variant="outlined"
          size="small"
          sx={{
            ...shareButtonSx,
            "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
          }}
        >
          Email
        </Button>
        <Button
          onClick={handleWhatsApp}
          startIcon={<WhatsApp sx={{ fontSize: { xs: 16, sm: 17 } }} />}
          variant="outlined"
          size="small"
          sx={{
            ...shareButtonSx,
            "&:hover": { borderColor: "#25D366", color: "#25D366" },
          }}
        >
          WhatsApp
        </Button>
        {canNativeShare ? (
          <Button
            onClick={handleNativeShare}
            startIcon={<Share sx={{ fontSize: { xs: 16, sm: 17 } }} />}
            variant="outlined"
            size="small"
            sx={{
              ...shareButtonSx,
              "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
            }}
          >
            More
          </Button>
        ) : (
          <Button
            onClick={handleCopy}
            startIcon={<Share sx={{ fontSize: { xs: 16, sm: 17 } }} />}
            variant="outlined"
            size="small"
            sx={{
              ...shareButtonSx,
              "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
            }}
          >
            Share
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <Typography fontSize="0.82rem" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
        Or share by QR code
      </Typography>
      <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}>
        <ReferralQrCode url={referralUrl} size={160} />
      </Box>
      <Typography fontSize="0.72rem" color="text.disabled" sx={{ mt: 1 }}>
        Scan with a phone camera to open your referral link.
      </Typography>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCopied(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 0, bgcolor: "secondary.main" }}
        >
          Referral link copied!
        </Alert>
      </Snackbar>
    </Paper>
  );
}
