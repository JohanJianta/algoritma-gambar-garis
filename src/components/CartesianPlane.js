import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, Typography } from "@mui/material";

// Custom hook to get window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const CartesianPlane = ({ coordinates = [] }) => {
  const windowSize = useWindowSize();

  // Memoize dimension calculations
  const dimensions = useMemo(() => {
    const baseWidth = Math.min(windowSize.width, 1200);
    const baseHeight = Math.min(windowSize.height * 0.8, baseWidth);
    const padding = baseWidth * 0.01;

    return {
      width: baseWidth,
      height: baseHeight,
      padding: padding,
    };
  }, [windowSize.width, windowSize.height]);

  // Memoize coordinate calculations
  const coordsData = useMemo(() => {
    if (!coordinates.length) {
      return {
        minX: -10,
        maxX: 10,
        minY: -10,
        maxY: 10,
        centerX: 0,
        centerY: 0,
      };
    }

    const xValues = coordinates.map(([x]) => x);
    const yValues = coordinates.map(([_, y]) => y);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
      centerX: (Math.min(...xValues) + Math.max(...xValues)) / 2,
      centerY: (Math.min(...yValues) + Math.max(...yValues)) / 2,
    };
  }, [coordinates]);

  // Memoize grid calculations
  const gridSize = useMemo(() => {
    const xRange = Math.abs(coordsData.maxX - coordsData.minX);
    const yRange = Math.abs(coordsData.maxY - coordsData.minY);
    return Math.ceil(Math.max(xRange, yRange, 1) * 1.3);
  }, [coordsData]);

  const gridStep = useMemo(() => {
    return Math.min(
      (dimensions.width - 2 * dimensions.padding) / gridSize,
      (dimensions.height - 2 * dimensions.padding) / gridSize
    );
  }, [dimensions, gridSize]);

  // Coordinate conversion function
  const coordToSvgPoint = useCallback(
    (x, y) => {
      const svgX = (x - coordsData.centerX) * gridStep + dimensions.width / 2;
      const svgY = dimensions.height / 2 - (y - coordsData.centerY) * gridStep;
      return { svgX, svgY };
    },
    [coordsData, gridStep, dimensions]
  );

  // Render grid lines
  const renderGridLines = useMemo(() => {
    const lines = [];
    const linesCount = Math.ceil(gridSize);
    const centerLineX = Math.round(coordsData.centerX);
    const centerLineY = Math.round(coordsData.centerY);

    for (let i = -linesCount; i <= linesCount; i++) {
      const { svgX } = coordToSvgPoint(centerLineX + i, 0);
      const { svgY } = coordToSvgPoint(0, centerLineY + i);

      if (
        svgX >= dimensions.padding &&
        svgX <= dimensions.width - dimensions.padding
      ) {
        lines.push(
          <line
            key={`v${i}`}
            x1={svgX}
            y1={dimensions.padding}
            x2={svgX}
            y2={dimensions.height - dimensions.padding}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      }

      if (
        svgY >= dimensions.padding &&
        svgY <= dimensions.height - dimensions.padding
      ) {
        lines.push(
          <line
            key={`h${i}`}
            x1={dimensions.padding}
            y1={svgY}
            x2={dimensions.width - dimensions.padding}
            y2={svgY}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      }
    }
    return lines;
  }, [coordToSvgPoint, gridSize, dimensions, coordsData]);

  // Render points and connecting lines
  const renderPointsAndLines = useMemo(() => {
    const elements = [];

    // Add connecting lines
    if (coordinates.length > 1) {
      const linePath = coordinates
        .map(([x, y], index) => {
          const { svgX, svgY } = coordToSvgPoint(x, y);
          return `${index === 0 ? "M" : "L"} ${svgX} ${svgY}`;
        })
        .join(" ");

      elements.push(
        <path
          key="connecting-line"
          d={linePath}
          stroke="#1976d2"
          strokeWidth={2}
          fill="none"
        />
      );
    }

    // Add points
    coordinates.forEach(([x, y], index) => {
      const { svgX, svgY } = coordToSvgPoint(x, y);
      elements.push(
        <g key={`point-${index}`}>
          <circle cx={svgX} cy={svgY} r={4} fill="#1976d2" />
          <text x={svgX + 8} y={svgY - 8} style={{ fontSize: "12px" }}>
            ({x}, {y})
          </text>
        </g>
      );
    });

    return elements;
  }, [coordToSvgPoint, coordinates]);

  return (
    <Card sx={{ width: "100%", maxWidth: dimensions.width }}>
      <CardContent>
        <Typography variant="h6" gutterBottom textAlign={"center"}>
          Ilustrasi Titik-Titik Digital
        </Typography>

        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "white",
            aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          }}
        >
          {renderGridLines}

          {/* Axes */}
          <line
            x1={dimensions.padding}
            y1={dimensions.height / 2}
            x2={dimensions.width - dimensions.padding}
            y2={dimensions.height / 2}
            stroke="#000"
            strokeWidth={2}
          />
          <line
            x1={dimensions.width / 2}
            y1={dimensions.padding}
            x2={dimensions.width / 2}
            y2={dimensions.height - dimensions.padding}
            stroke="#000"
            strokeWidth={2}
          />

          {renderPointsAndLines}
        </svg>
      </CardContent>
    </Card>
  );
};

export default React.memo(CartesianPlane);
