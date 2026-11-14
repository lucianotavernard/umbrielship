import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  configureWriteAccess,
  render,
  writeControls,
  writeControlsOf,
} from '../../../shared/testing/write-access';

describe('WorkOrderDetail for an inspector', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('inspector C26 renders no write control for an inspector', async () => {
    const writer = await render('work-orders/:id', 'operator');
    expect(writeControls(writer)).toEqual(
      expect.arrayContaining(writeControlsOf['work-orders/:id']),
    );

    TestBed.resetTestingModule();
    configureWriteAccess();

    const inspector = await render('work-orders/:id', 'inspector');
    expect(writeControls(inspector)).toEqual([]);
  });
});
