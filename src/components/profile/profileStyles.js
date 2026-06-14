/** Shared styles for My Account profile dashboard cards */

export const profileCardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 0,
  bgcolor: "#fff",
  border: "none",
  boxShadow: "0 4px 24px rgba(71, 103, 47, 0.08)",
};

export const profileCardFullHeightSx = {
  ...profileCardSx,
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

export const profileSectionTitleSx = {
  fontWeight: 700,
  fontSize: "1.05rem",
  color: "secondary.dark",
};

export const profileViewAllSx = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "secondary.main",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
};

/** Square inputs — used on all /my-account pages via AccountLayout */
export const accountInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
  },
};

export const accountFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    bgcolor: "#fafafa",
    "&.Mui-disabled": { bgcolor: "#f5f5f5" },
  },
};

/** Matches header StyledButton (primary / outlined green) */
export const accountStyledButtonSx = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
};
