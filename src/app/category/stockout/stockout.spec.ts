import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stockout } from './stockout';

describe('Stockout', () => {
  let component: Stockout;
  let fixture: ComponentFixture<Stockout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stockout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stockout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
