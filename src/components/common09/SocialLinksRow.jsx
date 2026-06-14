import React, { useEffect, useState } from "react";
import { Box, IconButton, CircularProgress } from "@mui/material";
import {
  Instagram,
  Facebook,
  LinkedIn,
  Twitter,
  YouTube,
} from "@mui/icons-material";
import { getSocialLinks } from "../../api/api";
import footerData from "../../data/footerData";

const MUI_ICONS = {
  Instagram,
  Facebook,
  LinkedIn,
  Twitter,
  YouTube,
};

function renderIcon(link) {
  const type = link.icon_type || link.icon || "Custom";
  const IconComp = MUI_ICONS[type];

  if (IconComp) {
    return <IconComp sx={{ color: "inherit" }} />;
  }

  const src = link.image_url || (type === "Faces" ? "/faces-business.png" : null);
  if (src) {
    return (
      <Box
        component="img"
        src={src}
        alt={link.label || type}
        sx={{
          width: 32,
          height: 32,
          objectFit: "contain",
          display: "block",
          filter: link.invert_logo ? "invert(1)" : "none",
        }}
      />
    );
  }

  return (
    <Box
      component="span"
      sx={{ fontSize: 12, fontWeight: 600, color: "inherit", px: 0.5 }}
    >
      {(link.label || type).slice(0, 2).toUpperCase()}
    </Box>
  );
}

/**
 * Footer / contact social link row — loads from API with static fallback.
 */
export default function SocialLinksRow({ sx = {} }) {
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSocialLinks()
      .then((res) => {
        if (res.data?.success && res.data.socialLinks?.length) {
          setLinks(res.data.socialLinks);
        } else {
          setLinks(footerData.socials);
        }
      })
      .catch(() => setLinks(footerData.socials))
      .finally(() => setLoading(false));
  }, []);

  const items = links || footerData.socials;

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 1, ...sx }}>
        <CircularProgress size={22} sx={{ color: "#000" }} />
      </Box>
    );
  }

  if (!items.length) return null;

  return (
    <Box sx={{ textAlign: "center", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 0.5, ...sx }}>
      {items.map((s) => (
        <IconButton
          key={s.id || `${s.url}-${s.label}`}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label || s.icon_type || s.icon}
          sx={{
            color: "#000000",
            transition: "opacity 0.3s ease",
            "&:hover": { opacity: 0.7 },
          }}
        >
          {renderIcon(s)}
        </IconButton>
      ))}
    </Box>
  );
}
