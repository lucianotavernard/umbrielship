import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../index';

@Component({
  imports: [
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
  ],
  template: `
    <button id="outside" type="button">Fora</button>

    <t-dropdown-menu>
      <button tDropdownMenuTrigger id="trigger" type="button">Ações</button>
      <t-dropdown-menu-content>
        <button tDropdownMenuItem id="edit" type="button" (click)="chosen.set('edit')">
          Editar
        </button>
        <button tDropdownMenuItem id="archive" type="button" disabled>Arquivar</button>
        <button tDropdownMenuItem id="remove" type="button" variant="destructive">Excluir</button>
        <button tDropdownMenuCheckboxItem id="photos" type="button" [(checked)]="photos">
          Fotos
        </button>
        <t-dropdown-menu-radio-group [(value)]="order">
          <button tDropdownMenuRadioItem id="by-name" type="button" value="name">Nome</button>
          <button tDropdownMenuRadioItem id="by-date" type="button" value="date">Data</button>
        </t-dropdown-menu-radio-group>
        <t-dropdown-menu-sub>
          <button tDropdownMenuSubTrigger id="more" type="button">Mais</button>
          <t-dropdown-menu-sub-content>
            <button tDropdownMenuItem id="export" type="button">Exportar</button>
          </t-dropdown-menu-sub-content>
        </t-dropdown-menu-sub>
      </t-dropdown-menu-content>
    </t-dropdown-menu>
  `,
})
class Host {
  chosen = signal('');
  photos = signal(false);
  order = signal<string | undefined>('name');
}

describe('t-dropdown-menu', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const get = (id: string) => element.querySelector<HTMLElement>(`#${id}`)!;
    const content = element.querySelector<HTMLElement>('t-dropdown-menu-content')!;
    const subContent = element.querySelector<HTMLElement>('t-dropdown-menu-sub-content')!;

    const press = async (target: HTMLElement, key: string) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await fixture.whenStable();
    };
    const click = async (id: string) => {
      get(id).click();
      await fixture.whenStable();
    };

    return { fixture, host: fixture.componentInstance, get, content, subContent, press, click };
  }

  it('opens on the trigger and closes on it again', async () => {
    const { get, content, click } = await render();

    expect(content.getAttribute('data-state')).toBe('closed');

    await click('trigger');
    expect(content.getAttribute('data-state')).toBe('open');
    expect(get('trigger').getAttribute('aria-expanded')).toBe('true');

    await click('trigger');
    expect(content.getAttribute('data-state')).toBe('closed');
  });

  it('runs the item click, closes and hands the focus back to the trigger', async () => {
    const { host, get, content, click } = await render();

    await click('trigger');
    await click('edit');

    expect(host.chosen()).toBe('edit');
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(get('trigger'));
  });

  it('closes on a press outside and on Escape', async () => {
    const { fixture, get, content, click, press } = await render();

    await click('trigger');
    get('outside').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(content.getAttribute('data-state')).toBe('closed');

    await click('trigger');
    await press(content, 'Escape');
    expect(content.getAttribute('data-state')).toBe('closed');
  });

  it('opens on ArrowDown at the first item and walks the items, skipping the disabled one', async () => {
    const { get, content, press } = await render();

    await press(get('trigger'), 'ArrowDown');
    expect(content.getAttribute('data-state')).toBe('open');
    expect(document.activeElement).toBe(get('edit'));

    await press(get('edit'), 'ArrowDown');
    expect(document.activeElement).toBe(get('remove'));

    await press(get('remove'), 'End');
    expect(document.activeElement).toBe(get('more'));

    await press(get('more'), 'Home');
    expect(document.activeElement).toBe(get('edit'));
  });

  it('toggles a checkbox item and picks a radio item', async () => {
    const { host, get, click } = await render();

    await click('trigger');
    await click('photos');
    expect(host.photos()).toBe(true);
    expect(get('photos').getAttribute('aria-checked')).toBe('true');

    await click('trigger');
    await click('by-date');
    expect(host.order()).toBe('date');
    expect(get('by-date').getAttribute('data-state')).toBe('checked');
    expect(get('by-name').getAttribute('data-state')).toBe('unchecked');
  });

  it('opens the submenu on ArrowRight, returns on ArrowLeft and closes it with the menu', async () => {
    const { get, content, subContent, click, press } = await render();

    await click('trigger');
    get('more').focus();
    await press(get('more'), 'ArrowRight');
    expect(subContent.getAttribute('data-state')).toBe('open');
    expect(document.activeElement).toBe(get('export'));

    await press(get('export'), 'ArrowLeft');
    expect(subContent.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(get('more'));

    await press(get('more'), 'ArrowRight');
    await press(get('export'), 'Escape');
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(subContent.getAttribute('data-state')).toBe('closed');
  });
});
