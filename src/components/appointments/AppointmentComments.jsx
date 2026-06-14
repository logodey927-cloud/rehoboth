import React, { useState } from "react";
import {
  Box, Typography, TextField, Avatar, Button, Paper,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { profileCardSx, profileSectionTitleSx, accountFieldSx } from "../profile/profileStyles";

function formatInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CommentBubble({ comment }) {
  const isUser = comment.sender === "user";
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 1.25,
        mb: 2,
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: "0.75rem",
          fontWeight: 700,
          bgcolor: isUser ? "secondary.main" : "#e8f5e9",
          color: isUser ? "#fff" : "secondary.dark",
          flexShrink: 0,
        }}
      >
        {formatInitials(comment.authorName)}
      </Avatar>
      <Box sx={{ maxWidth: "75%", minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.4,
            flexDirection: isUser ? "row-reverse" : "row",
          }}
        >
          <Typography fontSize="0.78rem" fontWeight={600} color="text.primary">
            {comment.authorName}
          </Typography>
          <Typography fontSize="0.7rem" color="text.disabled">
            {comment.timeLabel}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: isUser ? "secondary.main" : "#f3f4f6",
            color: isUser ? "#fff" : "text.primary",
            borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            px: 2,
            py: 1.25,
          }}
        >
          <Typography fontSize="0.85rem" lineHeight={1.55}>
            {comment.text}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AppointmentComments({ appointmentId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  const handlePost = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const timeLabel = now.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    }) + ", " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    setComments((prev) => [
      ...prev,
      {
        id: `cmt-user-${Date.now()}`,
        appointmentId,
        sender: "user",
        authorName: "You",
        text,
        createdAt: now.toISOString(),
        timeLabel,
      },
    ]);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handlePost();
    }
  };

  return (
    <Paper elevation={0} sx={{ ...profileCardSx, mt: 3 }}>
      <Typography sx={{ ...profileSectionTitleSx, mb: 0.5 }}>Comments</Typography>
      <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={2.5}>
        Add a note for your therapist or view clinic messages about this appointment.
      </Typography>

      {/* Thread */}
      {comments.length === 0 ? (
        <Typography
          variant="body2"
          color="text.disabled"
          fontSize="0.82rem"
          sx={{ mb: 2.5, py: 2, textAlign: "center", border: "1px dashed", borderColor: "divider" }}
        >
          No comments yet.
        </Typography>
      ) : (
        <Box sx={{ mb: 2.5 }}>
          {comments.map((c) => (
            <CommentBubble key={c.id} comment={c} />
          ))}
        </Box>
      )}

      {/* Composer */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
        <TextField
          multiline
          minRows={2}
          maxRows={5}
          fullWidth
          placeholder="Write a comment… (Ctrl+Enter to send)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ ...accountFieldSx }}
          inputProps={{ maxLength: 1000 }}
        />
        <Button
          variant="contained"
          onClick={handlePost}
          disabled={!draft.trim()}
          endIcon={<Send sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "secondary.main",
            color: "#fff",
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: 1.5,
            flexShrink: 0,
            "&:hover": { bgcolor: "secondary.dark" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "text.disabled" },
          }}
        >
          Post
        </Button>
      </Box>
    </Paper>
  );
}
