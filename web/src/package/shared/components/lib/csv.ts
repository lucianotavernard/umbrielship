/** A CSV cell: always quoted, quotes doubled, and a value a spreadsheet would run as a formula kept as text. */
export function csvCell(value: string): string {
  const safe = /^[\t\n\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** The CSV of `lines`: UTF-8 BOM, CRLF lines, every cell quoted. */
export function csvDocument(lines: string[][]): string {
  return '﻿' + lines.map((line) => line.map(csvCell).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
