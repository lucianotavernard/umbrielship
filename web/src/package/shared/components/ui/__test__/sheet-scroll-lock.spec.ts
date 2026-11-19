import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Sheet } from '../sheet';

/** Two drawers a page could hold, each opened on its own. */
@Component({
  imports: [Sheet],
  template: `
    <t-sheet [isActive]="first()" title="Primeiro"></t-sheet>
    <t-sheet [isActive]="second()" title="Segundo"></t-sheet>
  `,
})
class TwoSheetsHost {
  readonly first = signal(false);
  readonly second = signal(false);
}

describe('Sheet scroll lock', () => {
  const overflow = () => document.body.style.overflow;

  async function render() {
    const fixture = TestBed.createComponent(TwoSheetsHost);
    await fixture.whenStable();
    return fixture;
  }

  async function set(fixture: Awaited<ReturnType<typeof render>>, first: boolean, second: boolean) {
    fixture.componentInstance.first.set(first);
    fixture.componentInstance.second.set(second);
    await fixture.whenStable();
  }

  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('removes the page scroll while a drawer is open and gives it back when it closes', async () => {
    const fixture = await render();
    expect(overflow()).toBe('');

    await set(fixture, true, false);
    expect(overflow()).toBe('hidden');

    await set(fixture, false, false);
    expect(overflow()).toBe('');
  });

  it('gives the page scroll back when a page leaves with its drawer open', async () => {
    const fixture = await render();
    await set(fixture, true, false);
    expect(overflow()).toBe('hidden');

    fixture.destroy();
    expect(overflow()).toBe('');
  });

  it('keeps the page locked until every open drawer closes', async () => {
    const fixture = await render();

    await set(fixture, true, true);
    expect(overflow()).toBe('hidden');
    await set(fixture, false, true);
    expect(overflow()).toBe('hidden');
    await set(fixture, false, false);
    expect(overflow()).toBe('');
  });

  it("restores the body's own overflow after the drawer closes", async () => {
    document.body.style.overflow = 'auto';
    const fixture = await render();

    await set(fixture, true, false);
    expect(overflow()).toBe('hidden');
    await set(fixture, false, false);
    expect(overflow()).toBe('auto');
  });
});
