import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  configureWriteAccess,
  render,
  writeControls,
  writeControlsOf,
} from '../../../shared/testing/write-access';

describe('VesselList for an inspector', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('inspector C24 renders no write control for an inspector', async () => {
    const writer = await render('vessels', 'operator');
    expect(writeControls(writer)).toEqual(expect.arrayContaining(writeControlsOf['vessels']));

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('vessels', 'inspector');
    expect(writeControls(inspector)).toEqual([]);
  });

  it('customer-ui C45 renders no write control and keeps the export for an inspector', async () => {
    const texts = ['Nova embarcação'];
    const labels = ['Editar embarcação Aurora', 'Excluir embarcação Aurora'];
    const present = (element: HTMLElement) => [
      ...[...element.querySelectorAll('button')]
        .map((button) => button.textContent?.trim() ?? '')
        .filter((text) => texts.includes(text)),
      ...labels.filter((label) => element.querySelector(`[aria-label="${label}"]`)),
    ];

    const writer = await render('vessels', 'operator');
    expect(present(writer).sort()).toEqual([...texts, ...labels].sort());

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('vessels', 'inspector');
    expect(present(inspector)).toEqual([]);
    // Selection and export read nothing a Role guards.
    expect(inspector.querySelector('[aria-label="Selecionar embarcação Aurora"]')).not.toBeNull();
    expect(inspector.querySelector('[aria-label="Selecionar todas as embarcações visíveis"]')).not.toBeNull();
    expect(inspector.querySelector('[aria-label="Selecione embarcações para exportar"]')).not.toBeNull();
  });
});
