import { ReactNode } from "react";

export interface DbDesignerProps {
    example: string;
}

export function DbDesigner({example}: DbDesignerProps) {
    return (
        <div>
            <h1>Database Designer</h1>
            <p>Example: {example}</p>
        </div>
    );
}