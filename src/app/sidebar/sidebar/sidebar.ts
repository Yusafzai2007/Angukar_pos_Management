import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CurrentUser, SingleUserResponse } from '../../Typescript/signnup';
import { ServiceData } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  isSidebarOpen = true;
  screenWidth = window.innerWidth;
  isMobileView = false;
  currentUserData: CurrentUser | null = null;
  showConfigure = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth = (event.target as Window).innerWidth;
    this.checkScreen();
  }

  configureItems = [
    { name: 'Product_group', link: '/admin/product_group', icon: 'fas fa-layer-group' },
    { name: 'Add_Product', link: '/admin/add_product', icon: 'fas fa-plus-square' },
    { name: 'Products', link: '/admin/products', icon: 'fas fa-boxes' },
  ];

  constructor(
    private route: Router,
    private service: ServiceData,
  ) {
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

  toggleConfigure() {
    this.showConfigure = !this.showConfigure;
  }

  getInventoryItems() {
    return this.configureItems;
  }

  getConfigureHeight(): string {
    // User Management section (Users) = 40px
    // Inventory Management section (3 items) = 120px
    // Stock Management section (5 items) = 200px
    // Headers and dividers = 120px
    return '480px';
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