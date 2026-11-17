import { csvDocument } from '../../shared/components/lib/csv';
import { VesselType, vesselTypeLabels } from './vessel.service';

export { downloadCsv } from '../../shared/components/lib/csv';

/** One exported line: a Vessel and the name of its Customer. */
export type VesselCsvRow = {
  name: string;
  imoNumber: string;
  type: VesselType;
  length: number;
  customerName: string;
};

/** The mareos columns minus ID, Porto base and Status, which the model does not hold (AD-021). */
export const VESSEL_CSV_HEADER = ['Embarcação', 'Número IMO', 'Tipo', 'Comprimento (m)', 'Cliente'];

/** "32,5": the length as the mareos prints it, pt-BR with at most one decimal. */
export function formatLength(length: number): string {
  return length.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

/** The CSV of `rows`: UTF-8 BOM, CRLF lines, every cell quoted. */
export function vesselsCsv(rows: VesselCsvRow[]): string {
  const lines = [
    VESSEL_CSV_HEADER,
    ...rows.map((row) => [
      row.name,
      row.imoNumber,
      vesselTypeLabels[row.type],
      formatLength(row.length),
      row.customerName,
    ]),
  ];

  return csvDocument(lines);
}
