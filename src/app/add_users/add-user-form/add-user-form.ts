import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ServiceData } from '../../create_account/api_service/service-data';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterLink
],
  templateUrl: './add-user-form.html',
  styleUrl: './add-user-form.css',
})
export class AddUserForm {

  showPassword = false;
  isLoading = false;

  userlogin = {
    userName: '',
    email: '',
    password: '',
    role: '',
    status: 'ACTIVE',
  };

  constructor(
    private service: ServiceData,
    private dialog: MatDialog
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  setStatus(value: 'ACTIVE' | 'DEACTIVE') {
    this.userlogin.status = value;
  }

  submitForm() {
    if (!this.validateForm()) {
      this.openModal('error', 'Please fill all required fields');
      return;
    }

    this.isLoading = true;
    
    const payload = {
      ...this.userlogin,
      status: this.userlogin.status.toLowerCase()
    };

    this.service.signup(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (res.status === 201) {
          this.openModal('success', 'User created successfully!');
          this.resetForm();
        } else {
          this.openModal('error', res.message || 'Something went wrong');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.openModal('error', err.error?.message || 'Failed to create user');
      },
    });
  }

  validateForm(): boolean {
    return !!(this.userlogin.userName && 
              this.userlogin.email && 
              this.userlogin.password && 
              this.userlogin.role);
  }

  openModal(type: 'success' | 'error', message: string) {
    this.dialog.open(StatusModalComponent, {
      width: '400px',
      data: { type, message },
      position: { right: '20px', top: '20px' },
      panelClass: 'custom-dialog-container'
    });
  }

  resetForm() {
    this.userlogin = {
      userName: '',
      email: '',
      password: '',
      role: '',
      status: 'ACTIVE',
    };
  }

 
}

@Component({
  selector: 'status-mini',
  standalone: true,
  imports: [CommonModule, MatIconModule],
 template: `
    <div
      class="relative flex items-start gap-3 rounded-xl px-4 py-3 max-w-sm
             border shadow-lg backdrop-blur-md"
      [ngClass]="
        data.type === 'success'
          ? 'bg-green-50 border-green-300 text-green-800'
          : 'bg-red-50 border-red-300 text-red-800'
      "
    >
      <!-- Left Accent Bar -->
      <span
        class="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        [ngClass]="
          data.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        "
      ></span>

      <!-- Icon -->
      <mat-icon
        class="mt-0.5 text-lg"
        [ngClass]="
          data.type === 'success' ? 'text-green-600' : 'text-red-600'
        "
      >
        {{ data.type === 'success' ? 'check_circle' : 'error' }}
      </mat-icon>

      <!-- Message -->
      <div class="flex-1 text-sm leading-snug">
        {{ data.message }}
      </div>

      <!-- Close -->
      <button
        (click)="close()"
        class="text-gray-400 hover:text-gray-700 transition"
      >
        <mat-icon class="text-base">close</mat-icon>
      </button>
    </div>
  `,
})
export class StatusModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { type: 'success' | 'error', message: string },
    private dialogRef: MatDialogRef<StatusModalComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}