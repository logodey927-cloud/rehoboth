import React, { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { getContactMessages, adminSendContactReply } from "../../api/api";
import DataTable from "../components/DataTable";
import HeroPageSection from "../../components/sections/HeroPageSection";
import ContactMessageDetailsModal from "../components/contacts/ContactMessageDetailsModal";
import { swalSuccess, swalError } from "../../utils/swal";

export default function ContactMessagesPage() {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ── Reply dialog ──
  const [replyDialog, setReplyDialog]     = useState(null); // { id, name, email }
  const [replySubject, setReplySubject]   = useState("");
  const [replyMessage, setReplyMessage]   = useState("");
  const [replySending, setReplySending]   = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getContactMessages();
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      } else {
        setError("Failed to load contact messages");
      }
    } catch {
      setError("Failed to load contact messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openReply = (row) => {
    setReplyDialog({
      id: row.id,
      name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Customer",
      email: row.email,
    });
    setReplySubject("Re: Your message to Rehoboth Health & Wellness Clinic");
    setReplyMessage("");
  };

  const handleSendReply = async () => {
    if (!replyDialog || !replyMessage.trim()) return;
    setReplySending(true);
    try {
      const res = await adminSendContactReply(replyDialog.id, {
        subject: replySubject,
        message: replyMessage,
      });
      if (res.data?.success) {
        swalSuccess("Reply sent", `Message sent to ${replyDialog.email}`);
        setReplyDialog(null);
      } else {
        swalError("Error", res.data?.error || "Failed to send reply");
      }
    } catch (err) {
      swalError("Error", err.response?.data?.error || "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  // ── Column definitions ──
  const columns = [
    {
      id: "row_number",
      label: "No.",
      width: 60,
      align: "center",
      render: (value, row, rowNumber) => (
        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: 500 }}>
          {rowNumber}
        </Typography>
      ),
    },
    { id: "first_name", label: "First Name" },
    { id: "last_name",  label: "Last Name" },
    {
      id: "email",
      label: "Email",
      render: (value) => (
        <Typography
          component="a"
          href={`mailto:${value}`}
          sx={{
            color: "secondary.dark",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline", fontWeight: 500 },
          }}
        >
          {value}
        </Typography>
      ),
    },
    { id: "phone",   label: "Phone",    render: (v) => v || "—" },
    {
      id: "message",
      label: "Message",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={value}
        >
          {value || "—"}
        </Typography>
      ),
    },
    { id: "created_at", label: "Date", type: "datetime" },
  ];

  // ── Details modal rendered via DataTable's renderDetails ──
  const renderDetails = (row, onClose, isOpen) => (
    <ContactMessageDetailsModal
      open={isOpen}
      onClose={onClose}
      message={row}
      onReply={(msg) => openReply(msg)}
    />
  );

  return (
    <Box>
      <HeroPageSection
        title="Contact Messages"
        breadcrumb={[
          { label: "Home",  link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Contact Messages" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Chip
          label={`Total: ${messages.length}`}
          sx={{ backgroundColor: "#84994f15", color: "#84994f", fontWeight: 600, borderRadius: 0 }}
        />
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchMessages}
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: 0, textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={messages}
        loading={loading && messages.length === 0}
        searchPlaceholder="Search messages by name, email…"
        renderDetails={renderDetails}
        detailsActionIcon="more"
      />

      {/* ── Reply dialog ── */}
      <Dialog
        open={!!replyDialog}
        onClose={() => !replySending && setReplyDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle>
          <Typography variant="h6" component="span" fontWeight={600}>Reply to Contact Message</Typography>
          {replyDialog && (
            <Typography variant="body2" color="text.secondary">
              To: {replyDialog.name} ({replyDialog.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Subject"
              fullWidth
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={6}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setReplyDialog(null)}
            disabled={replySending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendReply}
            disabled={replySending || !replyMessage.trim()}
            sx={{
              textTransform: "none",
              backgroundColor: "secondary.main",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            {replySending ? "Sending…" : "Send reply"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
