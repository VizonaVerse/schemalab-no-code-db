export function formatCanvasData(nodes: any[], edges: any[]) {
    return {
        tables: nodes.map((node) => ({
            id: node.id,
            name: node.data.label,
            position: node.position,
        })),
        relationships: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        })),
    };
}