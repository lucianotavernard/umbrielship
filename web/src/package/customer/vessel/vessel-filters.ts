import { VesselRow } from './components/vessel-list';
import { vesselTypeLabels } from './vessel.service';

const fold = (text: string) => text.toLocaleLowerCase('pt-BR');

/**
 * The rows of `customerId` and of `type` ('' keeps every one) whose name, Customer, IMO number or
 * type label contains `search`, case-insensitive.
 */
export function filterVessels<T extends VesselRow>(rows: T[], customerId: string, type: string, search: string): T[] {
  const term = fold(search.trim());
  return rows.filter(
    (vessel) =>
      (!customerId || vessel.customerId === customerId) &&
      (!type || vessel.type === type) &&
      (!term ||
        fold([vessel.name, vessel.customerName, vessel.imoNumber, vesselTypeLabels[vessel.type]].join(' ')).includes(
          term,
        )),
  );
}

/** The Customers that own a Vessel of `rows`, once each, by name in `pt-BR`: the choices of "Filtrar por cliente". */
export function customerOptions(rows: Pick<VesselRow, 'customerId' | 'customerName'>[]) {
  const byId = new Map(rows.map((vessel) => [vessel.customerId, vessel.customerName]));
  return [...byId]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
