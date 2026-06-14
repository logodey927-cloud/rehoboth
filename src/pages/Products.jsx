// import React, { useState } from "react";
// import {
//   Box,
//   Container,
//   Grid,
//   TextField,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   Chip,
//   Stack,
//   Typography,
// } from "@mui/material";
// import { motion } from "framer-motion";
// import ProductCard from "../components/common09/ProductCard";
// import InfoSection from "../components/common09/InfoSection";
// import { productsData } from "../data/productsData";

// const Products = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("name");

//   // Get unique categories
//   const categories = [
//     "All",
//     ...new Set(productsData.map((product) => product.category)),
//   ];

//   // Filter and sort products
//   const filteredProducts = productsData
//     .filter((product) => {
//       const matchesSearch =
//         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         product.description.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesCategory =
//         selectedCategory === "All" || product.category === selectedCategory;
//       return matchesSearch && matchesCategory;
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case "price-low":
//           return a.price - b.price;
//         case "price-high":
//           return b.price - a.price;
//         case "rating":
//           return b.rating - a.rating;
//         case "name":
//         default:
//           return a.name.localeCompare(b.name);
//       }
//     });

//   return (
//     <Box
//       component="main"
//       sx={{
//         minHeight: "100vh",
//         backgroundColor: "#fafafa",
//         pt: 2,
//         pb: 8,
//       }}
//     >
//       <Container maxWidth="xl">
//         {/* Header Section with InfoSection */}
//         <InfoSection
//           subtitle="Premium Collection"
//           title="Our Products"
//           description={[
//             "Discover our carefully curated collection of premium spa and wellness products. Each item is selected for its quality, effectiveness, and ability to enhance your self-care routine.",
//             "From luxurious skincare essentials to aromatherapy oils and wellness accessories, our products are designed to bring the spa experience into your home."
//           ]}
//           colorBtn="#0C6E6D"
//           btnText="View All Categories"
//           align="center"
//           btnAlign="center"
//         />

//         {/* Filters and Search */}
//         <Box
//           sx={{
//             mt: 6,
//             mb: 4,
//             p: 3,
//             backgroundColor: "white",
//             borderRadius: 2,
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Grid container spacing={3} alignItems="center">
//             <Grid item xs={12} md={4}>
//               <TextField
//                 fullWidth
//                 label="Search Products"
//                 variant="outlined"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 0,
//                   },
//                 }}
//               />
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <FormControl fullWidth>
//                 <InputLabel>Category</InputLabel>
//                 <Select
//                   value={selectedCategory}
//                   label="Category"
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   sx={{
//                     borderRadius: 0,
//                   }}
//                 >
//                   {categories.map((category) => (
//                     <MenuItem key={category} value={category}>
//                       {category}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <FormControl fullWidth>
//                 <InputLabel>Sort By</InputLabel>
//                 <Select
//                   value={sortBy}
//                   label="Sort By"
//                   onChange={(e) => setSortBy(e.target.value)}
//                   sx={{
//                     borderRadius: 0,
//                   }}
//                 >
//                   <MenuItem value="name">Name A-Z</MenuItem>
//                   <MenuItem value="price-low">Price: Low to High</MenuItem>
//                   <MenuItem value="price-high">Price: High to Low</MenuItem>
//                   <MenuItem value="rating">Highest Rated</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} md={2}>
//               <Box sx={{ textAlign: "center" }}>
//                 <Typography variant="body2" color="text.secondary">
//                   {filteredProducts.length} Products
//                 </Typography>
//               </Box>
//             </Grid>
//           </Grid>

//           {/* Active Filters */}
//           {(searchTerm || selectedCategory !== "All") && (
//             <Box sx={{ mt: 2 }}>
//               <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
//                 {searchTerm && (
//                   <Chip
//                     label={`Search: "${searchTerm}"`}
//                     onDelete={() => setSearchTerm("")}
//                     color="primary"
//                     variant="outlined"
//                   />
//                 )}
//                 {selectedCategory !== "All" && (
//                   <Chip
//                     label={`Category: ${selectedCategory}`}
//                     onDelete={() => setSelectedCategory("All")}
//                     color="secondary"
//                     variant="outlined"
//                   />
//                 )}
//               </Stack>
//             </Box>
//           )}
//         </Box>

//         {/* Products Grid */}
//         <Grid container spacing={3}>
//           {filteredProducts.map((product, index) => (
//             <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//               >
//                 <ProductCard {...product} />
//               </motion.div>
//             </Grid>
//           ))}
//         </Grid>

//         {/* No Results */}
//         {filteredProducts.length === 0 && (
//           <Box
//             sx={{
//               textAlign: "center",
//               py: 8,
//             }}
//           >
//             <Typography variant="h5" color="text.secondary" gutterBottom>
//               No products found
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Try adjusting your search or filter criteria
//             </Typography>
//           </Box>
//         )}
//       </Container>
//     </Box>
//   );
// };
import ComingSoonPage from "../components/pages/ComingSoonPage";
import { Box } from "@mui/material";

const Products = () => {
  return (
    <Box>
      <ComingSoonPage />
    </Box>
  );
};

export default Products;
