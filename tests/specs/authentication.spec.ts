import { test } from '@playwright/test';

import { LoginPage } from '../pages/login.page';
import { credentials } from '../support/credentials';

test('user can log in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.logIn(credentials.username, credentials.password);
  await loginPage.expectDashboard();
});
