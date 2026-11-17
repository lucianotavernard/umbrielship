import { workOrdersCsv } from '../work-order-csv';
import { WorkOrderRow } from '../work-order-filters';

// Local wall-clock times, so the dd/MM/yyyy HH:mm expectations hold in any timezone.
const local = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month - 1, day, hours, minutes).toISOString();

const service = (name: string) => ({
  id: name,
  name,
  startDate: local(2026, 11, 17, 9, 12),
  endDate: local(2026, 11, 20, 10, 0),
  status: 'PENDING' as const,
});

const aurora: WorkOrderRow = {
  id: 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  vesselId: 'v-aur',
  startDate: local(2026, 11, 17, 9, 12),
  endDate: local(2026, 11, 20, 10, 0),
  status: 'IN_PROGRESS',
  services: [service('Motor'), service('Pintura')],
  vesselName: 'Aurora',
  customerName: 'Pescados Atlântico',
};

const formula: WorkOrderRow = {
  id: 'cd56ef78-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  vesselId: 'v-sum',
  startDate: local(2026, 1, 2, 7, 5),
  endDate: local(2026, 1, 3, 18, 0),
  status: 'CANCELLED',
  services: [],
  vesselName: '=SUM(A1)',
  customerName: 'Pescados "Atlântico"',
};

describe('workOrderCsv', () => {
  it('work-order-ui C13 writes the header, the Aurora line, a guarded formula and doubled quotes', () => {
    const content = workOrdersCsv([aurora, formula]);

    expect(content.startsWith('﻿')).toBe(true);
    expect(content.slice(1).split('\r\n')).toEqual([
      '"OS","Embarcação","Cliente","Serviço","Docagem","Desdocagem","Status"',
      '"#AB12CD34","Aurora","Pescados Atlântico","Motor · Pintura","17/11/2026 09:12","20/11/2026 10:00","Em andamento"',
      '"#CD56EF78","\'=SUM(A1)","Pescados ""Atlântico""","","02/01/2026 07:05","03/01/2026 18:00","Cancelado"',
    ]);
    // CRLF only: no bare line feed.
    expect(content.replaceAll('\r\n', '')).not.toContain('\n');
  });
});
