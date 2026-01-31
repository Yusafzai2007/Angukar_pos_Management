import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchStockout } from './fetch-stockout';

describe('FetchStockout', () => {
  let component: FetchStockout;
  let fixture: ComponentFixture<FetchStockout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchStockout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchStockout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
