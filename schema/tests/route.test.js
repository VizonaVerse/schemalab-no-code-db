const request = require("supertest");
const {app,server} = require("../app");
const fs = require('fs');
const filePath = './tempFiles/';
const fileFunctions = require('../functions/file');

let agent;


describe("Schema Route tests", () => {

    beforeAll(async () => {
        agent = request.agent(app);
    });

    test("Test build route", async () => {
        const res = await agent.post("/build").send({
            //send a data object 
            data: {
                projectName: "name",
                canvas: {
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
            }
        });
        // Status OK
        expect(res.status).toBe(200);

        // Response has file info
        expect(res.body.data).toHaveProperty("sqlFile");
        expect(res.body.data).toHaveProperty("dbFile");

        const { sqlFile, dbFile } = res.body.data;

        // Basic shape check (optional but nice)
        expect(sqlFile).toMatch(/\/download\/.+\.sql$/);
        expect(dbFile).toMatch(/\/download\/.+\.db$/);

        // Check the SQL file is downloadable
        const sqlRes = await agent.get(sqlFile);
        expect(sqlRes.status).toBe(200);
        expect(sqlRes.header["content-disposition"]).toMatch(/attachment/);
        expect(sqlRes.header["content-disposition"]).toMatch(/\.sql/);

        // Check the DB file is downloadable
        const dbRes = await agent.get(dbFile);
        expect(dbRes.status).toBe(200);
        expect(dbRes.header["content-disposition"]).toMatch(/attachment/);
        expect(dbRes.header["content-disposition"]).toMatch(/\.db/);
    });

    afterAll(async () => {
        server.close();
    });
});
