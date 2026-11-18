import { TestBed } from '@angular/core/testing';

import { OrganizationForm } from '../components/organization-form';

describe('OrganizationForm', () => {
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  function fill(element: ParentNode, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** The messages shown in the group of the field. */
  function messagesUnder(element: ParentNode, selector: string) {
    const group = element.querySelector(selector)?.closest('t-form-group');
    if (!group) throw new Error(selector);
    return [...group.querySelectorAll('[data-slot="error"]')].map((error) =>
      error.textContent?.trim(),
    );
  }

  it('[C87] does not emit a name of 81 characters', async () => {
    const fixture = TestBed.createComponent(OrganizationForm);
    const emitted: unknown[] = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    fill(element, '#organization-name', 'N'.repeat(81));
    fill(element, '#organization-email', 'ops@atlantic.test');
    await settle();
    // An invalid form no longer disables the save button (AD-057): using it sends nothing and speaks under the field.
    const submit = element.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submit?.disabled).toBe(false);
    expect(submit?.textContent?.trim()).toBe('Criar organização');
    submit?.click();
    await settle();
    expect(emitted).toEqual([]);
    expect(messagesUnder(element, '#organization-name')).toEqual([
      'Nome deve ter no máximo 80 caracteres',
    ]);
    expect(element.querySelectorAll('[data-slot="error"]')).toHaveLength(1);
  });
});
