import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockIn } from './stock-in';

describe('StockIn', () => {
  let component: StockIn;
  let fixture: ComponentFixture<StockIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockIn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
