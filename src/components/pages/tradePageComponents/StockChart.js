import React from 'react';
import Chart from "react-apexcharts";

// --- Actual StockChart component ---
const StockChart = ({ stockData, simplifyGraph }) => {
    if (!stockData || !stockData.data || stockData.data.length === 0) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
          {" "}
          No data available for chart.{" "}
        </div>
      );
    }
  
    const chartType = simplifyGraph ? "line" : "candlestick";
  
    const series = simplifyGraph
      ? [
          {
            name: `${stockData.symbol} (Close)`,
            data: stockData.data
              .map((item) => ({
                x: item.x,
                y:
                  item.y && item.y.length > 3 && typeof item.y[3] === "number"
                    ? item.y[3]
                    : null,
              }))
              .filter((item) => item.y !== null),
          },
        ]
      : [
          {
            name: stockData.symbol,
            data: stockData.data.filter(
              (item) =>
                Array.isArray(item.y) &&
                item.y.length === 4 &&
                item.y.every((p) => typeof p === "number")
            ),
          },
        ];
  
    if (!series[0] || !series[0].data || series[0].data.length === 0) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100 text-warning">
          {" "}
          Insufficient valid data points for {stockData.symbol}.{" "}
        </div>
      );
    }
  
    // --- MODIFICATION START ---
    const options = {
      chart: {
        type: chartType,
        height: 350,
        background: "transparent",
        foreColor: "#adb5bd",
        animations: { enabled: true, easing: "easeinout", speed: 500 },
      },
      theme: { mode: "dark" },
      title: { text: undefined },
      xaxis: { type: "datetime", labels: { datetimeUTC: false } },
      yaxis: {
        tooltip: { enabled: true },
        labels: {
          formatter: function (v) {
            return typeof v === "number" ? "$" + v.toFixed(2) : "$ --";
          },
        },
      },
      tooltip: {
        theme: "dark",
        x: { format: "dd MMM yy HH:mm" },
        // Explicitly format the Y value in the tooltip
        y: {
          formatter: function (
            value,
            { series, seriesIndex, dataPointIndex, w }
          ) {
            // For line chart (simplifyGraph=true), 'value' is the direct y-value (close price)
            if (simplifyGraph) {
              return typeof value === "number" ? "$" + value.toFixed(2) : "$ --";
            }
            // For candlestick, ApexCharts default often works, but we can be explicit
            // The 'value' might not be useful directly here, we need original OHLC
            // Accessing original data point: w.globals.initialSeries[seriesIndex].data[dataPointIndex]
            const point =
              w.globals.initialSeries[seriesIndex]?.data[dataPointIndex];
            if (point && Array.isArray(point.y) && point.y.length === 4) {
              // const [open, high, low, close] = point.y;
              // You could format this differently if needed, but default usually shows OHLC
              // This formatter primarily helps ensure the line chart doesn't error
              // Let's return the close price formatted for consistency if needed,
              // otherwise rely on default OHLC display for candlestick.
              // Returning undefined lets ApexCharts use its default for candlestick.
              return undefined;
            }
            // Fallback if something goes wrong
            return typeof value === "number" ? "$" + value.toFixed(2) : "$ --";
          },
          title: {
            // Optional: Use series name for tooltip title
            formatter: (seriesName) => seriesName,
          },
        },
      },
      grid: { borderColor: "#555" },
      ...(chartType === "candlestick" && {
        plotOptions: {
          candlestick: { colors: { upward: "#00B746", downward: "#EF403C" } },
        },
      }),
      ...(chartType === "line" && {
        stroke: { curve: "smooth", width: 2 },
        markers: { size: 0 },
      }),
    };
    // --- MODIFICATION END ---
  
    return (
      <Chart
        options={options}
        series={series}
        type={chartType}
        height={350}
        width="100%"
      />
    );
  };

export default StockChart
