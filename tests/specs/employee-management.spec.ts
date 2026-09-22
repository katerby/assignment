import { test } from '@playwright/test';

import { EmployeeListPage } from '../pages/employee-list.page';

test('administrator can create an employee and find the record by generated ID', async ({ page }, testInfo) => {
  const employeeList = new EmployeeListPage(page);
  const uniqueSuffix = `${Date.now()}${testInfo.workerIndex}`.slice(-10);
  const employee = {
    firstName: `Qa${uniqueSuffix}`,
    lastName: 'Automation'
  };

  let employeeId: string | undefined;

  try {
    await employeeList.open();
    await employeeList.openAddEmployee();
    ({ employeeId } = await employeeList.createEmployee(employee));
    await employeeList.expectEmployeeById(employeeId, employee);
  } finally {
    if (employeeId) {
      await employeeList.deleteEmployeeById(employeeId);
    }
  }
});
