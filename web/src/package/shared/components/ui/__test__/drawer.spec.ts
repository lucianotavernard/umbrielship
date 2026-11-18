import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucideShip } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../drawer';
import { FormGroup, Input, Label, Select } from '../form';
import { Sheet } from '../sheet';

/** The frame of "Nova ordem de serviço": a sheet, a drawer form, a card with a required field and the footer. */
@Component({
  imports: [Sheet, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark, FormGroup, Label, Input],
  viewProviders: [provideIcons({ lucideCalendarDays })],
  template: `
    <t-sheet
      [isActive]="true"
      kicker="NOVA SOLICITAÇÃO"
      title="Nova ordem de serviço"
      description="Preencha os dados para abrir uma nova ordem de serviço."
    >
      <form [tDrawerForm]="false" novalidate (submit)="$event.preventDefault()">
        <t-drawer-body>
          <section
            tDrawerCard
            heading="Planejamento"
            subheading="Defina o período e o status da ordem"
            icon="lucideCalendarDays"
          >
            <t-form-group>
              <label tLabel for="frame-start">Docagem <t-required /></label>
              <input tInput id="frame-start" type="datetime-local" />
            </t-form-group>
          </section>
        </t-drawer-body>
        <footer tDrawerFooter submitLabel="Criar ordem" [loading]="loading()" (cancelled)="cancels.push(true)"></footer>
      </form>
    </t-sheet>
  `,
})
class FrameHost {
  readonly loading = signal(false);
  readonly cancels: boolean[] = [];
}

/** A sheet told another close label. */
@Component({
  imports: [Sheet],
  template: `<t-sheet [isActive]="true" title="Outro" closeLabel="Fechar atribuição"></t-sheet>`,
})
class LabelledHost {}

/** A sheet whose form opens with a read-only input and a disabled select before its first open field. */
@Component({
  imports: [Sheet, DrawerForm, DrawerBody, DrawerCard, FormGroup, Label, Input, Select],
  viewProviders: [provideIcons({ lucideShip })],
  template: `
    <t-sheet [isActive]="open()" title="Editar ordem de serviço">
      <form [tDrawerForm]="false" novalidate>
        <t-drawer-body>
          <section tDrawerCard heading="Embarcação e cliente" icon="lucideShip">
            <t-form-group>
              <label tLabel for="focus-readonly">Cliente responsável</label>
              <input tInput id="focus-readonly" type="text" readonly value="Pescados Atlântico" />
            </t-form-group>
            <t-form-group>
              <label tLabel for="focus-disabled">Embarcação</label>
              <select tSelect id="focus-disabled" disabled>
                <option value="v-aur">Aurora</option>
              </select>
            </t-form-group>
            <t-form-group>
              <label tLabel for="focus-open">Docagem</label>
              <input tInput id="focus-open" type="datetime-local" />
            </t-form-group>
          </section>
        </t-drawer-body>
      </form>
    </t-sheet>
  `,
})
class FocusHost {
  readonly open = signal(false);
}

