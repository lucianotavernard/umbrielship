import { HttpTestingController } from '@angular/common/http/testing';

import { buttons, configure, headers, NOW, itemsIn, panel, renderAgenda, settle } from './testing';

describe('Agenda as inspector', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.useRealTimers();
  });

  it('work-order-ui C68 hides every create control', async () => {
    const element = await renderAgenda(controller, 'inspector');

    expect(buttons(element, 'Novo compromisso')).toEqual([]);
    expect(buttons(element, 'Adicionar compromisso neste dia')).toEqual([]);
    expect(element.querySelectorAll('button[aria-label^="Criar compromisso em"]')).toHaveLength(0);
    expect(element.querySelectorAll('[data-slot="add-cell"]')).toHaveLength(0);
    // The week stays readable.
    expect(itemsIn(element.querySelector('[data-slot="grid"]')!)).toHaveLength(6);

    // A day with no item offers no "Adicionar à agenda" either.
    headers(element)[3].click();
    await settle();
    expect(panel(element).textContent).toContain('Aproveite para organizar uma nova manutenção.');
    expect(buttons(panel(element), 'Adicionar à agenda')).toEqual([]);
  });
});
