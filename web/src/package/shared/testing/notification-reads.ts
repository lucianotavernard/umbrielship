import type { HttpTestingController } from '@angular/common/http/testing';

const EMPTY: Record<string, object> = {
  '/api/work-orders': { workOrders: [], total: 0 },
  '/api/vessels': { vessels: [], total: 0 },
  '/api/inspection-assignments': { inspectionAssignments: [] },
};

/**
 * Answers, empty, the reads of the top bar's bell (AD-116) for a spec that renders the layout and is
 * about something else.
 */
export function flushNotificationReads(controller: HttpTestingController) {
  for (const request of controller.match((candidate) => candidate.method === 'GET' && candidate.url in EMPTY)) {
    if (!request.cancelled) request.flush(EMPTY[request.request.url]);
  }
}
