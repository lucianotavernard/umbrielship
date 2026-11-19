import { vesselMetrics } from '../vessel-metrics';

describe('vesselMetrics', () => {
  it('counts every vessel and each status padded to two digits', () => {
    const fleet = [
      ...Array.from({ length: 5 }, () => ({ status: 'ACTIVE' as const })),
      ...Array.from({ length: 2 }, () => ({ status: 'MAINTENANCE' as const })),
      { status: 'INACTIVE' as const },
    ];

    expect(vesselMetrics(fleet)).toEqual({ total: '08', active: '05', maintenance: '02', inactive: '01' });
    expect(vesselMetrics([])).toEqual({ total: '00', active: '00', maintenance: '00', inactive: '00' });
  });
});
