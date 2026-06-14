import React, { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function ChatComposer({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        px: 2,
        py: 1.25,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "#fff",
        flexShrink: 0,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        inputProps={{ "aria-label": "Message input" }}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            bgcolor: "#fafafa",
            fontSize: "0.9rem",
          },
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={!text.trim()}
        aria-label="Send message"
        sx={{
          bgcolor: "secondary.main",
          color: "#fff",
          borderRadius: 0,
          width: 42,
          height: 42,
          flexShrink: 0,
          "&:hover": { bgcolor: "secondary.dark" },
          "&.Mui-disabled": { bgcolor: "#c8d6a8", color: "#fff" },
        }}
      >
        <Send sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
