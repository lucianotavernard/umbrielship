import { staffCsv } from '../staff-csv';
import { NO_TEAM, StaffRow } from '../staff-filters';

const rows: StaffRow[] = [
  {
    id: 'rafael',
    name: 'Rafael Mendes',
    specialty: 'Mecânico naval',
    email: 'rafael@mareos.test',
    phone: '(13) 99821-4401',
    teamId: 'alfa',
    teamName: 'Equipe Alfa',
    status: 'Em serviço',
  },
  {
    id: 'pedro',
    name: '=Pedro',
    specialty: 'Técnico "geral"',
    email: 'pedro@mareos.test',
    phone: '(13) 2',
    teamId: null,
    teamName: NO_TEAM,
    status: 'Disponível',
  },
];

describe('staffCsv', () => {
  it('workforce C13 writes the header and one line per staff with sem equipe', () => {
    const lines = staffCsv(rows).replace(/^﻿/, '').split('\r\n');

    expect(lines).toEqual([
      '"Nome","Especialidade","Equipe","E-mail","Telefone","Status"',
      '"Rafael Mendes","Mecânico naval","Equipe Alfa","rafael@mareos.test","(13) 99821-4401","Em serviço"',
      `"'=Pedro","Técnico ""geral""","Sem equipe","pedro@mareos.test","(13) 2","Disponível"`,
    ]);
  });
});
