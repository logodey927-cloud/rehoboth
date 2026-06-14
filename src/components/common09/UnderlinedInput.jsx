import React from "react";
import { TextField } from "@mui/material";

const UnderlinedInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  multiline = false,
  rows = 1,
  required = false,
  error = false,
  helperText = "",
  ...otherProps
}) => {
  return (
    <TextField
      variant="standard"
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      multiline={multiline}
      rows={rows}
      required={required}
      error={error}
      helperText={helperText}
      fullWidth
      {...otherProps}
      sx={{
        mb: 3,
        "& .MuiInputBase-root": {
          color: "#000",
        },
        "& .MuiInputLabel-root": {
          color: "#000",
          fontSize: "0.95rem",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#000",
        },
        "& .MuiInputLabel-root.Mui-error": {
          color: "#d32f2f",
        },
        "& .MuiInput-underline:before": {
          borderBottomColor: error ? "#d32f2f" : "#636363ff",
        },
        "& .MuiInput-underline:hover:before": {
          borderBottomColor: error ? "#d32f2f" : "#000",
        },
        "& .MuiInput-underline:after": {
          borderBottomColor: error ? "#d32f2f" : "#000",
        },
        "& .MuiFormHelperText-root": {
          color: error ? "#d32f2f" : "rgba(0, 0, 0, 0.6)",
          fontSize: "0.75rem",
          marginTop: "4px",
        },
        ...otherProps.sx,
      }}
    />
  );
};

export default UnderlinedInput;
