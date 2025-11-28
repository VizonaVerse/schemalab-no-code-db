export function formatCanvasData(nodes: any[], edges: any[]) {
    return {
        data: {
            projectName: "name", // Replace "name" with the actual project name if available
            canvas: {
                tables: nodes.map((node) => ({
                    id: node.id,
                    name: node.data.label,
                    position: node.position,
                    data: (node.data.tableData || []).map((row: string[]) => row[0] || ""), // Ensure tableData is always an array
                    attributes: node.data.rowMeta || [], // Include attributes in build mode
                    dataModeRows: node.data.dataModeRows || [], // Include table data in data mode
                })),
                relationships: edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle,
                    type: edge.type || "unknown", // Default to "unknown" if type is not provided
                })),
                length: nodes.length, // Length of tables
            },
        },
        time: new Date().toISOString(), // Current timestamp
    };
}