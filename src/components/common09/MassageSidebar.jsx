import { Box, Button } from "@mui/material";

const MassageSidebar = ({ massages, active, setActive }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {massages.map((item) => (
        <Button
          key={item.id}
          onClick={() => setActive(item)}
          sx={{
            textAlign: "left",
            color: active.id === item.id ? "#fff" : "#4A4A4A",
            backgroundColor:
              active.id === item.id ? "rgb(92,120,70)" : "rgba(92,120,70,0.1)",
            "&:hover": {
              backgroundColor: "rgba(92,120,70,0.85)",
              color: "#fff",
            },
            borderRadius: 0,
            py: 1.5,
            fontSize: "15px",
          }}
        >
          {item.title}
        </Button>
      ))}
    </Box>
  );
};

export default MassageSidebar;
