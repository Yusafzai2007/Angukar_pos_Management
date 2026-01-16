import { TestBed } from '@angular/core/testing';

import { ServiceData } from './service-data';

describe('ServiceData', () => {
  let service: ServiceData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
