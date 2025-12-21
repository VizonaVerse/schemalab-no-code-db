import { test, expect } from '@playwright/test';
import { registerAndLoginViaUi } from '../helpers/auth.helper';
import { createTestUser, TestUser} from '../helpers/user.factory';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

test.afterEach(async ({ request }) => {
    await request.delete(`/test/cleanup-user`);
});

/* 
*
* The following tests check that all authentication functionalities work through the UI.
*
*/

/*  Test all aspects of registration. */

// outcome: success and redirect to login page
test('register a new user', async ({ page }) => {
    const user = createTestUser();

    // Register the User
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterSuccess();
});

// outcome: error on register
test('register a existing user', async ({ page }) => {
    const user = createTestUser();

    // Register the User
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterSuccess();
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterFailure();
});

/*  Test login. */

// outcome: success and redirect to projects page
test('login a new user', async ({ page }) => {
    const user = createTestUser();

    // Register the User
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterSuccess();
});

// Test ProfileDropDown component on the projects page

// Test Forgot password