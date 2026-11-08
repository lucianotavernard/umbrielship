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
    expect(submitButton(element).disabled).toBe(true);
    element.querySelector('form')?.requestSubmit();
    await settle();
    expect(emitted).toEqual([]);
  });

  it('[C97] does not emit a password of 7 characters', async () => {
    const { element, emitted } = await render();
    await fillValid(element, { password: '1234567' });
    expect(submitButton(element).disabled).toBe(true);
    element.querySelector('form')?.requestSubmit();
    await settle();
    expect(emitted).toEqual([]);
  });

  it('[C97] does not emit a password of 73 characters', async () => {
    const { element, emitted } = await render();
    await fillValid(element, { password: 'p'.repeat(73) });
    expect(submitButton(element).disabled).toBe(true);
    element.querySelector('form')?.requestSubmit();
    await settle();
    expect(emitted).toEqual([]);
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
