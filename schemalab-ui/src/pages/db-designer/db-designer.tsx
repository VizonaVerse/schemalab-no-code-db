import React, { useState } from "react";
import Toolbox from "./toolbox/toolbox";
import Canvas from "./canvas/canvas";
import { formatCanvasData } from "../../utils/canvas-utils";

import "./db-designer.scss";

export interface DbDesignerProps {
    example: string;
}

// Define the type for the formatted data
interface FormattedCanvasData {
    tables: { id: string; name: string; position: { x: number; y: number } }[];
    relationships: {
        id: string;
        source: string;
        target: string;
        sourceHandle: string | null;
        targetHandle: string | null;
    }[];
}

export function DbDesigner({ example }: DbDesignerProps) {
    // Explicitly type the state to include the formatted data structure, or null
    const [canvasData, setCanvasData] = useState<FormattedCanvasData | null>(null);    // Callback to receive data from Canvas

    const handleCanvasData = (nodes: any, edges: any) => {
        const formattedData = formatCanvasData(nodes, edges); // Format the data
        setCanvasData(formattedData); // Store the formatted data in state
        console.log("Formatted Canvas Data:", formattedData); // Log or send the data
    };
    return (

        <div className="db-designer">
            {/* <h1>Database Designer</h1>
            <p>Example: {example}</p> */}
            <div className="toolbox">
                <Toolbox />
            </div>
            <div className="canvas">
                <Canvas onDataExtract={handleCanvasData} />
            </div>

        </div>
    );
}