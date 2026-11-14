import { TestBed } from '@angular/core/testing';

import { UserForm } from '../components/user-form';

describe('UserForm Papel select', () => {
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

  it('inspector C19 offers Administrador, Operador and Inspetor and sends role inspector', async () => {
    const fixture = TestBed.createComponent(UserForm);
    const emitted: unknown[] = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    const options = [...element.querySelectorAll<HTMLOptionElement>('#user-role option')];
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Administrador',
      'Operador',
      'Inspetor',
    ]);
    expect(element.querySelector<HTMLSelectElement>('#user-role')?.value).toBe('operator');

    fill(element, '#user-name', 'Ines');
    fill(element, '#user-email', 'ines@atlantic.test');
    fill(element, '#user-password', 'secret-pass');
    fill(element, '#user-role', 'inspector');
    await settle();
    element.querySelector('form')?.requestSubmit();
    await settle();

    expect(emitted).toEqual([
      { name: 'Ines', email: 'ines@atlantic.test', password: 'secret-pass', role: 'inspector' },
    ]);
  });
});
