import React, { useState, useRef } from "react";
import { TextField, Button, Box, Alert, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";

import { uploadVoucherImage } from "../../../api/api";

const PLACEHOLDER_IMAGE_HOSTS = new Set(["example.com", "www.example.com"]);

function isPlaceholderImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("data:image/")) return false;
  try {
    return PLACEHOLDER_IMAGE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * ImageUploadField Component
 * Reusable component for image upload with both URL and file upload options
 * 
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.value - Current URL value
 * @param {Function} props.onChange - Change handler (receives URL string)
 * @param {boolean} props.error - Error state
 * @param {string} props.helperText - Helper text
 * @param {Function} props.onUpload - Custom upload handler (optional, receives File, returns Promise<string>)
 */
export default function ImageUploadField({
  label,
  value = "",
  onChange,
  error = false,
  helperText,
  onUpload,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [preview, setPreview] = useState(
    value && !isPlaceholderImageUrl(value) ? value : null
  );
  const fileInputRef = useRef(null);

  // Update preview when value changes externally
  React.useEffect(() => {
    if (value && value !== preview) {
      setPreview(isPlaceholderImageUrl(value) ? null : value);
    }
    if (!value) {
      setPreview(null);
    }
  }, [value]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB for better performance)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be less than 2MB. Please compress your image or use a smaller file.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // If custom onUpload handler provided, use it
      if (onUpload) {
        const url = await onUpload(file);
        setPreview(url);
        if (onChange) {
          onChange(url);
        }
        } else {
          // Default: Upload to backend (preferred method)
          try {
            const response = await uploadVoucherImage(file);
            if (response.data?.success && response.data.url) {
              const url = response.data.url;
              setPreview(url);
              if (onChange) {
                onChange(url);
              }
            } else {
              throw new Error(response.data?.error || "Upload failed");
            }
          } catch (uploadErr) {
            // If file is too large for backend, warn user
            if (file.size > 1 * 1024 * 1024) {
              setUploadError("File is too large. Please use an image under 1MB or upload via URL instead.");
              setUploading(false);
              return;
            }
            
            // Fallback: Use FileReader for data URL if upload fails (only for small files)
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result;
              // Check if data URL is too large (warn if > 1MB)
              if (dataUrl.length > 1 * 1024 * 1024) {
                setUploadError("Image is too large. Please compress it or use a URL instead.");
                setUploading(false);
                return;
              }
              setPreview(dataUrl);
              if (onChange) {
                onChange(dataUrl);
              }
            };
            reader.onerror = () => {
              setUploadError("Failed to read file");
              setUploading(false);
            };
            reader.readAsDataURL(file);
          }
        }
    } catch (err) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onChange) {
      onChange("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setPreview(url && !isPlaceholderImageUrl(url) ? url : null);
    if (onChange) {
      onChange(url);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label={label}
          fullWidth
          type="url"
          value={value ?? ""}
          onChange={handleUrlChange}
          error={error || !!uploadError}
          helperText={
            uploadError || helperText || "Enter image URL or upload from PC"
          }
          placeholder="https://example.com/image.jpg"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          InputProps={{
            startAdornment: <ImageIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id={`file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
        />
        <label htmlFor={`file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}>
          <Button
            variant="outlined"
            component="span"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={uploading}
            sx={{
              borderRadius: 0,
              height: "56px", // Match TextField height
              whiteSpace: "nowrap",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </label>
      </Box>

      {preview && (
        <Box
          sx={{
            position: "relative",
            display: "inline-block",
            mb: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 0,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              maxWidth: "100%",
              maxHeight: 200,
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={handleRemove}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              minWidth: "auto",
              borderRadius: 0,
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </Box>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: 0 }}>
          {uploadError}
        </Alert>
      )}
    </Box>
  );
}

