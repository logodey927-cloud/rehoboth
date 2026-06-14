import { Box, Typography, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import footerData from "../../data/footerData";

export default function FooterLinks() {
  // const handleLinkClick = () => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 1.5,
        flexWrap: "wrap",
        my: 4,
      }}
    >
      {footerData.links.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            component={Link}
            to={item.route}
            // onClick={handleLinkClick}
            sx={{
              textDecoration: "none",
              color: "#000",
              fontWeight: 500,
              transition: "color 0.3s ease",
              "&:hover": {
                color: "#f58c00",
              },
            }}
          >
            {item.label}
          </Typography>

          {i !== footerData.links.length - 1 && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, bgcolor: "#000" }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}
