import React, { ReactNode } from "react";
import Toolbox from "./toolbox/toolbox";
import Canvas from "./canvas/canvas";

import "./db-designer.scss";

export interface DbDesignerProps {
    example: string;
}

export function DbDesigner({ example }: DbDesignerProps) {
    return (
        
        <div className="db-designer">
            {/* <h1>Database Designer</h1>
            <p>Example: {example}</p> */}
            <div className="toolbox">
                <Toolbox />
            </div>
            <div className="canvas">
                <Canvas />
            </div>

        </div>
    );
}