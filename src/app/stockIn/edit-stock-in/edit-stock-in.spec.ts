import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStockIn } from './edit-stock-in';

describe('EditStockIn', () => {
  let component: EditStockIn;
  let fixture: ComponentFixture<EditStockIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStockIn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStockIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
