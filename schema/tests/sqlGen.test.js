const sqlFunctions = require('../functions/sql');
const { fail } = require('assert');

describe("SQL generation tests", () => {
    
    beforeAll(async () => {
    })

    test("Test 1 table", async () => {
        var canvas = {
            relationships: [],
            tables: [{
                id: "1",
                name: "Students",
                position: {x:100,y:100},
                data: ["id", "name", "age"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false}
                ]
            }]
        }

        var sql = await sqlFunctions.generateSQL(canvas);

        var s = "CREATE TABLE Students(";
        s += "id INT AUTOINCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL, "
        s += "age INT DEFAULT 18);"

        await expect(sql).toBe(s);
    });

    test("Test 2 tables with 1-to-many relation", async () => {
        var canvas = {
            relationships: [
                {
                    "id": "el-1",
                    "source": "2",
                    "sourceHandle": "row-0-left",
                    "target": "1",
                    "targetHandle": "row-3-right",
                    "type": "oneToManyEdge"
                }
            ],
            tables: [
                {
                    id: "1",
                    name: "Students",
                    position: {x:100,y:100},
                    data: ["id", "name", "age", "School_id"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                        {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                        {ai: false, default: "", nn: false, pk: false, type: "INT", unique: false}
                    ]
                },
                {
                    id: "2",
                    name: "School",
                    position: {x:100,y:100},
                    data: ["id", "name"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false}
                    ]
                }
            ]
        }

        var sql = await sqlFunctions.generateSQL(canvas);

        var s = "CREATE TABLE Students(";
        s += "id INT AUTOINCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL, "
        s += "age INT DEFAULT 18, "
        s += "School_id INT, "
        s += "FOREIGN KEY (School_id) REFERENCES School(id)); "
        s += "CREATE TABLE School(";
        s += "id INT AUTOINCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL);"

        await expect(sql).toBe(s);
    });
});
