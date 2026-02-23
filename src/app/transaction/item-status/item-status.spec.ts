import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemStatus } from './item-status';

describe('ItemStatus', () => {
  let component: ItemStatus;
  let fixture: ComponentFixture<ItemStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
