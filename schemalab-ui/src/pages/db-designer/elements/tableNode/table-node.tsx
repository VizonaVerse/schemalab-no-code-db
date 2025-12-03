import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { Handle, Position, useViewport } from "reactflow";
import "reactflow/dist/style.css";
import "./table-node.scss";
import { useCanvasContext } from "../../../../contexts/canvas-context";
import { createPortal } from "react-dom";

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
const TYPE_OPTIONS: string[] = [
  "INT",
  "INTEGER",
  "TINYINT",
  "SMALLINT",
  "MEDIUMINT",
  "BIGINT",
  "INT2",
  "INT8",
  "DECIMAL",
  "REAL",
  "DOUBLE",
  "FLOAT",
  "NUMERIC",
  "CHARACTER",
  "VARCHAR",
  "NCHAR",
  "NVARCHAR",
  "TEXT",
  "BOOLEAN",
  "DATE",
  "DATETIME",
];

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
  const { mode, updateNodeData, selectedNodes, nodes, edges } = useCanvasContext();
  const { zoom } = useViewport();
  const rowHeight = 28.5;
  const MAX_BUILD_ROWS = 7;
  const [tableName, setTableName] = useState(data.label);
  const [tableData, setTableData] = useState(data.tableData ?? [["", ""]]);
  const [rowMeta, setRowMeta] = useState<RowMeta[]>(data.rowMeta ?? []);
  const [dataModeRows, setDataModeRows] = useState<string[][]>(data.dataModeRows ?? [[""]]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownPortalRef = useRef<HTMLDivElement | null>(null);
  const typeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const attrCellRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [popoverTop, setPopoverTop] = useState<number>(0);

  const isSelected = selectedNodes?.some(n => n.id === id);

  const defaultMeta = (): RowMeta => ({
    type: "INT",
    nn: false,
    pk: false,
    ai: false,
    unique: false,
    default: "",
  });

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

  // Sync dataModeRows column count with headers
  useEffect(() => {
    const targetCols = Math.max(1, numColumns);

    setDataModeRows((prev) => {
      const next =
        prev.length > 0
          ? prev.map((row) => {
              const resized = row.slice(0, targetCols);
              while (resized.length < targetCols) resized.push("");
              return resized;
            })
          : [Array.from({ length: targetCols }, () => "")];

      const changed =
        next.length !== prev.length ||
        next.some((row, idx) => row.length !== (prev[idx]?.length ?? 0));

      if (changed) {
        updateNodeData(id, { tableData, rowMeta, dataModeRows: next });
        return next;
      }
      return prev;
    });
  }, [numColumns, id, tableData, rowMeta, updateNodeData]);

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
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [typeMenuPosition, setTypeMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);

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

  useEffect(() => {
    setIsTypeMenuOpen(false);
  }, [openPopoverRow]);

  const updatePopoverTop = (rowIndex: number) => {
    const cellEl = attrCellRefs.current[rowIndex];
    if (!cellEl) return;

    const buttonEl = cellEl.querySelector<HTMLButtonElement>(".attr-button");
    const cellRect = cellEl.getBoundingClientRect();
    const buttonRect = buttonEl?.getBoundingClientRect();

    const offset = ((buttonRect?.top ?? cellRect.top) - cellRect.top) / (zoom || 1);
    setPopoverTop(offset);
  };

  const togglePopover = (rowIndex: number) => {
    if (openPopoverRow === rowIndex) {
      setOpenPopoverRow(null);
      setIsTypeMenuOpen(false);
      return;
    }
    updatePopoverTop(rowIndex);
    setOpenPopoverRow(rowIndex);
    setIsTypeMenuOpen(false);
  };

  useLayoutEffect(() => {
    if (openPopoverRow === null) return;
    updatePopoverTop(openPopoverRow);
  }, [openPopoverRow, zoom]); // ensure recalculation if layout shifts

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

  useEffect(() => {
    const patch: Partial<typeof data> = {};

    if (!Array.isArray(data.tableData) || data.tableData.length === 0) {
      patch.tableData = tableData;
    }
    if (!Array.isArray(data.rowMeta) || data.rowMeta.length === 0) {
      patch.rowMeta = rowMeta;
    }
    if (!Array.isArray(data.dataModeRows) || data.dataModeRows.length === 0) {
      patch.dataModeRows = dataModeRows;
    }

    if (Object.keys(patch).length > 0) {
      updateNodeData(id, patch);
    }
  }, []);

  useEffect(() => {
    setTableName(data.label ?? "");
    setTableData(data.tableData ?? [["", ""]]);
    setRowMeta(data.rowMeta ?? []);
    setDataModeRows(data.dataModeRows ?? [[""]]);
  }, [data.label, data.tableData, data.rowMeta, data.dataModeRows]);

  useEffect(() => {
    attrCellRefs.current = attrCellRefs.current.slice(0, tableData.length);
  }, [tableData.length]);

  useEffect(() => {
    const portalHost = document.createElement("div");
    portalHost.className = "type-menu-portal";
    document.body.appendChild(portalHost);
    dropdownPortalRef.current = portalHost;

    return () => {
      document.body.removeChild(portalHost);
      dropdownPortalRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!isTypeMenuOpen) {
      setTypeMenuPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!typeTriggerRef.current) return;
      const rect = typeTriggerRef.current.getBoundingClientRect();
      setTypeMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isTypeMenuOpen, openPopoverRow]);

  const renderTypeMenu = () => {
    if (!isTypeMenuOpen || dropdownPortalRef.current === null || openPopoverRow === null || !typeMenuPosition) return null;

    return createPortal(
      <ul
        className="custom-select__menu portal"
        style={{
          top: typeMenuPosition.top,
          left: typeMenuPosition.left,
          width: typeMenuPosition.width,
          minWidth: typeMenuPosition.width,
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {TYPE_OPTIONS.map((option: string) => (
          <li
            key={option}
            className="custom-select__option"
            data-active={rowMeta[openPopoverRow]?.type === option}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              setIsTypeMenuOpen(false);
              updateRowMeta(openPopoverRow, { type: option });
            }}
          >
            {option}
          </li>
        ))}
      </ul>,
      dropdownPortalRef.current
    );
  };

  return (
    <div className={`table-node ${isBuildMode ? 'build-mode' : 'data-mode'} ${isSelected ? 'selected' : ''}`} ref={containerRef}>
      <h4 className="table-title" onDoubleClick={handleDoubleClickTableName}>
        {tableName}
      </h4>
      <table className="table-content">
        {isBuildMode ? (
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr
                key={`${rowIndex}-${mode}`}
              >
                {/* first column: data name */}
                <td>
                  <span onDoubleClick={() => handleDoubleClickCell(rowIndex, 0)}>
                    {row[0] || "Empty"}
                  </span>
                </td>

                {/* second column: attribute button / popover trigger */}
                <td
                  ref={(el) => {
                    attrCellRefs.current[rowIndex] = el;
                  }}
                >
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
                      style={{ top: `${popoverTop}px` }}
                    >
                      <div className="popover-row">
                        <label>Type</label>
                        <div className="custom-select" data-open={isTypeMenuOpen}>
                          <button
                            type="button"
                            className="custom-select__trigger"
                            ref={openPopoverRow === rowIndex ? typeTriggerRef : null}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTypeMenuOpen((open) => !open);
                            }}
                          >
                            {rowMeta[rowIndex]?.type || "Select type"}
                            <span className="caret">▾</span>
                          </button>
                          {renderTypeMenu()}
                        </div>
                      </div>

                      {/* Input for types with parameters */}
                      {["DECIMAL", "CHARACTER", "VARCHAR", "NCHAR", "NVARCHAR"].includes(
                        rowMeta[rowIndex]?.type.split("(")[0]
                      ) && (
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