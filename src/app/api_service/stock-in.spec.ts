import { TestBed } from '@angular/core/testing';

import { StockIn } from './stock-in';

describe('StockIn', () => {
  let service: StockIn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockIn);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
