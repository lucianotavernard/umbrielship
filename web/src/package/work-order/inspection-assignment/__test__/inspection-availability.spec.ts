import { inspectionBlockedReason } from '../inspection-availability';

const ORDER = 'Disponível com a ordem em andamento';
const SERVICE = 'Disponível com o serviço em andamento';

describe('inspectionBlockedReason', () => {
  it('work-order-ui C42 blocks on the work order and then on the target service', () => {
    // The WorkOrder counts first, whatever its target.
    expect(inspectionBlockedReason('PENDING', 'IN_PROGRESS', true)).toBe(ORDER);
    expect(inspectionBlockedReason('PENDING', 'PENDING', true)).toBe(ORDER);
    expect(inspectionBlockedReason('COMPLETED', null, false)).toBe(ORDER);
    expect(inspectionBlockedReason('CANCELLED', undefined, false)).toBe(ORDER);
    expect(inspectionBlockedReason(null, null, false)).toBe(ORDER);

    // A WorkOrder in progress with a target: the service must be in progress too.
    expect(inspectionBlockedReason('IN_PROGRESS', 'PENDING', true)).toBe(SERVICE);
    expect(inspectionBlockedReason('IN_PROGRESS', 'COMPLETED', true)).toBe(SERVICE);
    expect(inspectionBlockedReason('IN_PROGRESS', null, true)).toBe(SERVICE);
    expect(inspectionBlockedReason('IN_PROGRESS', 'IN_PROGRESS', true)).toBeNull();

    // No target: only the WorkOrder counts.
    expect(inspectionBlockedReason('IN_PROGRESS', null, false)).toBeNull();
    expect(inspectionBlockedReason('IN_PROGRESS', 'PENDING', false)).toBeNull();
  });
});
