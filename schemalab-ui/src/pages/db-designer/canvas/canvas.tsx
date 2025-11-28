import React, { useCallback, useState, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  MiniMap,
  ReactFlowInstance,
} from "reactflow";
import { EdgeMarkers } from "../elements/relationships/leftMarkerEdge";
import "reactflow/dist/style.css";
import "./canvas.css"; // Import styles for the table nodes
import { TableNode } from "../elements/tableNode/table-node";
import { ManyToManyEdge } from "../elements/relationships/M2M";
import { OneToManyEdge } from "../elements/relationships/O2M";
import { OneToOneEdge } from "../elements/relationships/O2O";
import { EdgeMenu } from "./edgeMenu";
import { useCanvasContext } from "../../../contexts/canvas-context";

// Define the custom edge types outside the component
const edgeTypes = {
  manyToManyEdge: ManyToManyEdge,
  oneToManyEdge: OneToManyEdge,
  oneToOneEdge: OneToOneEdge,
};

export function Canvas() {
  const { projectName, nodes, setNodes, edges, setEdges, onNodesChange, viewport, setViewport, setSelectedNodes, contextHolder, selectedEdge, setSelectedEdge, menuPos, setMenuPos } = useCanvasContext();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const onInit = (instance: ReactFlowInstance) => {
    setRfInstance(instance);

    if (viewport) {
      instance.setViewport(viewport, { duration: 0 });
    } else {
      instance.fitView({ padding: 1, duration: 0 });
    }
  }

  // Define updateNodeData before using it in useMemo
  const updateNodeData = useCallback(
    (id: string, newData: { label?: string; tableData?: string[][]; rowMeta?: any[]; dataModeRows?: string[][] }) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  // Memoize nodeTypes to avoid recreating it on every render
  const nodeTypes = useMemo(
    () => ({
      tableNode: (props: any) => <TableNode {...props} updateNodeData={updateNodeData} />,
    }),
    [updateNodeData]
  );

  // const onNodeClick = (_: any, node: Node | null) => {
  //   setSelectedNodes([node]);
  // }

  // Wrapper for onEdgesChange
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) =>
        changes.reduce((acc, change) => {
          switch (change.type) {
            case "add":
              return [...acc, change.item];
            case "remove":
              return acc.filter((edge) => edge.id !== change.id);
            default:
              return acc;
          }
        }, eds)
      );
    },
    [setEdges]
  );

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setMenuPos({ x: event.clientX, y: event.clientY });
  };

  const updateEdgeType = (newType: string) => {
    setEdges((eds) =>
      eds.map((e) => (e.id === selectedEdge!.id ? { ...e, type: newType } : e))
    );
    setSelectedEdge(null);
    setMenuPos(null);
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({
        ...params,
        type: "oneToOneEdge",
      },
        eds));
    },
    [setEdges]
  );

  return (
    <>
      { contextHolder }
      <div className="canvas-container">
        <EdgeMarkers />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange} // Use the context's onNodesChange
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes} // Use memoized nodeTypes
          edgeTypes={edgeTypes}
          onEdgeClick={onEdgeClick}
          onInit={onInit}
          onSelectionChange={({nodes}) => setSelectedNodes(nodes)}
          onPaneClick={() => {setSelectedNodes([]); setSelectedEdge(null) }}

          onMove={(_, viewport) => setViewport(viewport)}
        >
          <MiniMap nodeStrokeWidth={3} />
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      {selectedEdge && menuPos && (
        <EdgeMenu menuPos={menuPos} updateEdgeType={updateEdgeType} />
      )}
    </>
  );
}