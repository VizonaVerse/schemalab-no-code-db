import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import "./table-node.scss";
import { useCanvasContext } from "../../../../contexts/canvas-context";

// metadata for each row (type, flags, default)
type RowMeta = {
  type: string;
  nn: boolean;
  pk: boolean;
  ai: boolean;
  unique: boolean;
  default?: string;
};

// Define the custom TableNode component
export const TableNode = ({
  id,
  data,
}: {
  id: string;
  data: {
    label: string;
    tableData: string[][];
    rowMeta?: RowMeta[]; // Add rowMeta to the data type
    dataModeRows?: string[][]; // Add dataModeRows to the data type
  };
}) => {
  const { mode, updateNodeData, selectedNodes } = useCanvasContext();
  const rowHeight = 28.5;
  const MAX_BUILD_ROWS = 7;
  const [tableName, setTableName] = useState(data.label);
  const [tableData, setTableData] = useState(data.tableData || Array.from({ length: 1 }).map(() => ["", ""]));
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isSelected = selectedNodes?.some(n => n.id === id);

  const defaultMeta = (): RowMeta => ({
    type: "INT",
    nn: false,
    pk: false,
    ai: false,
    unique: false,
    default: "",
  });

  const [rowMeta, setRowMeta] = useState<RowMeta[]>(
    () => tableData.map(() => defaultMeta())
  );

  // Sync rowMeta length with tableData length
  useEffect(() => {
    setRowMeta((prev) => {
      const copy = [...prev];
      while (copy.length < tableData.length) copy.push(defaultMeta());
      while (copy.length > tableData.length) copy.pop();
      return copy;
    });
  }, [tableData.length]);

  // Get first column from build mode, and display as data mode headers
  const headers = tableData.map(row => row[0] || "");
  const numColumns = headers.length;

  const [dataModeRows, setDataModeRows] = useState<string[][]>(
    data.dataModeRows || Array.from({ length: 1 }).map(() => Array.from({ length: Math.max(1, numColumns) }).map(() => ""))
  );

  // Sync dataModeRows column count with headers
  useEffect(() => {
    setDataModeRows((prev) => {
      const targetCols = Math.max(1, numColumns);
      return prev.map((row) => {
        const newRow = row.slice(0, targetCols);
        while (newRow.length < targetCols) newRow.push("");
        return newRow;
      });
    });
  }, [numColumns]);

  const handleDoubleClickTableName = () => {
    const newName = prompt("Edit table name:", tableName);
    if (newName !== null) {
      setTableName(newName);
      updateNodeData(id, { label: newName });
    }
  };

  const handleDoubleClickCell = (rowIndex: number, colIndex: number) => {
    const newValue = prompt("Edit cell value:", tableData[rowIndex][colIndex]);
    if (newValue !== null) {
      const updatedTable = [...tableData];
      updatedTable[rowIndex][colIndex] = newValue;
      setTableData(updatedTable);
      updateNodeData(id, { tableData: updatedTable });
    }
  };

  const handleDoubleClickDataModeCell = (rowIndex: number, colIndex: number) => {
    const newValue = prompt("Edit cell value:", dataModeRows[rowIndex][colIndex]);
    if (newValue !== null) {
      const updatedRows = [...dataModeRows];
      updatedRows[rowIndex][colIndex] = newValue;
      setDataModeRows(updatedRows);
      updateNodeData(id, { tableData, rowMeta, dataModeRows: updatedRows });
    }
  };

  const addBuildRow = () => {
    if (tableData.length < MAX_BUILD_ROWS) {
      const newRow = Array.from({ length: tableData[0]?.length || 2 }).map(() => "");
      const updatedTable = [...tableData, newRow];
      setTableData(updatedTable);
      updateNodeData(id, { tableData: updatedTable });
    }
  };

  const deleteBuildRow = (rowIndex: number) => {
    if (tableData.length > 1) {
      const updatedTable = tableData.filter((_, idx) => idx !== rowIndex);
      setTableData(updatedTable);
      updateNodeData(id, { tableData: updatedTable });
    }
  };

  const addDataModeRow = () => {
    const newRow = Array.from({ length: numColumns }).map(() => "");
    const updatedRows = [...dataModeRows, newRow];
    setDataModeRows(updatedRows);
    updateNodeData(id, { tableData, rowMeta, dataModeRows: updatedRows });
  };

  const deleteDataModeRow = (rowIndex: number) => {
    if (dataModeRows.length > 1) {
      const updatedRows = dataModeRows.filter((_, idx) => idx !== rowIndex);
      setDataModeRows(updatedRows);
      updateNodeData(id, { tableData, rowMeta, dataModeRows: updatedRows });
    }
  };

  // popover state
  const [openPopoverRow, setOpenPopoverRow] = useState<number | null>(null);
  const [popoverPlacement, setPopoverPlacement] = useState<"right" | "left">("right");
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Close the popover if the click is outside both the popover and the table node (not correctly functional yet)
      if (
        openPopoverRow !== null &&
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpenPopoverRow(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopoverRow]);

  const togglePopover = (rowIndex: number) => {
    if (openPopoverRow === rowIndex) {
      setOpenPopoverRow(null);
      return;
    }
    // decide placement
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const popoverWidth = 260; // estimate
      setPopoverPlacement(spaceRight > popoverWidth ? "right" : "left");
    }
    setOpenPopoverRow(rowIndex);
  };

  const updateTableData = (updatedTable: string[][]) => {
    setTableData(updatedTable);
    updateNodeData(id, { tableData: updatedTable, rowMeta, dataModeRows });
  };
