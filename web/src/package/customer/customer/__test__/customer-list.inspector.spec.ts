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
});
