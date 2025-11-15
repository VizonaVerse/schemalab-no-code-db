async function generateSQL(canvas) {
    try {
        var relationships = canvas.relationships;
        var tables = canvas.tables;
    } catch {
        throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
    }

    // give all table data a relations array to add to later
    try {
        for (var i = 0; i < tables.length; i++) {
            tables[i].data.relations = [];
            // example:
            // {
            //     key: "p" or "f",
            //     row: 0 or "field name",
            //     rowREF: null or "field name"
            //     tableREF: null or "table name"
            // }
            
            // does table have everything else it needs?
            var id = tables[i].id;
            var name = tables[i].name;
            var tableData = tables[i].data.tableData;
        }
    } catch {
        throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
    }
    
    // insert all relationships into the tables
    for (var rel of relationships) {
        try {
            var source = rel.source;
            var sourceRow = parseInt(rel.sourceHandle.split("-")[1]);
            var target = rel.source;
            var targetRow = parseInt(rel.sourceHandle.split("-")[1]);
            var type = rel.type;
        } catch {
            throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
        }
        if (type == "oneToManyEdge" || type == "oneToOneEdge") {
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == source) {
                    tables[i].data.relations.push({
                        key: "p",
                        row: sourceRow,
                        rowREF: null,
                        tableREF: null
                    });
                }
                for (var j = 0; j < tables.length; j++) {
                    if (tables[j].id == target) {
                        tables[j].data.relations.push({
                            key: "f",
                            row: tables[j].data.tableData[targetRow][0], // 0 is subject to FRONTEND FORMAT
                            rowREF: tables[i].data.tableData[sourceRow][0], // 0 is subject to FRONTEND FORMAT
                            tableREF: tables[i].name
                        });
                    }
                }
            }
        }
    }

    return "CREATE TABLE test(id int, name varchar(225));"; // placeholder sql
}



async function createTable(table) {
    for (var row of table.data.tableData) {

    }
}

module.exports = {generateSQL};
