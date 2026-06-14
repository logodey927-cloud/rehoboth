// client/src/components/Services/Sidebar.jsx
import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  // Slider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Sidebar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  // priceRange,
  // setPriceRange,
}) => {
  // const handlePriceChange = (event, newValue) => {
  //   setPriceRange(newValue);
  // };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "25%" },
        flexShrink: 0,
        height: { xs: "auto", md: "100%" },
        minHeight: { md: 0 },
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 4 },
        borderRight: { md: "1px solid #eee" },
        overflowY: { xs: "visible", md: "auto" },
        overflowX: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* Search */}
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 500,
        }}
      >
        Search
      </Typography>
      <TextField
        variant="standard"
        fullWidth
        placeholder="Search treatment..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
      <Typography
        variant="h4"
        sx={{ mb: 0, fontWeight: 400, color: "secondary.dark" }}
      >
        Treatment Categories
      </Typography>
      <List sx={{ mb: 4 }}>
        {categories.map((cat) => (
          <ListItemButton
            key={cat}
            selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
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

      {/* Filter by Price
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Filter by Price
      </Typography>
      <Slider
        value={priceRange}
        onChange={handlePriceChange}
        valueLabelDisplay="auto"
        min={30}
        max={250}
        sx={{ color: "#1976d2" }}
      /> */}
      {/* <Typography variant="body2" color="text.secondary">
        Price range: ${priceRange[0]} - ${priceRange[1]}
      </Typography> */}
    </Box>
  );
};

export default Sidebar;
