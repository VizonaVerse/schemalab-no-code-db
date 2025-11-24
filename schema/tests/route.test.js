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
                canvas: {}
            }
        });
        // Status OK
        expect(res.status).toBe(200);

        // Response has file info
        expect(res.body).toHaveProperty("sqlFile");
        expect(res.body).toHaveProperty("dbFile");

        const { sqlFile, dbFile } = res.body;

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
