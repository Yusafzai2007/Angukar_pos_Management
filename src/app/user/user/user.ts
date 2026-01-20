import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllUsersResponse, userdata } from '../../Typescript/user/user';
import { ServiceData } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule],
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
      }
    });
  }

  // Toggle filter section
  toggleFilterSection() {
    this.showFilterSection = !this.showFilterSection;
    if (!this.showFilterSection) {
      this.clearFilters();
    }
  }

  // Apply filters
  applyFilters() {
    let filtered = [...this.userdata];
    
    // Filter by name
    if (this.filterName.trim()) {
      const searchTerm = this.filterName.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.userName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by email
    if (this.filterEmail.trim()) {
      const searchTerm = this.filterEmail.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by role
    if (this.filterRole !== 'all') {
      filtered = filtered.filter(user => 
        user.role === this.filterRole
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

      // frontend se bhi remove karo
      this.userdata = this.userdata.filter(u => u._id !== userId);
      this.filteredUsers = this.filteredUsers.filter(u => u._id !== userId);

      alert(`User "${this.deleteUser?.userName}" deleted successfully`);
      this.closeDeleteModal();
    },
    error: (err) => {
      console.error('Delete failed', err);
      alert('Failed to delete user');
    }
  });
}


  // Format date
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }

  // Get role badge class - Updated to black/gray theme
  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-black text-white shadow';
      case 'user':
        return 'bg-gray-800 text-white shadow';
      default:
        return 'bg-gray-600 text-white shadow';
    }
  }

  // Get role icon
  getRoleIcon(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>`;
      case 'user':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>`;
      default:
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
    }
  }
}