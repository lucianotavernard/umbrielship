import { twoDigits } from '../../shared/components/ui/metric';
import { Vessel } from './vessel.service';

/** The four cards of "Resumo da frota", padded to two digits, over every Vessel (AD-099). */
export function vesselMetrics(vessels: Pick<Vessel, 'status'>[]) {
  const count = (status: Vessel['status']) => vessels.filter((vessel) => vessel.status === status).length;
  return {
    total: twoDigits(vessels.length),
    active: twoDigits(count('ACTIVE')),
    maintenance: twoDigits(count('MAINTENANCE')),
    inactive: twoDigits(count('INACTIVE')),
  };
}
