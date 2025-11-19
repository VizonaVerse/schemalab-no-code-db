const valFunctions = require('../functions/validation');

async function generateSQL(canvas) {
    try {
        var relationships = canvas.relationships;
        var tables = canvas.tables;
    } catch {
        throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
    }
    // table validation
    await valFunctions.validateTables(tables);

    // give all table data a relations array to add to later
    try {
        for (var i = 0; i < tables.length; i++) {
            tables[i].relations = [];
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
            var data = tables[i].data;
            var attributes = tables[i].attributes;
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
            var target = rel.target;
            var targetRow = parseInt(rel.targetHandle.split("-")[1]);
            var type = rel.type;
        } catch {
            throw {code: "S00", httpCode: 400, message: "Invalid JSON format"};
        }
        if (type == "oneToManyEdge" || type == "oneToOneEdge") {
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == source) {
                    tables[i].relations.push({
                        key: "p",
                        row: sourceRow,
                        rowREF: null,
                        tableREF: null
                    });

                    for (var j = 0; j < tables.length; j++) {
                    if (tables[j].id == target) {
                        tables[j].relations.push({
                            key: "f",
                            row: tables[j].data[targetRow],
                            rowREF: tables[i].data[sourceRow],
                            tableREF: tables[i].name
                        });
                    }
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
                    inter.rowName1 = tables[i].data[sourceRow];
                    inter.rowType1 = tables[i].attributes[sourceRow].type;
                }
            }
            for (var i = 0; i < tables.length; i++) {
                if (tables[i].id == target) {
                    inter.tableName2 = tables[i].name;
                    inter.rowName2 = tables[i].data[targetRow];
                    inter.rowType2 = tables[i].attributes[targetRow].type;
                }
            }
            interTables.push(inter);
        }
    }
    
    // generate each table's string individually with validation
    var sqlString = "";
    for (var table of tables) {
        var fieldList = [];
        var tableString = `CREATE TABLE ${table.name}(`;

        for (var i = 0; i < table.data.length; i++) {
            // convert frontend format to my format
            var constraints = [];
            if (table.attributes[i].nn) constraints.push("NOT NULL");
            if (table.attributes[i].unique) constraints.push("UNIQUE");
            if (table.attributes[i].ai) constraints.push("AUTOINCREMENT");
            if (table.attributes[i].default != "") {
                constraints.push(`DEFAULT ${table.attributes[i].default}`);
            }

            // Check primary key should be there
            if (table.attributes[i].pk) {
                var done = false;
                for (var rel of table.relations) {
                    if (rel.key == "p" && rel.row == i) {
                        constraints.push("PRIMARY KEY");
                        done = true;
                    } else if (rel.key == "p") throw {code: "V08", httpCode: 400, message: "Relationship is not connected to a primary key"};
                }
                if (!done) constraints.push("PRIMARY KEY");
            }
            
            fieldList.push({
                name: table.data[i],
                type: table.attributes[i].type,
                constraints: constraints
            });
        }

        // validate fields
        try {
            await valFunctions.validateFields(fieldList);
        } catch (err) {
            err.tableID = table.id;
            err.tableName = table.name;
            throw err;
        }
        
        // my format to sql
        for (var field of fieldList) {
            tableString += `${field.name} ${field.type} `;
            for (var constr of field.constraints) {
                tableString += `${constr} `;
            }
            tableString = tableString.substring(0, tableString.length - 1) + ", ";
        }

        // add in forign key
        for (var rel of table.relations) {
            if (rel.key == "f") tableString += `FOREIGN KEY (${rel.row}) REFERENCES ${rel.tableREF}(${rel.rowREF}), `;
        }
        tableString = tableString.substring(0, tableString.length - 2) + ");";

        sqlString += tableString + " ";
    }

    // add inter tables
    for (var inter of interTables) {
        // check if the first 3 digits of each name is unique
        var name1 = inter.tableName1.substring(0, 3);
        var name2 = inter.tableName2.substring(0, 3);
        if (name1 == name2) {
            name1 += "1";
            name2 += "2";
        }

        var tableString = "";
        tableString += `CREATE TABLE ${name1}_${name2}_connector(`
        tableString += `${name1}_${inter.rowName1} ${inter.rowType1}, `
        tableString += `${name2}_${inter.rowName2} ${inter.rowType2}, `
        tableString += `PRIMARY KEY(${name1}_${inter.rowName1}, ${name2}_${inter.rowName2}), `
        tableString += `FOREIGN KEY(${name1}_${inter.rowName1}) REFERENCES ${inter.tableName1}(${inter.rowName1}), `
        tableString += `FOREIGN KEY(${name2}_${inter.rowName2}) REFERENCES ${inter.tableName2}(${inter.rowName2}));`
        sqlString += tableString + " ";
    }
    sqlString = sqlString.substring(0, sqlString.length - 1);

    //return "CREATE TABLE test(id int, name varchar(225));"; // placeholder sql
    return sqlString; // actual return
}


module.exports = {generateSQL};
