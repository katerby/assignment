import { EmployeeListPage } from '../pages/employee-list.page';
import { test } from '../support/fixtures';

test('administrator can create an employee and find the record by its employee ID', async ({
  page,
  trackEmployee
}, testInfo) => {
  const employeeList = new EmployeeListPage(page);
  const uniqueSuffix = `${Date.now()}${testInfo.workerIndex}`.slice(-10);
  const employee = {
    firstName: `Qa${uniqueSuffix}`,
    lastName: 'Automation',
    employeeId: uniqueSuffix
  };

  await employeeList.open();
  await employeeList.openAddEmployee();

  trackEmployee(await employeeList.createEmployee(employee));

  await employeeList.expectEmployeeById(employee);
});
