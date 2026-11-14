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
});
