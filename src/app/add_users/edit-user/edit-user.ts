import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServiceData } from '../../create_account/api_service/service-data';
import { singleUserMessage, updateuserdata } from '../../Typescript/singleuser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { StatusModalComponent } from '../add-user-form/add-user-form';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './edit-user.html',
  styleUrls: ['./edit-user.css'],
})
export class EditUser implements OnInit {
  singledata: singleUserMessage | null = null;
  userId: string = '';
  isLoading = false;
  isSubmitting = false;

  // Form model - using lowercase for display
  editForm = {
    userName: '',
    email: '',
    role: '',
    status: 'active' as 'active' | 'inactive',
  };

  constructor(
    private service: ServiceData,
    private active: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.userId = this.active.snapshot.paramMap.get('id') || '';
    
    if (this.userId) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    this.isLoading = true;
    this.service.singleuser(this.userId).subscribe({
      next: (res) => {
        if (res.success && res.message) {
          this.singledata = res.message;
          // Populate form with existing data
          this.populateForm(this.singledata);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching single user:', error);
        this.openModal('error', 'Failed to load user data');
        this.isLoading = false;
      },
    });
  }

  populateForm(userData: singleUserMessage): void {
    this.editForm = {
      userName: userData.userName || '',
      email: userData.email || '',
      role: userData.role || '',
      status: userData.status,
    };
  }

  setStatus(value: 'active' | 'inactive'): void {
    this.editForm.status = value;
  }

  submitForm(): void {
    if (!this.validateForm()) {
      this.openModal('error', 'Please fill all required fields');
      return;
    }

    if (!this.userId) {
      this.openModal('error', 'User ID is missing');
      return;
    }

    this.isSubmitting = true;

    // Prepare update data - status is already in correct format
    const updateData: updateuserdata = {
      userName: this.editForm.userName,
      email: this.editForm.email,
      role: this.editForm.role,
      status: this.editForm.status, // Already 'active' | 'inactive'
    };

    console.log('Sending update data:', updateData);

    this.service.update_user(this.userId, updateData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        
        if (res.status === 200 || res.success) {
          this.openModal('success', 'User updated successfully!');
          // Refresh user data
          this.loadUserData();
        } else {
          this.openModal('error', res.message || 'Something went wrong');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Update error details:', err);
        this.openModal('error', err.error?.message || 'Failed to update user');
      },
    });
  }

  validateForm(): boolean {
    return !!(
      this.editForm.userName &&
      this.editForm.email &&
      this.editForm.role
    );
  }

  openModal(type: 'success' | 'error', message: string): void {
    // Make sure you have imported StatusModalComponent or adjust this accordingly
    this.dialog.open(StatusModalComponent, {
      width: '400px',
      data: { type, message },
      position: { right: '20px', top: '20px' },
      panelClass: 'custom-dialog-container',
    });
  }
}