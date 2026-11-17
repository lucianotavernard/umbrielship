import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  configureWriteAccess,
  render,
  writeControls,
  writeControlsOf,
} from '../../../shared/testing/write-access';

describe('CustomerList for an inspector', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('inspector C22 renders no write control for an inspector', async () => {
    const writer = await render('customers', 'operator');
    expect(writeControls(writer)).toEqual(expect.arrayContaining(writeControlsOf['customers']));

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('customers', 'inspector');
    expect(writeControls(inspector)).toEqual([]);
  });

  it('customer-ui C26 renders no write control for an inspector', async () => {
    const texts = ['Novo cliente'];
    const labels = ['Editar Atlantic', 'Excluir Atlantic'];
    const present = (element: HTMLElement) => [
      ...[...element.querySelectorAll('button')]
        .map((button) => button.textContent?.trim() ?? '')
        .filter((text) => texts.includes(text)),
      ...labels.filter((label) => element.querySelector(`[aria-label="${label}"]`)),
    ];

    const writer = await render('customers', 'operator');
    expect(present(writer).sort()).toEqual([...texts, ...labels].sort());

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('customers', 'inspector');
    expect(present(inspector)).toEqual([]);
  });
});
