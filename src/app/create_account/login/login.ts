import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceData } from '../api_service/service-data';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  showPassword: boolean = false;

  userLogin = {
    email: 'ali@gmail.com',
    password: '123',
  };

  constructor(private service: ServiceData, private route: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.userLogin.email || !this.userLogin.password) {
      alert('Please fill in both email and password fields.');
      return;
    }

    this.service.login(this.userLogin).subscribe({
      next: (res) => {
        // console.log('Login successful', res);
        // alert('Login successful!');
        this.route.navigateByUrl('admin');
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);

        // ✅ Status code based messages
        switch (err.status) {
          case 400:
            alert('Please fill in all required fields.');
            break;
          case 404:
            alert('User not found or password incorrect.');
            break;
          case 500:
            alert('Server error, please try again later.');
            break;
          case 0:
            alert('Cannot connect to server. Check backend or CORS.');
            break;
          default:
            alert(`Login failed. Status code: ${err.status}`);
        }
      },
    });
  }
}
