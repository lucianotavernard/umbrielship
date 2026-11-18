import { TestBed } from '@angular/core/testing';

import { UserForm } from '../components/user-form';

describe('UserForm', () => {
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  function fill(element: ParentNode, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** The messages shown in the group of the field. */
  function messagesUnder(element: ParentNode, selector: string) {
    const group = element.querySelector(selector)?.closest('t-form-group');
    if (!group) throw new Error(selector);
    return [...group.querySelectorAll('[data-slot="error"]')].map((error) => error.textContent?.trim());
  }

  /** An invalid form no longer disables the save button (AD-057): using it sends nothing and speaks under the field. */
  async function saveInvalid(element: HTMLElement) {
    const button = submitButton(element);
    expect(button.disabled).toBe(false);
    expect(button.textContent?.trim()).toBe('Criar usuário');
    button.click();
    await settle();
  }

  async function render() {
    const fixture = TestBed.createComponent(UserForm);
    const emitted: unknown[] = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
    await settle();
    return { fixture, emitted, element: fixture.nativeElement as HTMLElement };
  }

  function submitButton(element: HTMLElement) {
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button) throw new Error('submit');
    return button;
  }

  async function fillValid(element: HTMLElement, overrides: Partial<Record<'name' | 'password', string>> = {}) {
    fill(element, '#user-name', overrides.name ?? 'Ana');
    fill(element, '#user-email', 'ana@atlantic.test');
    fill(element, '#user-password', overrides.password ?? 'secret-pass');
    fill(element, '#user-role', 'operator');
    await settle();
  }

  it('[C97] does not emit a name of 81 characters', async () => {
    const { element, emitted } = await render();
    await fillValid(element, { name: 'A'.repeat(81) });
    await saveInvalid(element);
    expect(emitted).toEqual([]);
    expect(messagesUnder(element, '#user-name')).toEqual(['Nome deve ter no máximo 80 caracteres']);
    expect(element.querySelectorAll('[data-slot="error"]')).toHaveLength(1);
  });

  it('[C97] does not emit a password of 7 characters', async () => {
    const { element, emitted } = await render();
    await fillValid(element, { password: '1234567' });
    await saveInvalid(element);
    expect(emitted).toEqual([]);
    expect(messagesUnder(element, '#user-password')).toEqual(['Senha deve ter no mínimo 8 caracteres']);
    expect(element.querySelectorAll('[data-slot="error"]')).toHaveLength(1);
  });

  it('[C97] does not emit a password of 73 characters', async () => {
    const { element, emitted } = await render();
    await fillValid(element, { password: 'p'.repeat(73) });
    await saveInvalid(element);
    expect(emitted).toEqual([]);
    expect(messagesUnder(element, '#user-password')).toEqual(['Senha deve ter no máximo 72 caracteres']);
    expect(element.querySelectorAll('[data-slot="error"]')).toHaveLength(1);
  });

  it('[C97] emits Ana and secret-pass', async () => {
    const { element, emitted } = await render();
    await fillValid(element);
    expect(submitButton(element).disabled).toBe(false);
    element.querySelector('form')?.requestSubmit();
    await settle();
    expect(emitted).toEqual([
      { name: 'Ana', email: 'ana@atlantic.test', password: 'secret-pass', role: 'operator' },
    ]);
  });
});
