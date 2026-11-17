import { vesselsCsv } from '../vessel-csv';

describe('vesselsCsv', () => {
  it('customer-ui C40 writes the header and one quoted line per vessel with BOM and CRLF', () => {
    const csv = vesselsCsv([
      { name: 'Aurora', imoNumber: '9182451', type: 'CARGO', length: 32.5, customerName: 'Pescados Atlântico' },
      { name: 'Vento Leste', imoNumber: '9415832', type: 'FISHING', length: 26, customerName: 'Cooperativa Mar Azul' },
    ]);

    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual([
      '"Embarcação","Número IMO","Tipo","Comprimento (m)","Cliente"',
      '"Aurora","9182451","Carga","32,5","Pescados Atlântico"',
      '"Vento Leste","9415832","Pesca","26","Cooperativa Mar Azul"',
    ]);
    expect(csv).not.toMatch(/[^\r]\n/);
  });

  it('customer-ui C40 guards formulas and doubles quotes', () => {
    const csv = vesselsCsv([
      { name: '=SUM(A1)', imoNumber: '+1', type: 'OTHER', length: 12.34, customerName: 'Cais "Norte"' },
      { name: ' @cmd', imoNumber: '-2', type: 'TANKER', length: 1, customerName: 'Sul' },
    ]);

    const [, first, second] = csv.slice(1).split('\r\n');
    expect(first).toBe(`"'=SUM(A1)","'+1","Outro","12,3","Cais ""Norte"""`);
    expect(second).toBe(`"' @cmd","'-2","Tanque","1","Sul"`);
  });
});
