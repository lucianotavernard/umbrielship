import { TestBed } from '@angular/core/testing';

// Shared steps for the InspectionTemplate specs.

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

export function buttons(element: ParentNode, text: string) {
  return [...element.querySelectorAll<HTMLButtonElement>('button')].filter(
    (button) => button.textContent?.trim() === text || button.getAttribute('aria-label') === text,
  );
}

export function button(element: ParentNode, text: string) {
  const found = buttons(element, text)[0];
  if (!found) throw new Error(`no button ${text}`);
  return found;
}

export function fill(field: HTMLInputElement, value: string) {
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function sheets(element: ParentNode) {
  return [...element.querySelectorAll<HTMLElement>('[role="dialog"]')];
}

export function questionFields(element: ParentNode) {
  return [...element.querySelectorAll<HTMLInputElement>('input[id^="question-"]')];
}

export function questions(element: ParentNode) {
  return questionFields(element).map((field) => field.value);
}

export const summary = (id: string, name: string, itemCount: number) => ({
  id,
  name,
  itemCount,
  createdAt: '2026-11-14T10:00:00.000Z',
});

export const template = (labels: string[], name = 'Pintura do casco') => ({
  id: 't1',
  name,
  createdAt: '2026-11-14T10:00:00.000Z',
  items: labels.map((label, position) => ({ id: `i${position}`, label, position })),
});