describe('Drawer', () => {
  const squash = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
  const classes = (element: Element | null | undefined) => [...(element?.classList ?? [])];

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  async function render<T>(host: new () => T) {
    const fixture = TestBed.createComponent(host);
    await fixture.whenStable();
    await settle();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  const footerOf = (element: HTMLElement) => element.querySelector<HTMLElement>('footer[tDrawerFooter]')!;
  const cancelButton = (element: HTMLElement) =>
    [...footerOf(element).querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => squash(button.textContent) === 'Cancelar',
    )!;
  const saveButton = (element: HTMLElement) => footerOf(element).querySelector<HTMLButtonElement>('button[type="submit"]')!;

  it('drawer-standard C3 the sheet header shows the kicker, title, description and Fechar formulário', async () => {
    const { element } = await render(FrameHost);
    const dialog = element.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    const header = dialog.querySelector('header')!;

    const kicker = header.querySelector('[data-slot="sheet-kicker"]');
    const title = header.querySelector('[data-slot="sheet-title"]');
    const description = header.querySelector('[data-slot="sheet-description"]');
    expect(squash(kicker?.textContent)).toBe('NOVA SOLICITAÇÃO');
    expect(squash(title?.textContent)).toBe('Nova ordem de serviço');
    expect(squash(description?.textContent)).toBe('Preencha os dados para abrir uma nova ordem de serviço.');
    // Kicker above the title, the title above the description.
    expect(kicker!.compareDocumentPosition(title!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(title!.compareDocumentPosition(description!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // The reference's size: a 20px title, no smaller header.
    expect(classes(title)).toContain('text-[20px]');
    expect(classes(title).filter((token) => /^text-(xs|sm|base|lg|\[1\d?px\])$/.test(token))).toEqual([]);

    const close = header.querySelector<HTMLButtonElement>('button')!;
    expect(close.getAttribute('aria-label')).toBe('Fechar formulário');

    // Unless told otherwise.
    const labelled = await render(LabelledHost);
    expect(
      labelled.element.querySelector('[data-slot="sheet-content"] header button')?.getAttribute('aria-label'),
    ).toBe('Fechar atribuição');
  });

  it('drawer-standard C4 the sheet fills the window below 640px and is 580px wide from 640px', async () => {
    const { element } = await render(FrameHost);
    const dialog = element.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    const tokens = classes(dialog);

    expect(tokens).toContain('w-full');
    expect(tokens).toContain('sm:w-full');
    expect(tokens).toContain('sm:max-w-[580px]');
    expect(tokens.filter((token) => token.includes('max-w-'))).toEqual(['sm:max-w-[580px]']);
    expect(tokens.filter((token) => /(^|:)w-/.test(token)).sort()).toEqual(['sm:w-full', 'w-full']);
  });

  it('drawer-standard C5 a card shows a 34px icon tile, its title and subtitle above its fields', async () => {
    const { element } = await render(FrameHost);
    const card = element.querySelector<HTMLElement>('section[tDrawerCard]')!;
    const header = card.querySelector('header')!;
    const body = card.querySelector<HTMLElement>('[data-slot="drawer-card-body"]')!;

    const tile = header.querySelector('[data-slot="drawer-card-icon"]')!;
    expect(classes(tile)).toContain('size-[34px]');
    expect(tile.getAttribute('data-icon')).toBe('lucideCalendarDays');
    expect(tile.querySelector('ng-icon')).not.toBeNull();

    const title = header.querySelector('[data-slot="drawer-card-title"]')!;
    expect(squash(title.textContent)).toBe('Planejamento');
    expect(classes(title)).toEqual(expect.arrayContaining(['text-[12px]', 'font-semibold']));

    const subtitle = header.querySelector('[data-slot="drawer-card-subtitle"]')!;
    expect(squash(subtitle.textContent)).toBe('Defina o período e o status da ordem');
    expect(classes(subtitle)).toContain('text-[10px]');

    // The header holds no field; the body below it holds them.
    expect(header.querySelector('input, select, textarea')).toBeNull();
    expect(body.querySelector('#frame-start')).not.toBeNull();
    expect(header.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // The grey body scrolls; the drawer header and the footer sit outside it and keep their height.
    const grey = element.querySelector<HTMLElement>('t-drawer-body')!;
    expect(classes(grey)).toEqual(expect.arrayContaining(['overflow-y-auto', 'min-h-0', 'flex-1', 'bg-muted/60']));
    expect(grey.contains(card)).toBe(true);
    expect(grey.contains(footerOf(element))).toBe(false);
    expect(grey.contains(element.querySelector('[data-slot="sheet-title"]'))).toBe(false);
    expect(classes(footerOf(element))).toContain('shrink-0');
  });

  it('drawer-standard C6 a drawer label takes the 10px semibold style and a required mark is a red *', async () => {
    const { element } = await render(FrameHost);
    const label = element.querySelector<HTMLLabelElement>('label[for="frame-start"]')!;

    expect(classes(label)).toEqual(expect.arrayContaining(['text-[10px]', 'font-semibold']));
    expect(classes(label)).not.toContain('text-sm');
    expect(squash(label.textContent)).toBe('Docagem *');

    const mark = label.querySelector('t-required')!;
    expect(squash(mark.textContent)).toBe('*');
    expect(classes(mark)).toContain('text-destructive');
    // After the label text.
    expect(label.lastElementChild).toBe(mark);
    expect(squash(label.firstChild?.textContent)).toBe('Docagem');
  });

  it('drawer-standard C7 the footer shows * Campos obrigatórios, then Cancelar, then the save button', async () => {
    const { element } = await render(FrameHost);
    const footer = footerOf(element);

    const hint = footer.querySelector<HTMLElement>('[data-slot="required-hint"]')!;
    expect(squash(hint.textContent)).toBe('* Campos obrigatórios');
    expect(squash(hint.querySelector('.text-destructive')?.textContent)).toBe('*');

    const buttons = [...footer.querySelectorAll<HTMLButtonElement>('button')];
    expect(buttons.map((button) => squash(button.textContent))).toEqual(['Cancelar', 'Criar ordem']);

    // The sentence on the left, the buttons pushed to the right.
    expect(hint.compareDocumentPosition(buttons[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hint.contains(buttons[0])).toBe(false);
    expect(classes(buttons[0].parentElement)).toContain('ml-auto');
    expect(buttons[0].parentElement).toBe(buttons[1].parentElement);
  });

  it('drawer-standard C8 Cancelar is the 35px outline button with lucideX and emits cancel', async () => {
    const { fixture, element } = await render(FrameHost);
    const cancel = cancelButton(element);

    expect(cancel.type).toBe('button');
    expect(classes(cancel)).toContain('h-[35px]');
    // The outline variant of tButton, not the primary one.
    expect(classes(cancel)).toEqual(expect.arrayContaining(['border', 'shadow-xs', 'hover:bg-accent']));
    expect(classes(cancel)).not.toContain('bg-primary');
    expect(cancel.firstElementChild?.tagName).toBe('NG-ICON');
    expect(cancel.firstElementChild?.getAttribute('name')).toBe('lucideX');

    cancel.click();
    await settle();
    expect(fixture.componentInstance.cancels).toEqual([true]);
  });

  it('drawer-standard C9 the save button is the 35px primary submit with lucideCheck and its label', async () => {
    const { element } = await render(FrameHost);
    const save = saveButton(element);

    expect(save.type).toBe('submit');
    expect(save.disabled).toBe(false);
    expect(classes(save)).toContain('h-[35px]');
    // The primary (default) variant of tButton.
    expect(classes(save)).toEqual(
      expect.arrayContaining(['bg-primary', 'text-primary-foreground', 'hover:bg-primary/90']),
    );
    expect(classes(save)).not.toContain('border');
    expect(save.firstElementChild?.tagName).toBe('NG-ICON');
    expect(save.firstElementChild?.getAttribute('name')).toBe('lucideCheck');
    expect(squash(save.textContent)).toBe('Criar ordem');
    expect(footerOf(element).querySelector('ng-icon[name="lucidePlus"]')).toBeNull();
  });

  it('drawer-standard C10 while loading the save button is disabled with lucideLoader2 and Salvando...', async () => {
    const { fixture, element } = await render(FrameHost);

    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    await settle();
    let save = saveButton(element);
    expect(save.disabled).toBe(true);
    const spinner = save.querySelector('ng-icon[name="lucideLoader2"]');
    expect(spinner).not.toBeNull();
    expect(classes(spinner)).toContain('animate-spin');
    expect(squash(save.textContent)).toBe('Salvando...');
    expect(save.querySelector('ng-icon[name="lucideCheck"]')).toBeNull();

    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();
    await settle();
    save = saveButton(element);
    expect(save.disabled).toBe(false);
    expect(save.querySelector('ng-icon[name="lucideLoader2"]')).toBeNull();
    expect(save.firstElementChild?.getAttribute('name')).toBe('lucideCheck');
    expect(squash(save.textContent)).toBe('Criar ordem');
  });

  it('drawer-standard C11 the sheet focuses its first field that accepts input', async () => {
    const { fixture, element } = await render(FocusHost);
    expect(element.querySelector('[data-slot="sheet-content"]')).toBeNull();

    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    await settle();

    const open = element.querySelector<HTMLInputElement>('#focus-open')!;
    expect(element.querySelector<HTMLInputElement>('#focus-readonly')!.readOnly).toBe(true);
    expect(element.querySelector<HTMLSelectElement>('#focus-disabled')!.disabled).toBe(true);
    expect(document.activeElement).toBe(open);
  });
});
