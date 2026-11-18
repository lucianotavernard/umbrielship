import { HttpTestingController } from '@angular/common/http/testing';

/**
 * Answers the reads a page makes to show or choose a "Responsável" (`/api/staff`, `/api/teams`,
 * `/api/assignments`), when it made them: a page requests them for an administrator, and the
 * WorkOrder detail for every Role.
 */
export function answerWorkforce(
  controller: HttpTestingController,
  { staff = [], teams = [], assignments = [] }: { staff?: object[]; teams?: object[]; assignments?: object[] } = {},
) {
  for (const request of controller.match({ method: 'GET', url: '/api/staff' })) request.flush({ staff });
  for (const request of controller.match({ method: 'GET', url: '/api/teams' })) request.flush({ teams });
  for (const request of controller.match({ method: 'GET', url: '/api/assignments' })) request.flush({ assignments });
}
