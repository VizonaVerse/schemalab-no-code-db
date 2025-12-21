import { Page, expect } from '@playwright/test';

export class ManagementPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/projects');
    }

    async openDropDown() {
        await this.page.click('[data-testid="project-dropdown"]');
    }

    async openSettings() {
        await this.openDropDown();
        await this.page.click('[data-testid="project-dropdown-settings"]');
    }

    async checkName(expectedName: string) {
        await this.openDropDown();
        const name = await this.page.getByTestId('project-dropdown-name').innerText();

        expect(name?.trim()).toBe(expectedName);
    }

    async logout() {
        await this.openDropDown();
        await this.page.click('[data-testid="project-dropdown-logout"]');
    }

    async settingsPopulateName(name: string) {
        await this.openSettings();
        await this.page.fill('[data-testid="project-modal-name"]', name);
    }

    // assumes settings is already open
    async settingsClickAccept() {
        await this.page.click('[data-testid="project-modal-ok"]');
    }

}