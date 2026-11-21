import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

import { AuthenticationForm } from '../components/authentication-form';

describe('AuthenticationForm', () => {
  let fixture: ComponentFixture<AuthenticationForm>;
  let element: HTMLElement;

  beforeEach(async () => {
    // The app's status classes, so `ng-touched` and `ng-invalid` land as in the browser.
    TestBed.configureTestingModule({ providers: [provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })] });
    fixture = TestBed.createComponent(AuthenticationForm);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('drawer-standard C39 the sign-in form outside a drawer keeps its touched message, red field and label', async () => {
    const emailInput = element.querySelector<HTMLInputElement>('#email')!;
    const emailLabel = element.querySelector<HTMLLabelElement>('label[for="email"]')!;

    // Before the field is left nothing speaks.
    expect(element.querySelector('t-input-error')).toBeNull();

    emailInput.focus();
    emailInput.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    // Left empty, with no submit: today's touched message under the field.
    expect([...element.querySelectorAll('t-input-error')].map((error) => error.textContent?.trim())).toEqual([
      'E-mail é obrigatório',
    ]);
    // The field turns red through today's touched rule, not the drawer's.
    expect(emailInput.classList.contains('ng-touched')).toBe(true);
    expect(emailInput.classList.contains('ng-invalid')).toBe(true);
    expect(emailInput.classList.contains('[&.ng-invalid.ng-touched]:border-destructive')).toBe(true);
    expect(emailInput.classList.contains('text-[11px]')).toBe(false);
    // The label keeps the sign-in page's size (12px, never the drawer's 10px) and turns red
    // through its group, as its input sits in a wrapper beside it.
    expect(emailLabel.classList.contains('text-[12px]')).toBe(true);
    expect(emailLabel.classList.contains('text-[10px]')).toBe(false);
    expect(emailLabel.closest('t-form-group')?.classList.contains('group/field')).toBe(true);
    expect(emailLabel.classList.contains('group-has-[input.ng-invalid.ng-touched]/field:text-destructive')).toBe(true);
    // None of the drawer's marks.
    expect(element.querySelector('[data-invalid]')).toBeNull();
    expect(element.querySelector('[data-slot="error"]')).toBeNull();
  });

  it('shows and hides the password from the eye button', async () => {
    const passwordInput = element.querySelector<HTMLInputElement>('#password')!;
    const toggle = element.querySelector<HTMLButtonElement>('button[aria-label="Mostrar senha"]')!;

    expect(passwordInput.type).toBe('password');
    expect(toggle.type).toBe('button');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    toggle.click();
    await fixture.whenStable();

    expect(passwordInput.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar senha');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    toggle.click();
    await fixture.whenStable();

    expect(passwordInput.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar senha');
  });
});
