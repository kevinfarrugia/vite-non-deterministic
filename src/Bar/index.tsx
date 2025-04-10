import React, { useEffect, useRef, useState } from "react";
import { format, addDays, addMinutes, startOfDay } from "date-fns";

// Type definitions

type DateCell = {
  id: string;
  timestamp: Date;
};

// Utility functions

const generateRandomDate = (baseDate: Date): Date => {
  const randomDays = Math.floor(Math.random() * 365);
  const randomMinutes = Math.floor(Math.random() * 1440);
  return addMinutes(addDays(baseDate, randomDays), randomMinutes);
};

const generateGrid = (rows: number, cols: number): DateCell[][] => {
  const baseDate = startOfDay(new Date());
  const grid: DateCell[][] = [];
  for (let row = 0; row < rows; row++) {
    const currentRow: DateCell[] = [];
    for (let col = 0; col < cols; col++) {
      const randomDate = generateRandomDate(baseDate);
      currentRow.push({
        id: `${row}-${col}`,
        timestamp: randomDate,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

// Hooks

const useLargeGrid = (rows: number, cols: number): DateCell[][] => {
  const [grid, setGrid] = useState<DateCell[][]>([]);
  useEffect(() => {
    const generatedGrid = generateGrid(rows, cols);
    setGrid(generatedGrid);
  }, [rows, cols]);
  return grid;
};

// Styles

const CELL_STYLE: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
  fontSize: "0.9rem",
  fontFamily: "monospace",
};

const ROW_STYLE: React.CSSProperties = {
  display: "flex",
};

const GRID_CONTAINER_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxHeight: "70vh",
  overflowY: "auto",
};

// Components

const InfoPanel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ margin: "4px 0" }}>
    <strong>{label}:</strong> {value}
  </div>
);

const StatsSection: React.FC<{ cells: DateCell[] }> = ({ cells }) => {
  const timestamps = cells.map((c) => c.timestamp.getTime());
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));
  return (
    <div style={{ padding: 16, border: "1px solid #eee", marginTop: 16 }}>
      <h3>Grid Stats</h3>
      <InfoPanel label="Total Cells" value={cells.length.toString()} />
      <InfoPanel label="Earliest Date" value={format(minDate, "yyyy-MM-dd HH:mm")} />
      <InfoPanel label="Latest Date" value={format(maxDate, "yyyy-MM-dd HH:mm")} />
    </div>
  );
};

const DateCellComponent: React.FC<{ cell: DateCell }> = ({ cell }) => {
  const formatted = format(cell.timestamp, "yyyy-MM-dd HH:mm");
  return <div style={CELL_STYLE}>{formatted}</div>;
};

const RowComponent: React.FC<{ row: DateCell[]; index: number }> = ({ row, index }) => (
  <div key={index} style={ROW_STYLE}>
    {row.map((cell) => (
      <DateCellComponent key={cell.id} cell={cell} />
    ))}
  </div>
);

const FilterPanel: React.FC<{
  onFilter: (start: string, end: string) => void;
}> = ({ onFilter }) => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSubmit = () => {
    onFilter(start, end);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label>
        Start Date:
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label style={{ marginLeft: 8 }}>
        End Date:
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </label>
      <button style={{ marginLeft: 8 }} onClick={handleSubmit}>
        Filter
      </button>
    </div>
  );
};

const PAGE_SIZE = 20;

const Bar: React.FC = () => {
  const fullGrid = useLargeGrid(200, 10); // 2000 cells
  const flatCells = fullGrid.flat();
  const [filteredCells, setFilteredCells] = useState<DateCell[]>(flatCells);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setFilteredCells(flatCells);
  }, [fullGrid]);

  const handleFilter = (start: string, end: string) => {
    const startDate = start ? new Date(start) : new Date(0);
    const endDate = end ? new Date(end) : new Date(8640000000000000);
    const filtered = flatCells.filter((cell) => cell.timestamp >= startDate && cell.timestamp <= endDate);
    setFilteredCells(filtered);
    setPage(1);
  };

  const handleSortToggle = () => {
    const sorted = [...filteredCells].sort((a, b) =>
      sortAsc ? b.timestamp.getTime() - a.timestamp.getTime() : a.timestamp.getTime() - b.timestamp.getTime()
    );
    setFilteredCells(sorted);
    setSortAsc(!sortAsc);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const visibleCells = filteredCells.slice(0, page * PAGE_SIZE);
  const groupedRows: DateCell[][] = [];
  for (let i = 0; i < visibleCells.length; i += 10) {
    groupedRows.push(visibleCells.slice(i, i + 10));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Bar</h2>
      <FilterPanel onFilter={handleFilter} />
      <button onClick={handleSortToggle}>Sort {sortAsc ? "Descending" : "Ascending"}</button>
      <div style={GRID_CONTAINER_STYLE} ref={containerRef}>
        {groupedRows.map((row, index) => (
          <RowComponent key={index} row={row} index={index} />
        ))}
      </div>
      <StatsSection cells={visibleCells} />
    </div>
  );
};

export default Bar;
// This component was generated by ChatGPT and outputs a grid of random dates.