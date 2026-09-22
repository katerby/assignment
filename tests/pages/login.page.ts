import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async logIn(username: string, password: string): Promise<void> {
    await this.page.getByPlaceholder('Username', { exact: true }).fill(username);
    await this.page.getByPlaceholder('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Login', exact: true }).click();
  }

  async expectDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/web\/index\.php\/dashboard\/index$/);
    await expect(this.page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    // The shared demo account name changes without notice; this may need updating if its display format changes.
    const authenticatedUserName = this.page
      .getByRole('banner')
      .getByRole('paragraph')
      .filter({ hasText: /\S+.*\suser$/i });
    await expect(authenticatedUserName).toBeVisible();
    await expect(authenticatedUserName).toHaveText(/\S/);
  }
}
