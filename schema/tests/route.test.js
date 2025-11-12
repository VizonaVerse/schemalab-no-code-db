const request = require("supertest");
const app = require("../app");

let agent;

describe("Schema Route tests", () => {
    
    beforeAll(async () => {
        agent = request.agent(app);
    })

    test("Test build route", async () => {
        const res = await agent.post("/build").send({
            //send a data object 
            data: {
                projectName: "name",
                canvas: {}
            }
        });
        expect(res.status).toBe(200);
    });

});
