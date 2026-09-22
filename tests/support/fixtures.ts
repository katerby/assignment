import { test as base, expect, type APIRequestContext } from '@playwright/test';

type EmployeeFixtures = {
  /**
   * Registers an employee for deletion once the test finishes. The argument is
   * the numeric `empNumber` from the Personal Details URL, not the display
   * `Employee Id`, so cleanup always targets exactly the record that was created.
   *
   * Deleting in fixture teardown rather than in the test body means the failure
   * screenshot and trace show the state that failed, and a cleanup error is
   * reported as its own error instead of replacing the assertion that failed.
   */
  trackEmployee: (employeeNumber: string) => void;
  /** The same arrangement for recruitment candidates, keyed by candidate id. */
  trackCandidate: (candidateId: number) => void;
};

async function deleteAll(
  request: APIRequestContext,
  endpoint: string,
  label: string,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const tracked = ids.join(', ');
  const response = await request.delete(endpoint, { data: { ids: ids.map(Number) } });
  const body = await response.text();

  expect(response.ok(), `Failed to delete ${label} ${tracked}: ${response.status()} ${body}`).toBeTruthy();

  // These endpoints answer 200 with the ids they actually removed, so a partial
  // delete is only visible by comparing them against what was requested.
  const deleted: string[] = (JSON.parse(body).data ?? []).map(String);
  expect(deleted, `${label} left behind after cleanup of ${tracked}: ${body}`).toEqual(
    expect.arrayContaining(ids)
  );
}

export const test = base.extend<EmployeeFixtures>({
  trackEmployee: async ({ request }, use) => {
    const ids: string[] = [];
    await use((employeeNumber) => {
      ids.push(employeeNumber);
    });
    await deleteAll(request, '/web/index.php/api/v2/pim/employees', 'employees', ids);
  },

  trackCandidate: async ({ request }, use) => {
    const ids: string[] = [];
    await use((candidateId) => {
      ids.push(String(candidateId));
    });
    await deleteAll(request, '/web/index.php/api/v2/recruitment/candidates', 'candidates', ids);
  }
});

export { expect };
