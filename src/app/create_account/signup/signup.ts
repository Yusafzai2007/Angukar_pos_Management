import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceData } from '../api_service/service-data';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  showPassword = false;

  userlogin = {
    userName: '',
    email: '',
    password: '',
  };

  constructor(private service: ServiceData,private route:Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.userlogin.userName || !this.userlogin.email || !this.userlogin.password) {
      alert('Please fill all fields');
      return;
    }

    this.service.signup(this.userlogin).subscribe({
      next: (res) => {
        console.log('Signup successful', res);
        alert('Signup successful!');
        this.route.navigateByUrl("")
      },
      error: (err) => {
        console.error(err);
        alert('Signup failed');
      },
    });
  }
}
