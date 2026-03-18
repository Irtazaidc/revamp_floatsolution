// @ts-nocheck
import { TestBed } from '@angular/core/testing';

import { ProductsPromotionService } from './products-promotion.service';

describe('ProductsPromotionService', () => {
  let service: ProductsPromotionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsPromotionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
