import React, { useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  // Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function BlogSidebar({
  searchTerm,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  tags,
  activeTag,
  onTagChange,
  searchPlaceholder = "Search articles...",
}) {
  const sortedCategories = useMemo(
    () => {
      // Filter out "All" from categories if it exists, then add it at the beginning
      const categoriesWithoutAll = categories.filter(cat => cat !== "All");
      return ["All", ...categoriesWithoutAll].sort();
    },
    [categories]
  );
  const sortedTags = useMemo(() => [...tags].sort(), [tags]);

  return (
    <Box sx={{ px: { xs: 0, md: 0 }, py: { xs: 2, md: 4 } }}>
      {/* Search */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Search
      </Typography>
      <TextField
        variant="standard"
        fullWidth
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 4,
          "& .MuiInputBase-root": { borderBottom: "1px solid #ccc" },
        }}
      />

      {/* Categories */}
      <Box sx={{ my: 3, display: { xs: "none", md: "block" } }}>
        <Typography
          variant="h4"
          sx={{ mb: 0, fontWeight: 400, color: "secondary.dark" }}
        >
          Categories
        </Typography>
        <List sx={{ mb: 2 }}>
          {sortedCategories.map((cat) => (
            <ListItemButton
              key={cat}
              selected={activeCategory === cat}
              onClick={() => onCategoryChange(cat)}
              sx={{
                borderBottom: "1px solid #eee",
                "&.Mui-selected": {
                  backgroundColor: "transparent",
                  color: "text.primary",
                  fontWeight: 600,
                },
              }}
            >
              <ListItemText primary={cat} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Tags */}
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h4"
          sx={{ mb: 2, fontWeight: 400, color: "secondary.dark" }}
        >
          Tags
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {sortedTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => onTagChange(tag === activeTag ? "" : tag)}
              variant={activeTag === tag ? "filled" : "outlined"}
              color={activeTag === tag ? "secondary" : "default"}
              sx={{ borderRadius: 0 }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
