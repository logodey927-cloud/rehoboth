// components/PricingPack/PricingTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const PricingTable = ({ offers }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ boxShadow: 0, border: "1px solid #e6e6e6", borderRadius: 0 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                bgcolor: "secondary.dark",
                color: "#fff",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              Days
            </TableCell>
            <TableCell
              sx={{
                bgcolor: "primary.light",
                color: "text.primary",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              Timing
            </TableCell>
            <TableCell
              sx={{
                bgcolor: "secondary.dark",
                color: "#fff",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              Offers
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {offers.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell align="center">{row.days}</TableCell>
              <TableCell align="center">{row.timing}</TableCell>
              <TableCell align="center">{row.offer}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PricingTable;
