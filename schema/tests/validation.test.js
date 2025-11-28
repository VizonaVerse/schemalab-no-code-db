const valFunctions = require('../functions/validation');
const { fail } = require('assert');

describe("Validation tests", () => {
    
    beforeAll(async () => {
    })

    test("Test correct field", async () => {
        var list = [
            {name: "1", type: "INT", constraints: []},
            {name: "2", type: "BOOLEAN", constraints: []},
            {name: "3", type: "DATETIME", constraints: []},
            {name: "4", type: "NUMERIC", constraints: []},
            {name: "5", type: "TEXT", constraints: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with parameters", async () => {
        var list = [
            {name: "1", type: "DECIMAL(4, 2)", constraints: []},
            {name: "2", type: "DECIMAL(4,2)", constraints: []},
            {name: "3", type: "CHARACTER(255)", constraints: []},
            {name: "4", type: "VARCHAR(20)", constraints: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with constraints", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["UNIQUE", "PRIMARY KEY"]},
            {name: "2", type: "BOOLEAN", constraints: ["NOT NULL"]},
            {name: "3", type: "DATETIME", constraints: ["DEFAULT 25"]}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with constraints", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["UNIQUE", "PRIMARY KEY"]},
            {name: "2", type: "BOOLEAN", constraints: ["NOT NULL"]},
            {name: "3", type: "DATETIME", constraints: ["DEFAULT 25"]}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test incorrect field", async () => {
        var list = [
            {name: "1", type: "FAKEFEILD", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V05");
        }
    });
    test("Test incorrect parameter usage", async () => {
        var list = [
            {name: "1", type: "INT(200)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V03");
        }
        var list = [
            {name: "1", type: "DECIMAL(200)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {name: "1", type: "VARCHAR(200,10)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {name: "1", type: "VARCHAR(abc)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {name: "1", type: "VARCHAR200", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V05");
        }
    });
    test("Test incorrect constraint usage", async () => {
        var list = [
            {name: "1", type: "INT", constraints: ["FAKECONSTR"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
        var list = [
            {name: "1", type: "INT", constraints: ["DEFAULT"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
        var list = [
            {name: "1", type: "INT", constraints: ["NOT NULL 5"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
    });
});
