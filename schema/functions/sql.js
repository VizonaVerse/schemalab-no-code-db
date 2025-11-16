const valFunctions = require('../functions/validation');

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
    var interTables = [] // extra manyToMany tables
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
        } else if (type == "manyToManyEdge") {
            // create new table with references to that table
            var inter = {
                tableName1:"",
                rowName1: "",
                rowType1: "",
                tableName2:"",
                rowName2: "",
                rowType2: ""
            }
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == source) {
                    inter.tableName1 = tables[i].name;
                    inter.rowName1 = tables[i].data.tableData[sourceRow][0]; // 0 is subject to FRONTEND FORMAT
                    inter.rowType1 = tables[i].data.tableData[sourceRow][1]; // 1 is subject to FRONTEND FORMAT
                }
            }
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == target) {
                    inter.tableName2 = tables[i].name;
                    inter.rowName2 = tables[i].data.tableData[targetRow][0]; // 0 is subject to FRONTEND FORMAT
                    inter.rowType2 = tables[i].data.tableData[targetRow][1]; // 1 is subject to FRONTEND FORMAT
                }
            }
            interTables.push(inter);
        }
    }

    // generate each table's string individually with validation
    var sqlString = "";
    for (var table of tables) {
        var fieldList = [];
        var fKeys = []
        var tableString = `CREATE TABLE ${table.name}(`;

        for (var field of table.data.tableData) {
            // PLACEHOLDER: CONVERT FRONTEND FORMAT TO MY FORMAT
            // Put primary keys into the fields
            // Put forign keys in the fKeys array
        }

        // validate fields, any problems are thrown straight back to the route
        valFunctions.validateFields(fieldList);
        
        // my format to sql
        for (var field of fieldList) {
            tableString += `${field.name} ${field.type}`;
            for (var constr of field.constraints) {
                tableString += `${constr}`;
            }
            tableString += ", ";
        }

        // add in forign key
        for (var key in fKeys) {
            tableString += `FOREIGN KEY (${key.row}) REFERENCES ${key.tableREF}(${key.rowREF}), `;
        }
        tableString = tableString.substring(0, tableString.length - 2) + ");";

        sqlString += tableString + " ";
    }

    // add inter tables
    for (var inter of interTables) {
        var tableString = "";
        tableString += `CREATE TABLE ${inter.tableName1}_${inter.tableName1}_connector(`
        tableString += `${inter.rowName1} ${inter.rowType1}, ${inter.rowName2} ${inter.rowType2}, PRIMARY KEY(${inter.rowName2}, ${inter.rowName2}), `
        tableString += `FOREIGN KEY(${inter.rowName1}) REFERENCES ${inter.tableName1}(${inter.rowName1}), `
        tableString += `FOREIGN KEY(${inter.rowName2}) REFERENCES ${inter.tableName2}(${inter.rowName2}));`
        sqlString += tableString + " ";
    }
    

    return "CREATE TABLE test(id int, name varchar(225));"; // placeholder sql
    return sqlString; // actual return
}


module.exports = {generateSQL};
