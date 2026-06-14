import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function PriceTable({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h4"
        sx={{
          color: "secondary.dark",
          fontSize: { xs: "1rem", sm: "1.3rem", md: "1.6rem" },
          fontWeight: 400,
          mb: 2,
        }}
      >
        Treatment Menu & Prices
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ boxShadow: 0, borderRadius: 0, border: "1px solid #e6e6e6" }}
      >
        <Table size="big" aria-label="treatment price table" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "#fafafa" }}>
              <TableCell sx={{ fontWeight: 700, width: { md: "60%" } }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: { md: "20%" } }}>
                Duration
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: { md: "20%" } }}>
                Price
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, idx) => {
              const durations =
                it.durations && it.durations.length
                  ? it.durations
                  : [{ minutes: "", price: "" }];
              return durations.map((d, i) => (
                <TableRow key={`${idx}-${i}`}>
                  {i === 0 && (
                    <TableCell
                      rowSpan={durations.length}
                      sx={{ fontWeight: 600 }}
                    >
                      {it.name}
                    </TableCell>
                  )}
                  <TableCell sx={{ color: "secondary.dark", fontWeight: 600 }}>
                    {d.minutes ? `${d.minutes} minutes` : ""}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {d.price !== "" ? `£${d.price}` : ""}
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
