import { Component } from '@angular/core';
import { ServiceData } from '../../create_account/api_service/service-data';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-users',
  imports: [CommonModule,FormsModule],
  templateUrl: './add-users.html',
  styleUrl: './add-users.css',
})
export class AddUsers {
  showPassword = false;
  isModalOpen = false; // <-- modal state

  userlogin = {
    userName: '',
    email: '',
    password: '',
    role: ''
  };

  constructor(private service: ServiceData, private route: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.userlogin.userName || !this.userlogin.email || !this.userlogin.password || !this.userlogin.role) {
      alert('Please fill all fields');
      return;
    }

    this.service.signup(this.userlogin).subscribe({
      next: (res) => {
        console.log('Signup successful', res);
        alert('Signup successful!');
        this.closeModal(); // <-- close modal after signup
      },
      error: (err) => {
        console.error(err);
        alert('Signup failed');
      }
    });
  }
}

