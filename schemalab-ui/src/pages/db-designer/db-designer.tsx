import { useState } from "react";
import { Canvas } from "./canvas/canvas";
import { Topbar } from "./topbar/topbar";
import { TableNode } from "./elements/tableNode/table-node";
import { OneToOneEdge } from "./elements/relationships/O2O";
import { OneToManyEdge } from "./elements/relationships/O2M";
import { ManyToManyEdge } from "./elements/relationships/M2M";
import "./db-designer.scss";
import { ReactFlowProvider } from "reactflow";
import tableIcon from "../../assets/toolbox/table.svg";
import { CanvasProvider } from "../../contexts/canvas-context";

export interface DbDesignerProps {
    example: string;
}

export function DbDesigner({ example }: DbDesignerProps) {

    return (
        <div className="db-designer">
            <CanvasProvider>
                <Topbar projectName="Test" />
                <div className="canvas">
                    {/* Wrapped canvas in reactflow provider which allows us to get coordinates of mouse on canvas */}
                    <ReactFlowProvider>
                        <Canvas />
                    </ReactFlowProvider>
                </div>  
            </CanvasProvider>
        </div>
    );
}