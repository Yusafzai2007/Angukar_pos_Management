import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchStockIn } from './fetch-stock-in';

describe('FetchStockIn', () => {
  let component: FetchStockIn;
  let fixture: ComponentFixture<FetchStockIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchStockIn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchStockIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
