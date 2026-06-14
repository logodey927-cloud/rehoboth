import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { Done, DoneAll, ArrowForward } from "@mui/icons-material";

// Matches either an http URL or an arrow-link pattern like  → /book-appointment
const SEGMENT_RE = /https?:\/\/[^\s)>\]"']+|(→|->)\s*(\/[^\s,\n)>\]"']+)/g;

function TextWithLinks({ text, isUser }) {
  if (!text) return null;

  const parts = [];
  let last = 0;
  let match;
  SEGMENT_RE.lastIndex = 0;

  while ((match = SEGMENT_RE.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }

    if (match[0].startsWith("http")) {
      // External URL
      parts.push({ type: "url", value: match[0] });
    } else {
      // Arrow-link: → /path  or  -> /path
      parts.push({ type: "navlink", label: match[0].trim(), to: match[2] });
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === "url") {
          return (
            <a
              key={i}
              href={p.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isUser ? "#3a6b2a" : "#1565c0",
                textDecoration: "underline",
                fontWeight: 500,
                wordBreak: "break-all",
              }}
            >
              {p.value}
            </a>
          );
        }

        if (p.type === "navlink") {
          return (
            <Button
              key={i}
              component={Link}
              to={p.to}
              size="small"
              variant="contained"
              endIcon={<ArrowForward sx={{ fontSize: "0.8rem !important" }} />}
              sx={{
                display: "inline-flex",
                mt: 0.75,
                px: 1.75,
                py: 0.5,
                fontSize: "0.78rem",
                fontWeight: 700,
                lineHeight: 1.4,
                borderRadius: 0,
                bgcolor: "secondary.main",
                color: "#fff",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "secondary.dark",
                  boxShadow: "none",
                },
              }}
            >
              {p.to}
            </Button>
          );
        }

        return <React.Fragment key={i}>{p.value}</React.Fragment>;
      })}
    </>
  );
}

/** Single check = sent; double check = read (WhatsApp-style, user messages only). */
function MessageStatusIcon({ status }) {
  if (!status || status === "pending") return null;

  const isRead = status === "read";
  const Icon = isRead ? DoneAll : Done;
  const color = isRead ? "#4a90c4" : "#6a8a40";

  return (
    <Icon
      sx={{
        fontSize: 14,
        color,
        ml: 0.35,
        flexShrink: 0,
        ...(isRead && { letterSpacing: -3 }),
      }}
      aria-label={isRead ? "Read" : "Sent"}
    />
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <Box>
      {message.dayLabel && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
          <Typography
            fontSize="0.72rem"
            color="text.disabled"
            sx={{
              bgcolor: "#f0f0f0",
              px: 1.5,
              py: 0.4,
              borderRadius: 10,
              fontWeight: 500,
            }}
          >
            {message.dayLabel}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          mb: 0.75,
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "82%", sm: "68%" },
            px: 1.75,
            py: 1,
            bgcolor: isUser ? "#e8f0dc" : "#fff",
            border: isUser ? "none" : "1px solid",
            borderColor: "divider",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            position: "relative",
          }}
        >
          <Typography
            fontSize="0.875rem"
            color={isUser ? "secondary.dark" : "text.primary"}
            lineHeight={1.55}
            sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
            component="div"
          >
            <TextWithLinks text={message.text} isUser={isUser} />
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0.25,
              mt: 0.4,
            }}
          >
            <Typography
              fontSize="0.68rem"
              color={isUser ? "#6a8a40" : "text.disabled"}
              lineHeight={1}
            >
              {message.timeLabel}
            </Typography>
            {isUser && <MessageStatusIcon status={message.status} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
