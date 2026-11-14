import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  configureWriteAccess,
  render,
  writeControls,
  writeControlsOf,
} from '../../../shared/testing/write-access';

describe('VesselDetail for an inspector', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('inspector C25 renders no write control for an inspector', async () => {
    const writer = await render('vessels/:id', 'operator');
    expect(writeControls(writer)).toEqual(expect.arrayContaining(writeControlsOf['vessels/:id']));

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('vessels/:id', 'inspector');
    expect(writeControls(inspector)).toEqual([]);
  });
});
