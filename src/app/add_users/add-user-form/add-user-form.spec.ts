import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserForm } from './add-user-form';

describe('AddUserForm', () => {
  let component: AddUserForm;
  let fixture: ComponentFixture<AddUserForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
