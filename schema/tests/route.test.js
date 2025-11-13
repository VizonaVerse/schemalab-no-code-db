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
        return await expect(res.status).toBe(200);
    });

    afterAll(async () => {
        server.close();
    });
});
