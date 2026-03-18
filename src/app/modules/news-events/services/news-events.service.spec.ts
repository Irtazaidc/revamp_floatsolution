// @ts-nocheck
import { TestBed } from '@angular/core/testing';

import { NewsEventsService } from './news-events.service';

describe('NewsEventsService', () => {
  let service: NewsEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
