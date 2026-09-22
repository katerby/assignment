import { expect, type Page } from '@playwright/test';

export type EmployeeName = {
  firstName: string;
  lastName: string;
};

export class EmployeeListPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(this.page.getByRole('heading', { name: 'PIM', exact: true })).toBeVisible();
  }

  async openAddEmployee(): Promise<void> {
    await this.page.getByRole('button', { name: /Add$/ }).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/addEmployee$/);
    await expect(this.page.getByRole('heading', { name: 'Add Employee', exact: true })).toBeVisible();
  }

  async createEmployee(employee: EmployeeName): Promise<{ employeeId: string; employeeNumber: string }> {
    await this.page.getByPlaceholder('First Name', { exact: true }).fill(employee.firstName);
    await this.page.getByPlaceholder('Last Name', { exact: true }).fill(employee.lastName);

    const employeeIdInput = this.inputForVisibleLabel('Employee Id');
    await expect(employeeIdInput).not.toHaveValue('');
    const employeeId = await employeeIdInput.inputValue();

    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+$/);
    await expect(this.page.getByRole('heading', { name: 'Personal Details', exact: true })).toBeVisible();

    const employeeNumber = new URL(this.page.url()).pathname.split('/').at(-1);
    if (!employeeNumber) {
      throw new Error('Employee number was not present in the Personal Details URL');
    }

    return { employeeId, employeeNumber };
  }

  async expectEmployeeById(employeeId: string, employee: EmployeeName): Promise<void> {
    await this.open();
    await this.employeeIdSearchInput().fill(employeeId);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();

    const row = this.employeeRow(employeeId);
    await expect(row).toBeVisible();
    await expect(row).toContainText(employee.firstName);
    await expect(row).toContainText(employee.lastName);
  }

  async deleteEmployeeById(employeeId: string): Promise<void> {
    await this.open();
    await this.employeeIdSearchInput().fill(employeeId);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();

    const row = this.employeeRow(employeeId);
    if (!(await row.isVisible())) {
      return;
    }

    await row.getByRole('checkbox').setChecked(true, { force: true });
    await this.page.getByRole('button', { name: /Delete Selected$/ }).click();
    await this.page.getByRole('button', { name: 'Yes, Delete', exact: true }).click();
    await expect(this.page.getByText('Successfully Deleted', { exact: true })).toBeVisible();
  }

  private employeeIdSearchInput() {
    return this.inputForVisibleLabel('Employee Id');
  }

  private employeeRow(employeeId: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: employeeId, exact: true })
    });
  }

  private inputForVisibleLabel(label: string) {
    return this.page
      .getByText(label, { exact: true })
      .locator('..')
      .locator('..')
      .getByRole('textbox');
  }
}
