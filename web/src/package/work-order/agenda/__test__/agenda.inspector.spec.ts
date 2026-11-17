import { HttpTestingController } from '@angular/common/http/testing';

import { buttons, configure, NOW, itemsIn, renderAgenda } from './testing';

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
  });
});
