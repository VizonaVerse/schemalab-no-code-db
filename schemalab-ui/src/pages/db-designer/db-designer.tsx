import { Canvas } from "./canvas/canvas";
import { Topbar } from "./topbar/topbar";
import { ReactFlowProvider } from "reactflow";
import "./db-designer.scss";
import { useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useCanvasContext, initialNodes, initialEdges } from "../../contexts/canvas-context";
import axios from "axios";
import { mapProjectToNodesEdges } from "../../utils/canvas-utils";

export interface DbDesignerProps {
    example: string;
}

export function DbDesigner({ example }: DbDesignerProps) {
    const location = useLocation();
    const { id: projectId } = useParams();
    const { setNodes, setEdges, setProjectName } = useCanvasContext();
    const { projectName } = useCanvasContext();
    const { nodes, edges } = useCanvasContext(); // <-- get current nodes/edges from context

    useEffect(() => {
        async function loadProject() {
            // Always clear previous canvas state first
            setNodes([]);
            setEdges([]);

            let projectData = location.state?.projectData;
            if (!projectData && projectId) {
                const res = await axios.get(`http://localhost:6060/api/projects/${projectId}/`);
                projectData = res.data;
            }
            if (projectData && projectData.data && projectData.data.canvas) {
                setProjectName(
                    projectData.name ||
                    projectData.data.projectName ||
                    projectData.projectName ||
                    "Untitled Project"
                );

                const { nodes, edges } = mapProjectToNodesEdges(projectData);
                setNodes(nodes);
                setEdges(edges);
            } else if (!projectId) {
                // Reset canvas for new project to initial state
                setProjectName("New Project");
                setNodes(initialNodes);
                setEdges(initialEdges);
            }
        }
        loadProject();
    }, [location.state, setNodes, setEdges, setProjectName, projectId]);

    useEffect(() => {
        // Log finalised nodes and edges whenever they change
        console.log("Finalised nodes:", nodes);
        console.log("Finalised edges:", edges);
    }, [nodes, edges]);

    return (
        <div className="db-designer">
            <Topbar projectName={projectName} />
            <div className="canvas">
                <ReactFlowProvider key={projectId || projectName}>
                    <Canvas key={projectId || projectName} />
                </ReactFlowProvider>
            </div>
        </div>
    );
}