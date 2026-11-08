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

  it('[C87] does not emit a name of 81 characters', async () => {
    const fixture = TestBed.createComponent(OrganizationForm);
    const emitted: unknown[] = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    fill(element, '#organization-name', 'N'.repeat(81));
    fill(element, '#organization-email', 'ops@atlantic.test');
    await settle();
    const submit = element.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submit?.disabled).toBe(true);
    element.querySelector('form')?.requestSubmit();
    await settle();
    expect(emitted).toEqual([]);
  });
});
