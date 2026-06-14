import { Box, Typography } from "@mui/material";
import { Phone, Email, LocationOn } from "@mui/icons-material";
import footerData from "../../data/footerData";

export default function FooterContact() {
  const { phone, phoneLandline, email, address } = footerData.contact;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: {
          xs: "center",
          md: "flex-start",
          lg: "flex-start",
        },
        alignItems: {
          xs: "center",
          md: "flex-start",
          lg: "flex-start",
        },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Contact
      </Typography>

      {phone && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
          <Phone fontSize="small" />
          <Typography>{phone} {phoneLandline && `| ${phoneLandline}`}</Typography>
        </Box>
      )}

      {email && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
          <Email fontSize="small" />
          <Typography>{email}</Typography>
        </Box>
      )}

      {address && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <LocationOn fontSize="small" />
          <Typography>{address}</Typography>
        </Box>
      )}
    </Box>
  );
}
