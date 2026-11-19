import { customerOptions, filterVessels } from '../vessel-filters';

const row = (id: string, name: string, customerId: string, customerName: string, type: string, imoNumber = '') =>
  ({ id, name, customerId, customerName, type, imoNumber, length: 20, status: 'ACTIVE' }) as Parameters<
    typeof filterVessels
  >[0][number];

const fleet = [
  row('v1', 'Aurora', 'c-atl', 'Pescados Atlântico', 'CARGO', '9182451'),
  row('v2', 'Lula Branca', 'c-atl', 'Pescados Atlântico', 'FISHING', '9236178'),
  row('v3', 'Vento Leste', 'c-mar', 'Cooperativa Mar Azul', 'TANKER'),
  row('v4', 'Estrela do Sul', 'c-mar', 'Cooperativa Mar Azul', 'FISHING'),
];
const names = (rows: ReturnType<typeof filterVessels>) => rows.map((vessel) => vessel.name);

describe('filterVessels', () => {
  it('keeps every vessel with no customer, no type and no search', () => {
    expect(names(filterVessels(fleet, '', '', ''))).toEqual(['Aurora', 'Lula Branca', 'Vento Leste', 'Estrela do Sul']);
  });

  it('keeps the vessels of the customer, of the type, and of both', () => {
    expect(names(filterVessels(fleet, 'c-atl', '', ''))).toEqual(['Aurora', 'Lula Branca']);
    expect(names(filterVessels(fleet, '', 'FISHING', ''))).toEqual(['Lula Branca', 'Estrela do Sul']);
    expect(names(filterVessels(fleet, 'c-mar', 'FISHING', ''))).toEqual(['Estrela do Sul']);
    expect(names(filterVessels(fleet, 'c-atl', 'TANKER', ''))).toEqual([]);
  });

  it('applies the search within the customer and the type', () => {
    // The search reads the name, the customer, the IMO number and the type's label, case-insensitive.
    // "PESCA" is in the customer "Pescados Atlântico" and in the type label "Pesca".
    expect(names(filterVessels(fleet, '', '', 'PESCA'))).toEqual(['Aurora', 'Lula Branca', 'Estrela do Sul']);
    expect(names(filterVessels(fleet, '', '', '9182'))).toEqual(['Aurora']);
    expect(names(filterVessels(fleet, '', '', 'atlântico'))).toEqual(['Aurora', 'Lula Branca']);
    expect(names(filterVessels(fleet, 'c-mar', '', 'leste'))).toEqual(['Vento Leste']);
    expect(names(filterVessels(fleet, 'c-atl', 'FISHING', 'aurora'))).toEqual([]);
  });
});

describe('customerOptions', () => {
  it('lists the customers that own a vessel once each, by name', () => {
    expect(customerOptions(fleet)).toEqual([
      { id: 'c-mar', name: 'Cooperativa Mar Azul' },
      { id: 'c-atl', name: 'Pescados Atlântico' },
    ]);
    expect(customerOptions([])).toEqual([]);
  });
});
