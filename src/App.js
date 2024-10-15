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

  const canvasRef = useRef(null);

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
      clearCanvas();
      return;
    }

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
      clearCanvas();
      return [];
    }

    const m = (y2 - y1) / (x2 - x1);

    const newRows = [];
    newRows.push({ x1, dx: "", x2: x1, y1, m: "", y2: y1 }); // Initial value

    // Basic algorithm
    if (x1 < x2) {
      for (let i = x1, j = y1; i < x2; i++, j += m) {
        newRows.push({ x1: i, dx: 1, x2: i + 1, y1: j, m, y2: j + m });
      }
    } else if (x1 > x2) {
      for (let i = x1, j = y1; i > x2; i--, j -= m) {
        newRows.push({ x1: i, dx: 1, x2: i - 1, y1: j, m, y2: j - m });
      }
    }

    return newRows;
  };

  const generateDDA = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const step = Math.max(Math.abs(dx), Math.abs(dy));

    // Check if the are no steps
    if (step === 0) {
      setRows([]);
      clearCanvas();
      return [];
    }

    // Determine steps and increments
    const xInc = dx / step;
    const yInc = dy / step;

    const newRows = [];
    // DDA Algorithm
    for (let k = 0, x = x1, y = y1; k <= step; k++, x += xInc, y += yInc) {
      newRows.push({
        k,
        x,
        y,
        xy: `(${Math.round(x)}, ${Math.round(y)})`,
      });
    }

    return newRows;
  };

  const generateBressenham = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const p0 = 2 * dy - dx;

    const newRows = [];
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
    }

    return newRows;
  };

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Clear text fields
  const handleClear = () => {
    setX1("");
    setY1("");
    setX2("");
    setY2("");
    setRows([]);
    clearCanvas();
  };

  useEffect(() => {
    alignmentRef.current = alignment;
  }, [alignment]);

  useEffect(() => {
    // Draw lines whenever rows change
    const drawLines = (rows) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (rows.length === 0) return;

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      if (alignmentRef.current === "dda") {
        rows.forEach((row) => {
          const x = Math.round(row.x);
          const y = Math.round(row.y);

          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });
      } else if (alignmentRef.current === "dasar") {
        rows.forEach((row) => {
          const { x1, y1, x2, y2 } = row;

          minX = Math.min(minX, x1, x2);
          maxX = Math.max(maxX, x1, x2);
          minY = Math.min(minY, y1, y2);
          maxY = Math.max(maxY, y1, y2);
        });
      } else if (alignmentRef.current === "bressenham") {
        rows.forEach((row) => {
          // Remove parentheses and split the string by the comma
          const values = row.xy.replace(/[()]/g, "").split(",");

          // Convert the string values to integers
          const x = parseInt(values[0]);
          const y = parseInt(values[1]);

          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });
      }

      const padding = 2;
      minX -= padding;
      maxX += padding;
      minY -= padding;
      maxY += padding;

      // Calculate scale and focus position
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scaleX = canvasWidth / (maxX - minX);
      const scaleY = canvasHeight / (maxY - minY);
      const scale = Math.min(scaleX, scaleY) - 0.7;

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      ctx.save();
      ctx.translate(canvasCenterX, canvasCenterY);
      ctx.scale(scale, -scale);
      ctx.translate(-centerX, -centerY);

      // Draw grid lines and labels (floating x and y axes)
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1 / scale;

      for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        ctx.beginPath();
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
        ctx.stroke();
      }

      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        ctx.beginPath();
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
        ctx.stroke();
      }

      // Draw x and y axes in black (cartesius)
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.moveTo(minX, 0);
      ctx.lineTo(maxX, 0); // x-axis
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, minY);
      ctx.lineTo(0, maxY); // y-axis
      ctx.stroke();

      // Continue drawing the lines based on current algorithm
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1 / scale;

      if (alignmentRef.current === "dda") {
        let prevX, prevY;
        rows.forEach((row, index) => {
          const x = Math.round(row.x);
          const y = Math.round(row.y);

          if (index > 0) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }

          prevX = x;
          prevY = y;

          // Draw the point at (x, y)
          ctx.beginPath();
          ctx.arc(x, y, 4 / scale, 0, Math.PI * 2, true);
          ctx.fillStyle = "red";
          ctx.fill();
        });
      } else if (alignmentRef.current === "dasar") {
        rows.forEach((row) => {
          const { x1, y1, x2, y2 } = row;

          // Draw the line
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Draw the points at (x1, y1) and (x2, y2)
          ctx.beginPath();
          ctx.arc(x1, y1, 4 / scale, 0, Math.PI * 2, true);
          ctx.fillStyle = "red";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x2, y2, 4 / scale, 0, Math.PI * 2, true);
          ctx.fillStyle = "red";
          ctx.fill();
        });
      } else if (alignmentRef.current === "bressenham") {
        let prevX, prevY;
        rows.forEach((row, index) => {
          const [x, y] = row.xy.replace(/[()]/g, "").split(",").map(Number);

          if (index > 0) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }

          prevX = x;
          prevY = y;

          // Draw the point at (x, y)
          ctx.beginPath();
          ctx.arc(x, y, 4 / scale, 0, Math.PI * 2, true);
          ctx.fillStyle = "red";
          ctx.fill();
        });
      }

      // Restore context to unflip y-axis before drawing labels
      ctx.restore();

      // Draw labels for only the first and last coordinates
      const firstRow = rows[0];
      const lastRow = rows[rows.length - 1];

      if (firstRow && lastRow) {
        let firstX, firstY, lastX, lastY;
        if (alignmentRef.current === "dda") {
          firstX = Math.round(firstRow.x);
          firstY = Math.round(firstRow.y);

          lastX = Math.round(lastRow.x);
          lastY = Math.round(lastRow.y);
        } else if (alignmentRef.current === "dasar") {
          firstX = firstRow.x1;
          firstY = firstRow.y1;

          lastX = lastRow.x2;
          lastY = lastRow.y2;
        } else if (alignmentRef.current === "bressenham") {
          [firstX, firstY] = firstRow.xy
            .replace(/[()]/g, "")
            .split(",")
            .map(Number);
          [lastX, lastY] = lastRow.xy
            .replace(/[()]/g, "")
            .split(",")
            .map(Number);
        }

        // Set font style and color for labels
        ctx.fillStyle = "black";
        ctx.font = `16px Arial`;

        const scaledFirstX = canvasCenterX + (firstX - centerX) * scale;
        const scaledFirstY = canvasCenterY - (firstY - centerY) * scale;
        const scaledLastX = canvasCenterX + (lastX - centerX) * scale;
        const scaledLastY = canvasCenterY - (lastY - centerY) * scale;

        ctx.fillText(`(${firstX}, ${firstY})`, scaledFirstX, scaledFirstY);
        ctx.fillText(`(${lastX}, ${lastY})`, scaledLastX, scaledLastY);
      }
    };

    if (rows.length > 0) {
      drawLines(rows);
    }
  }, [rows]);

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

      {/* Canvas Section for drawing lines */}
      <Box
        marginTop={"1em"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        gap={"1em"}
        width={"100%"}
      >
        <Typography fontSize={"calc(8px + 1vw)"} fontWeight={700}>
          Ilustrasi Titik-Titik Digital
        </Typography>
        <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
      </Box>
    </Box>
  );
}

export default App;
