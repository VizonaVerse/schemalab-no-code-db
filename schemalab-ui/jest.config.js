/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnviroment: 'jsdom',
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};