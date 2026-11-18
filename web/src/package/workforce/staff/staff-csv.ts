import { csvDocument } from '../../shared/components/lib/csv';
import { StaffRow } from './staff-filters';

/** The mareos columns, with "Sem equipe" for a Staff with no Team. */
export const STAFF_CSV_HEADER = ['Nome', 'Especialidade', 'Equipe', 'E-mail', 'Telefone', 'Status'];

export function staffCsv(rows: StaffRow[]): string {
  return csvDocument([
    STAFF_CSV_HEADER,
    ...rows.map((row) => [row.name, row.specialty, row.teamName, row.email, row.phone, row.status]),
  ]);
}