// If pk is selected, make it exclusive
  const updateRowMeta = (rowIndex: number, patch: Partial<RowMeta>) => {
    setRowMeta((prev) => {
      const next = prev.map((m, i) => {
        if (i === rowIndex) {
          if (patch.pk) {
            return { ...m, ...patch, pk: true };
          }
          return { ...m, ...patch };
        }
        if (patch.pk) {
          return { ...m, pk: false };
        }
        return m;
      });

      updateNodeData(id, { tableData, rowMeta: next, dataModeRows });
      return next;
    });
  };

  const updateDataModeRows = (updatedRows: string[][]) => {
    setDataModeRows(updatedRows);
    updateNodeData(id, { tableData, rowMeta, dataModeRows: updatedRows });
  };

  const isBuildMode = mode === "build";

  return (
    <div className={`table-node ${isBuildMode ? 'build-mode' : 'data-mode'} ${isSelected ? 'selected' : ''}`} ref={containerRef}>
      <h4 className="table-title" onDoubleClick={handleDoubleClickTableName}>
        {tableName}
      </h4>
      <table className="table-content">
        {isBuildMode ? (
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* first column: data name */}
                <td>
                  <span onDoubleClick={() => handleDoubleClickCell(rowIndex, 0)}>
                    {row[0] || "Empty"}
                  </span>
                </td>

                {/* second column: attribute button / popover trigger */}
                <td>
                  <button
                    className="attr-button"
                    onClick={() => togglePopover(rowIndex)}
                    aria-expanded={openPopoverRow === rowIndex}
                  >
                    {/* show the computed comma-separated checkbox labels (or empty) */}
                    {(() => {
                      const meta = rowMeta[rowIndex] || defaultMeta();
                      const labels: string[] = [];
                      if (meta.nn) labels.push("NN");
                      if (meta.pk) labels.push("PK");
                      if (meta.unique) labels.push("U");
                      return labels.join(", ");
                    })()}
                    <span className="caret">▾</span>
                  </button>

                  {openPopoverRow === rowIndex && (
                    <div
                      className={`attr-popover ${popoverPlacement}`}
                      ref={popoverRef}
                      style={{
                        top: `${rowIndex * rowHeight + 40}px`,
                      }}
                    >
                      <div className="popover-row">
                        <label>Type</label>
                        <select
                          value={rowMeta[rowIndex]?.type}
                          onChange={(e) => {
                            const selectedType = e.target.value;
                            updateRowMeta(rowIndex, { type: selectedType });
                          }}
                        >
                          <option value="INT">INT</option>
                          <option value="INTEGER">INTEGER</option>
                          <option value="TINYINT">TINYINT</option>
                          <option value="SMALLINT">SMALLINT</option>
                          <option value="MEDIUMINT">MEDIUMINT</option>
                          <option value="BIGINT">BIGINT</option>
                          <option value="INT2">INT2</option>
                          <option value="INT8">INT8</option>
                          <option value="DECIMAL">DECIMAL</option>
                          <option value="REAL">REAL</option>
                          <option value="DOUBLE">DOUBLE</option>
                          <option value="FLOAT">FLOAT</option>
                          <option value="NUMERIC">NUMERIC</option>
                          <option value="CHARACTER">CHARACTER</option>
                          <option value="VARCHAR">VARCHAR</option>
                          <option value="NCHAR">NCHAR</option>
                          <option value="NVARCHAR">NVARCHAR</option>
                          <option value="TEXT">TEXT</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                          <option value="DATE">DATE</option>
                          <option value="DATETIME">DATETIME</option>
                        </select>
                      </div>

                      {/* Input for types with parameters */}
                      {["DECIMAL", "CHARACTER", "VARCHAR", "NCHAR", "NVARCHAR"].includes(rowMeta[rowIndex]?.type.split("(")[0]) && (
                        <div className="popover-row">
                          <label>
                            {rowMeta[rowIndex]?.type.startsWith("DECIMAL")
                              ? "Total digits, digits after decimal point"
                              : "Length"}
                          </label>
                          <input
                            type="text"
                            placeholder={
                              rowMeta[rowIndex]?.type.startsWith("DECIMAL")
                                ? "e.g., 4,2"
                                : "e.g., 255"
                            }
                            value={
                              // Extract the parameters from the type string (e.g., "DECIMAL(4,2)" -> "4,2")
                              rowMeta[rowIndex]?.type.match(/\(([^)]+)\)/)?.[1] || ""
                            }
                            onChange={(e) => {
                              const baseType = rowMeta[rowIndex]?.type.split("(")[0]; // Extract the base type (e.g., "DECIMAL")
                              const params = e.target.value; // Get the new parameters from the input
                              updateRowMeta(rowIndex, { type: `${baseType}(${params})` }); // Update the type field directly
                            }}
                          />
                        </div>
                      )}

                      <div className="popover-row checkboxes">
                        <label>
                          <input
                            type="checkbox"
                            checked={rowMeta[rowIndex]?.nn}
                            onChange={(e) => updateRowMeta(rowIndex, { nn: e.target.checked })}
                          />{" "}
                          NN
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={rowMeta[rowIndex]?.pk}
                            onChange={(e) => updateRowMeta(rowIndex, { pk: e.target.checked })}
                          />{" "}
                          PK
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={rowMeta[rowIndex]?.ai}
                            onChange={(e) => updateRowMeta(rowIndex, { ai: e.target.checked })}
                          />{" "}
                          AI
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={rowMeta[rowIndex]?.unique}
                            onChange={(e) => updateRowMeta(rowIndex, { unique: e.target.checked })}
                          />{" "}
                          U
                        </label>
                      </div>

                      <div className="popover-row">
                        <label>Default</label>
                        <input
                          value={rowMeta[rowIndex]?.default || ""}
                          onChange={e => updateRowMeta(rowIndex, { default: e.target.value })}
                          placeholder="e.g. 0"
                        />
                      </div>

                      <div className="popover-actions">
                        <button className="btn ghost" onClick={() => setOpenPopoverRow(null)}>Close</button>
                      </div>
                    </div>
                  )}
                </td>

                {/* render any extra columns after second if present */}
                {row && Array.isArray(row) ? row.slice(2).map((cell, colIndex) => (
                  <td key={colIndex + 2}>
                    <span onDoubleClick={() => handleDoubleClickCell(rowIndex, colIndex + 2)}>
                      {cell || "Empty"}
                    </span>
                  </td>
                )) : null}

                <td>
                  {tableData.length > 1 && (
                    <button
                      onClick={() => deleteBuildRow(rowIndex)}
                      className="delete-small"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <>
            <thead>
              <tr>
                {headers.map((header, colIndex) => (
                  <th key={colIndex}>{header || `Column ${colIndex + 1}`}</th>
                ))}
                <th style={{ width: "50px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataModeRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <span onDoubleClick={() => handleDoubleClickDataModeCell(rowIndex, colIndex)}>
                        {cell || "Empty"}
                      </span>
                    </td>
                  ))}
                  <td>
                    {dataModeRows.length > 1 && (
                      <button
                        onClick={() => deleteDataModeRow(rowIndex)}
                        className="delete-small"
                        style={{ padding: "2px 6px", fontSize: "10px" }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        )}
      </table>

      {isBuildMode ? (
        tableData.length < MAX_BUILD_ROWS && (
          <button
            onClick={addBuildRow}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            + Add Row
          </button>
        )
      ) : (
        <button
          onClick={addDataModeRow}
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          + Add Row
        </button>
      )}

      {/* Handles for build mode */}
      {isBuildMode &&
        tableData.map((_, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <Handle
              type="source"
              position={Position.Left}
              id={`row-${rowIndex}-left`}
              style={{
                top: `${rowIndex * rowHeight + 65}px`,
                left: "-4px",
              }}
            />
            <Handle
              type="target"
              position={Position.Right}
              id={`row-${rowIndex}-right`}
              style={{
                top: `${rowIndex * rowHeight + 65}px`,
                right: "-4px",
              }}
            />
          </React.Fragment>
        ))}
    </div>
  );
};