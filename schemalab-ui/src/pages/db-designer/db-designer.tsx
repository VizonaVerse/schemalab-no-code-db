import { Canvas } from "./canvas/canvas";
import { Topbar } from "./topbar/topbar";
import { ReactFlowProvider } from "reactflow";
import "./db-designer.scss";
import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useCanvasContext, initialNodes, initialEdges } from "../../contexts/canvas-context";

export interface DbDesignerProps {
    example: string;
}

export function DbDesigner({ example }: DbDesignerProps) {
    const location = useLocation();
    const { id: projectId } = useParams();
    const { setNodes, setEdges, setProjectName } = useCanvasContext();
    const { projectName } = useCanvasContext();

    useEffect(() => {
        const projectData = location.state?.projectData;
        if (projectData && projectData.data && projectData.data.canvas) {
            setProjectName(projectData.data.projectName || "Untitled Project");

            // Convert tables to React Flow nodes
            const nodes = (projectData.data.canvas.tables || []).map((table: any) => ({
                id: table.id,
                type: "tableNode",
                data: { label: table.name, ...table.data },
                position: table.position,
            }));

            // Convert relationships to React Flow edges
            const edges = (projectData.data.canvas.relationships || []).map((rel: any) => ({
                id: rel.id,
                source: rel.source,
                sourceHandle: rel.sourceHandle,
                target: rel.target,
                targetHandle: rel.targetHandle,
                type: rel.type,
            }));

            setNodes(nodes);
            setEdges(edges);
        } else if (!projectId) {
            // Reset canvas for new project to initial state
            setProjectName("New Project");
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [location.state, setNodes, setEdges, setProjectName, projectId]);

    return (
        <div className="db-designer">
            <Topbar projectName={projectName} />
            <div className="canvas">
                <ReactFlowProvider>
                    <Canvas />
                </ReactFlowProvider>
            </div>
        </div>
    );
}