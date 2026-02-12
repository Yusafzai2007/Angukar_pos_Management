import { TestBed } from '@angular/core/testing';

import { ServiceStockoutdata } from './service-stockoutdata';

describe('ServiceStockoutdata', () => {
  let service: ServiceStockoutdata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceStockoutdata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
