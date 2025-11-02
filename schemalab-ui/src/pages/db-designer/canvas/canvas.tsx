import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./canvas.css"; // Import styles for the table nodes

// Define the custom table node component.
const TableNode = ({ data }: { data: { label: string } }) => {
  const rowHeight = 23; // Define the height of each row
  const [tableName, setTableName] = useState(data.label); // Editable table name
  const [tableData, setTableData] = useState(
    Array.from({ length: 6 }).map(() => ["", ""]) // Initialize 6 rows with empty strings
  );

  // Make table names editable by double-clicking.
  const handleDoubleClickTableName = () => {
    const newName = prompt("Edit table name:", tableName);
    if (newName !== null) {
      setTableName(newName);
    }
  };
  // Make cell names editable by double-clicking.
  const handleDoubleClickCell = (rowIndex: number, colIndex: number) => {
    const newValue = prompt("Edit cell value:", tableData[rowIndex][colIndex]);
    if (newValue !== null) {
      const updatedTable = [...tableData];
      updatedTable[rowIndex][colIndex] = newValue;
      setTableData(updatedTable);
    }
  };

  return (
    <div className="table-node">
      <h4 className="table-title" onDoubleClick={handleDoubleClickTableName}>
        {tableName}
      </h4>
      <table className="table-content">
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <span onDoubleClick={() => handleDoubleClickCell(rowIndex, 0)}>
                  {row[0] || "Empty"}
                </span>
              </td>
              <td>
                <span onDoubleClick={() => handleDoubleClickCell(rowIndex, 1)}>
                  {row[1] || "Empty"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add Handles at the root level */}
      {tableData.map((_, rowIndex) => (
        <React.Fragment key={rowIndex}>
          <Handle
            type="source"
            position={Position.Left}
            id={`row-${rowIndex}-left`}
            style={{
              top: `${rowIndex * rowHeight +58}px`, // Align to row center
              left: "-5px", // Position to the left of the table
            }}
          />
          <Handle
            type="target"
            position={Position.Right}
            id={`row-${rowIndex}-right`}
            style={{
              top: `${rowIndex * rowHeight + 58}px`, // Align to row center
              right: "-5px", // Position to the right of the table
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

// Define the custom node types.
const nodeTypes = {
  tableNode: TableNode,
};

// Initial tables with the custom table node type.
const initialNodes: Node[] = [
  {
    id: "1",
    type: "tableNode",
    data: { label: "Table 1" },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    type: "tableNode",
    data: { label: "Table 2" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    type: "tableNode",
    data: { label: "Table 3" },
    position: { x: 400, y: 100 },
  },
];
// Initial edges connect table rows.
const initialEdges = [
  { id: "e1-2", source: "1", sourceHandle: "row-0-left", target: "2", targetHandle: "row-1-right" },
  { id: "e1-3", source: "1", sourceHandle: "row-2-left", target: "3", targetHandle: "row-0-right" },
];

export function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes} // Register the custom node type
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Canvas;