import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  configureWriteAccess,
  render,
  writeControls,
  writeControlsOf,
} from '../../../shared/testing/write-access';

describe('CustomerDetail for an inspector', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('inspector C23 renders no write control for an inspector', async () => {
    const writer = await render('customers/:id', 'operator');
    expect(writeControls(writer)).toEqual(expect.arrayContaining(writeControlsOf['customers/:id']));

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('customers/:id', 'inspector');
    expect(writeControls(inspector)).toEqual([]);
  });
});
