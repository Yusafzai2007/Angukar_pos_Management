import { TestBed } from '@angular/core/testing';

import { Stockoutservice } from './stockoutservice';

describe('Stockoutservice', () => {
  let service: Stockoutservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Stockoutservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
