import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { buttonByText, byLabel, click, squash, WorkOrderListPage } from './work-order-list.harness';

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

  /** Every label of the row menu of #AB12CD34, open or not. */
  const menuItems = (page: WorkOrderListPage) =>
    [
      ...byLabel('Ações para #AB12CD34', page.element)!
        .closest('t-dropdown-menu')!
        .querySelectorAll('t-dropdown-menu-content a, t-dropdown-menu-content button'),
    ].map((item) => squash(item.textContent));

  it('work-order-ui C15 hides the write controls and keeps selection and export', async () => {
    // The same page for a writer shows every control this test then looks for.
    const writer = await render('operator');
    expect(!!buttonByText('Nova ordem de serviço', writer.element)).toBe(true);
    expect(menuItems(writer)).toEqual(['Ver detalhes', 'Editar', 'Excluir']);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    const page = await render('inspector');

    expect(!!buttonByText('Nova ordem de serviço', page.element)).toBe(false);
    expect(page.element.textContent).not.toContain('Nova ordem de serviço');
    expect(menuItems(page)).toEqual(['Ver detalhes']);
    const menu = await page.openMenu('#AB12CD34');
    expect(menu.getAttribute('data-state')).toBe('open');
    expect(menu.textContent).not.toContain('Editar');
    expect(menu.textContent).not.toContain('Excluir');

    // Selection and Exportar stay.
    await click(byLabel('Selecionar ordem #AB12CD34', page.element));
    expect(byLabel<HTMLInputElement>('Selecionar ordem #AB12CD34', page.element)!.checked).toBe(true);
    await click(byLabel('Selecionar todas as ordens visíveis', page.element));
    expect(page.exportButton().disabled).toBe(false);
    expect(page.exportButton().textContent?.trim()).toBe('Exportar (5)');
    expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 5 ordens selecionadas em CSV');
  });
});
