import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../index';

@Component({
  imports: [
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
  ],
  template: `
    <t-sidebar-provider>
      <t-sidebar collapsible="icon">
        <t-sidebar-content>
          <ul tSidebarMenu>
            <li tSidebarMenuItem>
              <a tSidebarMenuButton tooltip="Clientes" isActive><span>Clientes</span></a>
            </li>
          </ul>
        </t-sidebar-content>
      </t-sidebar>
      <button tSidebarTrigger type="button"></button>
    </t-sidebar-provider>
  `,
})
class Host {}

describe('t-sidebar', () => {
  beforeEach(() => localStorage.clear());

  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    return {
      fixture,
      sidebar: element.querySelector('t-sidebar')!,
      link: element.querySelector('a')!,
      trigger: element.querySelector<HTMLButtonElement>('button[tSidebarTrigger]')!,
    };
  }

  it('renders the projected menu once, expanded, with the active item marked', async () => {
    const { sidebar, link } = await render();

    expect(sidebar.querySelectorAll('a')).toHaveLength(1);
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
    expect(sidebar.getAttribute('data-collapsible')).toBe('');
    expect(link.getAttribute('data-active')).toBe('true');
    expect(link.hasAttribute('title')).toBe(false);
  });

  it('collapses to icons on the trigger, shows the tooltip and keeps the choice', async () => {
    const { fixture, sidebar, link, trigger } = await render();

    trigger.click();
    await fixture.whenStable();

    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    expect(sidebar.getAttribute('data-collapsible')).toBe('icon');
    expect(link.getAttribute('title')).toBe('Clientes');
    expect(localStorage.getItem('@mareos:sidebar')).toBe('false');
  });

  it('starts collapsed when that was the last choice', async () => {
    localStorage.setItem('@mareos:sidebar', 'false');

    const { sidebar } = await render();

    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
  });

  it('toggles on Ctrl+B', async () => {
    const { fixture, sidebar } = await render();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
    await fixture.whenStable();

    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
  });
});
