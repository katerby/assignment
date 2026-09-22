import { expect, test } from '@playwright/test';

import { CandidatePage } from '../pages/candidate.page';

test('administrator can add a recruitment candidate', async ({ page, request }, testInfo) => {
  const candidatePage = new CandidatePage(page);
  const uniqueSuffix = `${Date.now()}${testInfo.workerIndex}`.slice(-10);
  const candidate = {
    firstName: `Qa${uniqueSuffix}`,
    lastName: 'Candidate',
    email: `qa.${uniqueSuffix}@example.com`
  };

  let candidateId: number | undefined;

  try {
    await candidatePage.openAddCandidate();
    candidateId = await candidatePage.createCandidate(candidate);
  } finally {
    if (candidateId) {
      const deleteResponse = await request.delete('/web/index.php/api/v2/recruitment/candidates', {
        data: { ids: [candidateId] }
      });
      expect(deleteResponse.ok()).toBeTruthy();
    }
  }
});
