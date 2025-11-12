const valFunctions = require('../functions/validation');
const { fail } = require('assert');

describe("Validation tests", () => {
    
    beforeAll(async () => {
    })

    test("Test correct field", async () => {
        var list = [
            {type: "INT", constraints: []},
            {type: "BOOLEAN", constraints: []},
            {type: "DATETIME", constraints: []},
            {type: "NUMERIC", constraints: []},
            {type: "TEXT", constraints: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with parameters", async () => {
        var list = [
            {type: "DECIMAL(4, 2)", constraints: []},
            {type: "DECIMAL(4,2)", constraints: []},
            {type: "CHARACTER(255)", constraints: []},
            {type: "VARCHAR(20)", constraints: []}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with constraints", async () => {
        var list = [
            {type: "INT", constraints: ["UNIQUE", "PRIMARY KEY"]},
            {type: "BOOLEAN", constraints: ["NOT NULL"]},
            {type: "DATETIME", constraints: ["DEFAULT 25"]},
            {type: "NUMERIC", constraints: ["CHECK (age >= 18)"]}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test correct field with constraints", async () => {
        var list = [
            {type: "INT", constraints: ["UNIQUE", "PRIMARY KEY"]},
            {type: "BOOLEAN", constraints: ["NOT NULL"]},
            {type: "DATETIME", constraints: ["DEFAULT 25"]},
            {type: "NUMERIC", constraints: ["CHECK (age >= 18)"]}
        ]
        var res = await valFunctions.validateFields(list);
        await expect(res).toBe("success");
    });
    test("Test incorrect field", async () => {
        var list = [
            {type: "FAKEFEILD", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V05");
        }
    });
    test("Test incorrect parameter usage", async () => {
        var list = [
            {type: "INT(200)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V03");
        }
        var list = [
            {type: "DECIMAL(200)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {type: "VARCHAR(200,10)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {type: "VARCHAR(abc)", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V04");
        }
        var list = [
            {type: "VARCHAR200", constraints: []},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V05");
        }
    });
    test("Test incorrect constraint usage", async () => {
        var list = [
            {type: "INT", constraints: ["FAKECONSTR"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
        var list = [
            {type: "INT", constraints: ["DEFAULT"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
        var list = [
            {type: "INT", constraints: ["NOT NULL 5"]},
        ]
        try {
            var res = await valFunctions.validateFields(list);
        } catch (err) {
            await expect(err.code).toBe("V06");
        }
    });
});
