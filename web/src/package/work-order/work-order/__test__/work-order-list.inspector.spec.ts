import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { buttonByText, byLabel, click, WorkOrderListPage } from './work-order-list.harness';

describe('WorkOrderList as inspector', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  async function render(role: Role) {
    TestBed.inject(AuthenticationService).role.set(role);
    return WorkOrderListPage.open();
  }

  /** The labels of the row actions of #AB12CD34. */
  const actionLabels = (page: WorkOrderListPage) =>
    [...page.actions('#AB12CD34').querySelectorAll('button')].map((button) => button.getAttribute('aria-label'));

  it('work-order-ui C15 hides the write controls and keeps selection and export', async () => {
    // The same page for a writer shows every control this test then looks for.
    const writer = await render('operator');
    expect(!!buttonByText('Nova ordem de serviço', writer.element)).toBe(true);
    expect(actionLabels(writer)).toEqual(['Editar ordem #AB12CD34', 'Excluir ordem #AB12CD34']);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    const page = await render('inspector');

    expect(!!buttonByText('Nova ordem de serviço', page.element)).toBe(false);
    expect(page.element.textContent).not.toContain('Nova ordem de serviço');
    expect(actionLabels(page)).toEqual([]);
    expect(page.element.textContent).not.toContain('Editar');
    expect(page.element.textContent).not.toContain('Excluir');

    // Selection and Exportar stay.
    await click(byLabel('Selecionar ordem #AB12CD34', page.element));
    expect(byLabel<HTMLInputElement>('Selecionar ordem #AB12CD34', page.element)!.checked).toBe(true);
    await click(byLabel('Selecionar todas as ordens visíveis', page.element));
    expect(page.exportButton().disabled).toBe(false);
    expect(page.exportButton().textContent?.trim()).toBe('Exportar (5)');
    expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 5 ordens selecionadas em CSV');
  });
});
