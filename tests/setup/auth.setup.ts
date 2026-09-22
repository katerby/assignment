import { test as setup } from '@playwright/test';

import { LoginPage } from '../pages/login.page';
import { credentials } from '../support/credentials';

const authFile = 'playwright/.auth/user.json';

setup('create authenticated browser state', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.logIn(credentials.username, credentials.password);
  await loginPage.expectDashboard();

  await page.context().storageState({ path: authFile });
});
