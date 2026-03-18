// @ts-nocheck
import { TestBed } from '@angular/core/testing';

import { HcSharedService } from './hc-shared.service';

describe('HcSharedService', () => {
  let service: HcSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HcSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
