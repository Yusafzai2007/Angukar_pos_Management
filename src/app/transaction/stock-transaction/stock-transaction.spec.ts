import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransaction } from './stock-transaction';

describe('StockTransaction', () => {
  let component: StockTransaction;
  let fixture: ComponentFixture<StockTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTransaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTransaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
