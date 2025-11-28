const sqlFunctions = require('../functions/sql');

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
                data: ["id", "name", "age", "grade"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                    {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4,2)", unique: false}
                ]
            }]
        }

        var sql = await sqlFunctions.generateSQL(canvas);

        var s = "CREATE TABLE Students("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL, "
        s += "age INT DEFAULT 18, "
        s += "grade DECIMAL(4,2));"

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

        var s = "CREATE TABLE Students("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL, "
        s += "age INT DEFAULT 18, "
        s += "School_id INT, "
        s += "FOREIGN KEY (School_id) REFERENCES School(id)); "

        s += "CREATE TABLE School("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL);"

        await expect(sql).toBe(s);
    });

    test("Test 2 tables with many-to-many relation", async () => {
        var canvas = {
            relationships: [
                {
                    "id": "el-1",
                    "source": "2",
                    "sourceHandle": "row-0-left",
                    "target": "1",
                    "targetHandle": "row-0-right",
                    "type": "manyToManyEdge"
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
                    name: "Course",
                    position: {x:100,y:100},
                    data: ["id", "name"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: true}
                    ]
                }
            ]
        }

        var sql = await sqlFunctions.generateSQL(canvas);

        var s = "CREATE TABLE Students("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL, "
        s += "age INT DEFAULT 18, "
        s += "School_id INT); "

        s += "CREATE TABLE Course("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL UNIQUE); "

        s += "CREATE TABLE Cou_Stu_connector("
        s += "Cou_id INT, Stu_id INT, PRIMARY KEY(Cou_id, Stu_id), "
        s += "FOREIGN KEY(Cou_id) REFERENCES Course(id), "
        s += "FOREIGN KEY(Stu_id) REFERENCES Students(id));"

        await expect(sql).toBe(s);
    });

    test("Test 3 tables", async () => {
        var canvas = {
            relationships: [
                {
                    "id": "el-1",
                    "source": "3",
                    "sourceHandle": "row-0-left",
                    "target": "1",
                    "targetHandle": "row-0-right",
                    "type": "manyToManyEdge"
                },
                {
                    "id": "el-2",
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
                },
                {
                    id: "3",
                    name: "Course",
                    position: {x:100,y:100},
                    data: ["id", "name"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: true}
                    ]
                }
            ]
        }

        var sql = await sqlFunctions.generateSQL(canvas);

        var s = "CREATE TABLE Students("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL, "
        s += "age INT DEFAULT 18, "
        s += "School_id INT, "
        s += "FOREIGN KEY (School_id) REFERENCES School(id)); "

        s += "CREATE TABLE School("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL); "

        s += "CREATE TABLE Course("
        s += "id INT AUTO INCREMENT PRIMARY KEY, "
        s += "name VARCHAR(20) NOT NULL UNIQUE); "

        s += "CREATE TABLE Cou_Stu_connector("
        s += "Cou_id INT, Stu_id INT, PRIMARY KEY(Cou_id, Stu_id), "
        s += "FOREIGN KEY(Cou_id) REFERENCES Course(id), "
        s += "FOREIGN KEY(Stu_id) REFERENCES Students(id));"

        await expect(sql).toBe(s);
    });

    test("Test more than one AutoIncr and PrimaryKey", async () => {
        var canvas = {
            relationships: [],
            tables: [{
                id: "1",
                name: "Students",
                position: {x:100,y:100},
                data: ["id", "name", "age", "grade"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: true, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                    {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4,2)", unique: false}
                ]
            }]
        }
        
        try {
            var sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V07");
        }

        canvas = {
            relationships: [],
            tables: [{
                id: "1",
                name: "Students",
                position: {x:100,y:100},
                data: ["id", "name", "age", "grade"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: false, default: "", nn: true, pk: true, type: "VARCHAR(20)", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                    {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4,2)", unique: false}
                ]
            }]
        }
        
        try {
            sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V07");
        }
    });

    test("Test invalid data type parameters", async () => {
        var canvas = {
            relationships: [],
            tables: [{
                id: "1",
                name: "Students",
                position: {x:100,y:100},
                data: ["id", "name", "age", "grade"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: false, default: "", nn: true, pk: false, type: "VARCHAR", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                    {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4,2)", unique: false}
                ]
            }]
        }
        
        try {
            var sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }

        canvas = {
            relationships: [],
            tables: [{
                id: "1",
                name: "Students",
                position: {x:100,y:100},
                data: ["id", "name", "age", "grade"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                    {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4)", unique: false}
                ]
            }]
        }
        
        try {
            sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
    });

    test("Test for duplicate field names and table names", async () => {
        var canvas = {
            relationships: [],
            tables: [{
                id: "1",
                name: "Students",
                position: {x:100,y:100},
                data: ["id", "name", "age", "age"],
                attributes: [
                    {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                    {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                    {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                    {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4,2)", unique: false}
                ]
            }]
        }
        
        try {
            var sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V09");
        }

        canvas = {
            relationships: [],
            tables: [
                {
                    id: "1",
                    name: "Students",
                    position: {x:100,y:100},
                    data: ["id", "name", "age", "grade"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                        {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                        {ai: false, default: "", nn: false, pk: false, type: "DECIMAL(4,2)", unique: false}
                    ]
                },
                {
                    id: "2",
                    name: "Students",
                    position: {x:100,y:100},
                    data: ["id", "name"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: true}
                    ]
                }
            ]
        }
        
        try {
            sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V09");
        }
    });

    test("Test relationship without primaryKey", async () => {
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
                        {ai: true, default: "", nn: false, pk: false, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: true, type: "VARCHAR(20)", unique: false}
                    ]
                }
            ]
        }
        
        try {
            var sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("V08");
        }
    });

    test("Test invalid canvas json", async () => {
        var canvas = {
            relationships: [],
            tables: [
                {
                    id: "1",
                    //name: "Students",
                    position: {x:100,y:100},
                    data: ["id", "name", "age", "School_id"],
                    attributes: [
                        {ai: true, default: "", nn: false, pk: true, type: "INT", unique: false},
                        {ai: false, default: "", nn: true, pk: false, type: "VARCHAR(20)", unique: false},
                        {ai: false, default: "18", nn: false, pk: false, type: "INT", unique: false},
                        {ai: false, default: "", nn: false, pk: false, type: "INT", unique: false}
                    ]
                }
            ]
        }
        
        try {
            var sql = await sqlFunctions.generateSQL(canvas);
        } catch (err) {
            await expect(err.code).toBe("S00");
        }
    });
});
