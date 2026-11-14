import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  configureWriteAccess,
  content,
  pages,
  render,
  writeControls,
  writeControlsOf,
} from './write-access';

describe('write access by Role', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  async function renderFresh(
    page: (typeof pages)[number],
    role: 'administrator' | 'operator' | 'inspector',
  ) {
    TestBed.resetTestingModule();
    configureWriteAccess();
    return render(page, role);
  }

  it('inspector C27 the five pages render their write controls for an operator and an administrator', async () => {
    for (const page of pages) {
      for (const role of ['operator', 'administrator'] as const) {
        const element = await renderFresh(page, role);
        expect([...writeControls(element)].sort(), `${role} on ${page}`).toEqual(
          [...writeControlsOf[page]].sort(),
        );
      }
    }
  });

  it('inspector C28 the five pages show the same content to an inspector as to an operator', async () => {
    for (const page of pages) {
      const operator = content(await renderFresh(page, 'operator'));
      const inspector = content(await renderFresh(page, 'inspector'));

      expect(inspector, page).toBe(operator);
      expect(inspector.length, page).toBeGreaterThan(0);
    }
  });
});
