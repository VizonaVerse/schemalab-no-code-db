import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { createTestUser, TestUser} from './user.factory';
import { Page } from '@playwright/test';

export async function registerViaUi(page: Page): Promise<TestUser> {
    const user = createTestUser();

    // Register the User
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterSuccess();

    return user;
}

export async function loginViaUi(page: Page, user: TestUser): Promise<TestUser> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await loginPage.assertLoggedIn();

    return user;
}

export async function registerAndLoginViaUi(page: Page): Promise<TestUser> {
    const user = createTestUser();

    // Register the User
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.first_name, user.last_name, user.email, user.password);
    await registerPage.assertRegisterSuccess();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await loginPage.assertLoggedIn();

    return user;
}



