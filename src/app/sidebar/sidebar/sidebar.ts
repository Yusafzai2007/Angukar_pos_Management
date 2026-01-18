import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CurrentUser, SingleUserResponse } from '../../Typescript/signnup';
import { ServiceData } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  isSidebarOpen = true;
  screenWidth = window.innerWidth;
  isMobileView = false;
  currentUserData: CurrentUser | null = null;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth = (event.target as Window).innerWidth;
    this.checkScreen();
  }

  constructor(private route: Router, private service: ServiceData) {
    this.checkScreen();
  }

  checkScreen() {
    this.isMobileView = this.screenWidth < 1024;
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  get shouldShowSidebar() {
    return this.isSidebarOpen;
  }

  ngOnInit(): void {
    this.fetchCurrentUser();
  }

  fetchCurrentUser() {
    this.service.currentuser().subscribe((res: SingleUserResponse) => {
      this.currentUserData = res.message.users;
    });
  }

  logout() {
    this.service.logout().subscribe({
      next: () => {
        alert('Logout successfully!');
        this.route.navigateByUrl('');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
