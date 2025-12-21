// Generates new valid user details
export type TestUser = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export function createTestUser(): TestUser {
    const id = Date.now();

    return {
        email: `testuser_${id}@surrey.ac.uk`,
        password: `Password123!`,
        first_name: `Test`,
        last_name: `User${id}`, 
    }
}