import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CustomTextfield from "./components/customTextfield";
import CartesianPlane from "./components/CartesianPlane";

const columnsDasar = [
  { id: "x1", label: "X1" },
  { id: "dx", label: "dX" },
  { id: "x2", label: "X2" },
  { id: "y1", label: "Y(b)" },
  { id: "m", label: "M" },
  { id: "y2", label: "Y" },
];

const columnsDDA = [
  { id: "k", label: "K" },
  { id: "x", label: "X" },
  { id: "y", label: "Y" },
  { id: "xy", label: "Round(X), Round(Y)" },
];

const columnsBressenham = [
  { id: "k", label: "K" },
  { id: "pk", label: "PK" },
  { id: "xy", label: "(XK+1, YK+1)" },
];

function App() {
  // State for each input field
  const [x1Str, setX1] = useState("");
  const [y1Str, setY1] = useState("");
  const [x2Str, setX2] = useState("");
  const [y2Str, setY2] = useState("");

  const [columns, setColumns] = useState(columnsDasar);
  const [rows, setRows] = useState([]);
  const [coordinates, setCoordinates] = useState([]);

  const [alignment, setAlignment] = useState("dasar");
  const alignmentRef = useRef(alignment);

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  // Generate line image
  const handleGenerate = () => {
    let x1 = parseFloat(x1Str);
    let y1 = parseFloat(y1Str);
    let x2 = parseFloat(x2Str);
    let y2 = parseFloat(y2Str);

    if (!x1 || !y1 || !x2 || !y2) {
      setRows([]);
      return;
    }

    setCoordinates([]);

    if (alignment === "dasar") {
      setColumns(columnsDasar);
      setRows(generateDasar(x1, y1, x2, y2));
    } else if (alignment === "dda") {
      setColumns(columnsDDA);
      setRows(generateDDA(x1, y1, x2, y2));
    } else if (alignment === "bressenham") {
      setColumns(columnsBressenham);

      // Set smallest x value as first
      if (x1 < x2) {
        setRows(generateBressenham(x1, y1, x2, y2));
      } else {
        setRows(generateBressenham(x2, y2, x1, y1));
      }
    } else {
      handleClear();
      setAlignment("dasar");
    }
  };

  const generateDasar = (x1, y1, x2, y2) => {
    if (x1 === x2) {
      setRows([]);
      return [];
    }

    const m = (y2 - y1) / (x2 - x1);

    const newRows = [];
    const newCoords = [];
    newRows.push({ x1, dx: "", x2: x1, y1, m: "", y2: y1 }); // Initial value
    newCoords.push([x1, y1]);

    // Basic algorithm
    if (x1 < x2) {
      for (let i = x1, j = y1; i < x2; i++, j += m) {
        newRows.push({ x1: i, dx: 1, x2: i + 1, y1: j, m, y2: j + m });
        newCoords.push([i + 1, j + m]);
      }
    } else if (x1 > x2) {
      for (let i = x1, j = y1; i > x2; i--, j -= m) {
        newRows.push({ x1: i, dx: 1, x2: i - 1, y1: j, m, y2: j - m });
        newCoords.push([i - 1, j - m]);
      }
    }

    setCoordinates(newCoords);
    return newRows;
  };

  const generateDDA = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const step = Math.max(Math.abs(dx), Math.abs(dy));

    // Check if the are no steps
    if (step === 0) {
      setRows([]);
      return [];
    }

    // Determine steps and increments
    const xInc = dx / step;
    const yInc = dy / step;

    const newRows = [];
    const newCoords = [];
    // DDA Algorithm
    for (let k = 0, x = x1, y = y1; k <= step; k++, x += xInc, y += yInc) {
      newRows.push({
        k,
        x,
        y,
        xy: `(${Math.round(x)}, ${Math.round(y)})`,
      });
      newCoords.push([Math.round(x), Math.round(y)]);
    }

    setCoordinates(newCoords);
    return newRows;
  };

  const generateBressenham = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const p0 = 2 * dy - dx;

    const newRows = [];
    const newCoords = [];
    newRows.push({
      k: "",
      pk: "",
      xy: `(${x1}, ${y1})`,
    }); // Initial value

    // Bressenham algorithm
    for (let k = 0, pk = p0, x = x1, y = y1; x !== x2; k++) {
      if (pk < 0) {
        x = x + 1;
        pk = pk + 2 * dy;
      } else {
        x = x + 1;
        y = y + 1;
        pk = pk + 2 * dy - 2 * dx;
      }
      newRows.push({
        k,
        pk,
        xy: `(${x}, ${y})`,
      });
      newCoords.push([x, y]);
    }

    setCoordinates(newCoords);
    return newRows;
  };

  // Clear text fields
  const handleClear = () => {
    setX1("");
    setY1("");
    setX2("");
    setY2("");
    setRows([]);
  };

  useEffect(() => {
    alignmentRef.current = alignment;
  }, [alignment]);

  return (
    <Box
      margin={"1em"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={"2em"}
      sx={{ width: { xl: "80vw" } }}
    >
      <Typography fontSize={"calc(16px + 1vw)"} fontWeight={700}>
        Algoritma Penggambaran Garis
      </Typography>

      {/* TextField Section */}
      <Box
        display={"flex"}
        justifyContent={"center"}
        gap={"2em"}
        sx={{
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          display={"flex"}
          justifyContent={"center"}
          gap={"2em"}
          sx={{
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <CustomTextfield
            label={"X1"}
            value={x1Str}
            onChange={(e) => setX1(e.target.value)}
          />
          <CustomTextfield
            label={"Y1"}
            value={y1Str}
            onChange={(e) => setY1(e.target.value)}
          />
          <CustomTextfield
            label={"X2"}
            value={x2Str}
            onChange={(e) => setX2(e.target.value)}
          />
          <CustomTextfield
            label={"Y2"}
            value={y2Str}
            onChange={(e) => setY2(e.target.value)}
          />
        </Box>
        <Box display={"flex"} gap={"2em"} justifyContent={"center"}>
          <Box display={"flex"} alignItems={"center"} gap={"1em"}>
            <Typography fontWeight={500}>Algoritma</Typography>
            <ToggleButtonGroup
              color="primary"
              size="small"
              value={alignment}
              exclusive
              onChange={handleAlignment}
              aria-label="Algoritma"
            >
              <ToggleButton value="dasar">Dasar</ToggleButton>
              <ToggleButton value="dda">DDA</ToggleButton>
              <ToggleButton value="bressenham">Bressenham</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Button Section */}
      <Box display={"flex"} justifyContent={"center"} gap={"2em"}>
        <Button variant="contained" onClick={handleGenerate}>
          Generate
        </Button>
        <Button variant="outlined" onClick={handleClear}>
          Clear
        </Button>
      </Box>

      {/* Table Section */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table" border={1}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={"center"}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length !== 0 ? (
              rows.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    {columns.map((column) => {
                      return (
                        <TableCell key={column.id} align={"center"}>
                          {row[column.id]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow hover role="checkbox" tabIndex={-1}>
                <TableCell align={"center"} colSpan={6}>
                  Tidak ada titik-titik digital
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cartasius Diagram */}
      <CartesianPlane coordinates={coordinates} />
    </Box>
  );
}

export default App;
