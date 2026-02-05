import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStockout } from './edit-stockout';

describe('EditStockout', () => {
  let component: EditStockout;
  let fixture: ComponentFixture<EditStockout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStockout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStockout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
