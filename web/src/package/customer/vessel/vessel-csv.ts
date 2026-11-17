import { VesselType, vesselTypeLabels } from './vessel.service';

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

function cell(value: string): string {
  // A cell a spreadsheet would run as a formula is kept as text.
  const safe = /^[\t\n\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
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

  return '﻿' + lines.map((line) => line.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
