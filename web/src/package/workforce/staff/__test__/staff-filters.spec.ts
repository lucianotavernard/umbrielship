import { filterStaff, NO_TEAM, NO_TEAM_FILTER, sortStaff, specialtyChips, staffMetrics, StaffRow } from '../staff-filters';

const row = (overrides: Partial<StaffRow>): StaffRow => ({
  id: 'id',
  name: 'Nome',
  specialty: 'Mecânico naval',
  email: 'nome@umbriel.test',
  phone: '(13) 1',
  teamId: null,
  teamName: NO_TEAM,
  status: 'Disponível',
  ...overrides,
});

const rafael = row({ id: 'rafael', name: 'Rafael Mendes', teamId: 'alfa', teamName: 'Equipe Alfa', email: 'rafael@x.test' });
const pedro = row({ id: 'pedro', name: 'Pedro Nascimento', email: 'pedro@x.test' });
const camila = row({
  id: 'camila',
  name: 'Camila Rocha',
  specialty: 'Técnica elétrica',
  teamId: 'alfa',
  teamName: 'Equipe Alfa',
  email: 'camila@x.test',
  status: 'Em serviço',
});
const joao = row({
  id: 'joao',
  name: 'João Ferreira',
  specialty: 'Especialista hidráulico',
  teamId: 'bravo',
  teamName: 'Equipe Bravo',
  email: 'joao@x.test',
  status: 'Em serviço',
});

describe('staffMetrics', () => {
  it('workforce C10 counts staff, teams and available staff padded to two digits', () => {
    expect(staffMetrics([rafael, pedro, camila, joao], 3)).toEqual({ staff: '04', teams: '03', available: '02' });
    expect(staffMetrics([], 0)).toEqual({ staff: '00', teams: '00', available: '00' });
    const many = Array.from({ length: 12 }, (_, index) => row({ id: `s${index}`, status: index < 11 ? 'Disponível' : 'Em serviço' }));
    expect(staffMetrics(many, 10)).toEqual({ staff: '12', teams: '10', available: '11' });
  });
});

describe('sortStaff', () => {
  it('workforce C11 orders by name in pt-BR', () => {
    const names = sortStaff([
      row({ name: 'Pedro' }),
      row({ name: 'Ângela' }),
      row({ name: 'bianca' }),
      row({ name: 'Álvaro' }),
      row({ name: 'Camila' }),
    ]).map((item) => item.name);

    expect(names).toEqual(['Álvaro', 'Ângela', 'bianca', 'Camila', 'Pedro']);
  });
});

describe('filterStaff', () => {
  const rows = [rafael, pedro, camila, joao];
  const ids = (list: StaffRow[]) => list.map((item) => item.id);

  it('workforce C12 combines the search, the team and the specialty', () => {
    expect(ids(filterStaff(rows, '', null, ''))).toEqual(['rafael', 'pedro', 'camila', 'joao']);
    // The chip "Mecânico naval" holds Rafael (Equipe Alfa) and Pedro (no team).
    expect(ids(filterStaff(rows, '', 'Mecânico naval', ''))).toEqual(['rafael', 'pedro']);
    expect(ids(filterStaff(rows, NO_TEAM_FILTER, 'Mecânico naval', ''))).toEqual(['pedro']);
    expect(ids(filterStaff(rows, 'alfa', null, ''))).toEqual(['rafael', 'camila']);
    // The search compares name, specialty, team name and email without case.
    expect(ids(filterStaff(rows, '', null, 'ALFA'))).toEqual(['rafael', 'camila']);
    expect(ids(filterStaff(rows, '', null, 'hidráulico'))).toEqual(['joao']);
    expect(ids(filterStaff(rows, '', null, 'PEDRO@X'))).toEqual(['pedro']);
    expect(ids(filterStaff(rows, '', null, '  sem equipe '))).toEqual(['pedro']);
    expect(ids(filterStaff(rows, 'alfa', 'Técnica elétrica', 'camila'))).toEqual(['camila']);
    expect(ids(filterStaff(rows, 'bravo', 'Mecânico naval', ''))).toEqual([]);
  });
});

describe('specialtyChips', () => {
  it('workforce C12 counts each specialty in pt-BR order', () => {
    expect(specialtyChips([rafael, pedro, camila, joao])).toEqual([
      { specialty: 'Especialista hidráulico', count: 1 },
      { specialty: 'Mecânico naval', count: 2 },
      { specialty: 'Técnica elétrica', count: 1 },
    ]);
    expect(specialtyChips([])).toEqual([]);
  });
});
