import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function CustomTextfield({ label, value, onChange }) {
  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={"1em"}
      flexBasis={"40%"}
    >
      <Typography fontWeight={500}>{label}</Typography>
      <TextField
        variant="outlined"
        size="small"
        type="number"
        value={value}
        onChange={onChange}
        sx={{
          "& .MuiInputBase-colorPrimary": {
            background: "white",
          },
        }}
      />
    </Box>
  );
}

export default CustomTextfield;
