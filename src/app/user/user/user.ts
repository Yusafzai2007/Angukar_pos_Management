import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllUsersResponse, userdata } from '../../Typescript/user/user';
import { ServiceData } from '../../create_account/api_service/service-data';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit {
  constructor(private service: ServiceData) {}

  ngOnInit(): void {
    this.get_users();
  }

  // Data variables
  userdata: userdata[] = [];
  filteredUsers: userdata[] = [];

  // Filter variables
  filterName: string = '';
  filterEmail: string = '';
  filterRole: string = 'all';
  filterStatus: string = 'all';

  // Loading state
  isLoading: boolean = false;

  // Delete modal variables
  showDeleteModal: boolean = false;
  deleteUser: userdata | null = null;

  // Filter section visibility
  showFilterSection: boolean = false;

  get_users() {
    this.isLoading = true;
    this.service.get_user().subscribe({
      next: (res: AllUsersResponse) => {
        this.userdata = res.message || [];
        this.filteredUsers = [...this.userdata];
        console.log('Users data:', this.userdata);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
        // Optional: Show error message to user
      },
    });
  }

  // Toggle filter section
  toggleFilterSection() {
    this.showFilterSection = !this.showFilterSection;
    if (!this.showFilterSection) {
      this.clearFilters();
    }
  }

  applyFilters() {
    let filtered = [...this.userdata];

    // Filter by name
    if (this.filterName?.trim()) {
      const searchTerm = this.filterName.toLowerCase().trim();
      filtered = filtered.filter(
        (user) => user.userName?.toLowerCase().includes(searchTerm) || false,
      );
    }

    // Filter by email
    if (this.filterEmail?.trim()) {
      const searchTerm = this.filterEmail.toLowerCase().trim();
      filtered = filtered.filter((user) => user.email?.toLowerCase().includes(searchTerm) || false);
    }

    // Filter by role
    if (this.filterRole && this.filterRole !== 'all') {
      filtered = filtered.filter(
        (user) => user.role?.toLowerCase() === this.filterRole.toLowerCase(),
      );
    }

    // Filter by status (active/inactive)
    if (this.filterStatus && this.filterStatus !== 'all') {
      filtered = filtered.filter(
        (user) => user.status?.toLowerCase() === this.filterStatus.toLowerCase(),
      );
    }

    this.filteredUsers = filtered;
  }

  // Clear filters
  clearFilters() {
    this.filterName = '';
    this.filterEmail = '';
    this.filterRole = 'all';
    this.filteredUsers = [...this.userdata];
  }

  // Open delete confirmation modal
  openDeleteModal(user: userdata) {
    this.deleteUser = user;
    this.showDeleteModal = true;
  }

  // Close delete confirmation modal
  closeDeleteModal() {
    this.deleteUser = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.deleteUser) return;

    const userId = this.deleteUser._id;

    console.log('User to delete:', userId);

    this.service.deleteuser(userId).subscribe({
      next: (res) => {
        console.log('Delete response:', res);

        // Remove from frontend
        this.userdata = this.userdata.filter((u) => u._id !== userId);
        this.filteredUsers = this.filteredUsers.filter((u) => u._id !== userId);

        alert(`User "${this.deleteUser?.userName}" deleted successfully`);
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete user');
      },
    });
  }

  // Get role badge class
  getRoleBadgeClass(role: string): string {
    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'admin':
        return 'bg-blue-600 text-white';
      case 'manager':
        return 'bg-purple-600 text-white';
      case 'cashier':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-200 text-black';
    }
  }

  // Get role icon
  getRoleIcon(role: string): string {
    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'admin':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>`;
      case 'manager':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>`;
      case 'cashier':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>`;
      default:
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>`;
    }
  }

  tableheader: string[] = ['#', 'UserName', 'Email', 'Role', 'Status', 'Created At', 'Actions'];
}
