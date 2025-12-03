export function formatCanvasData(nodes: any[], edges: any[], projectName: string) {
    return {
        data: {
            projectName: projectName, // Use the project name
            canvas: {
                tables: nodes.map((node) => ({
                    id: node.id,
                    name: node.data.label,
                    position: node.position,
                    data: (node.data.tableData || []).map((row: string[]) =>
                        Array.isArray(row)
                            ? row.map(cell => cell ?? "") // Replace undefined/null with empty string
                            : []
                    ),
                    attributes: node.data.rowMeta || [],
                    dataModeRows: node.data.dataModeRows || [],
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

export function mapProjectToNodesEdges(projectData: any) {
    const nodes = (projectData?.data?.canvas?.tables || []).map((table: any) => ({
        id: table.id,
        type: "tableNode",
        data: {
            label: table.name,
            // Ensure tableData is always an array of arrays
            tableData: Array.isArray(table.data)
                ? table.data.map((row: any) => Array.isArray(row) ? row : [])
                : [],
            rowMeta: Array.isArray(table.attributes) ? table.attributes : [],
            dataModeRows: Array.isArray(table.dataModeRows) ? table.dataModeRows : [],
        },
        position: table.position,
    }));

    const edges = (projectData?.data?.canvas?.relationships || []).map((rel: any) => ({
        id: rel.id,
        source: rel.source,
        sourceHandle: rel.sourceHandle,
        target: rel.target,
        targetHandle: rel.targetHandle,
        type: rel.type,
    }));

    return { nodes, edges };
}