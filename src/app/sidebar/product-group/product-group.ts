import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceData } from '../../create_account/api_service/service-data';
import { ItemGroup, ItemGroupResponse, productGroup } from '../../Typescript/product_group';

@Component({
  selector: 'app-product-group',
  imports: [FormsModule, CommonModule],
  templateUrl: './product-group.html',
  styleUrls: ['./product-group.css'],
})
export class ProductGroupComponent implements OnInit {
  // Form data (for creating)
  ProductGroup: productGroup = {
    itemGroupName: '',
    group_description: ''
  };

  // Edit form data
  editProductGroup: ItemGroup = {
    _id: '',
    itemGroupName: '',
    group_description: '',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    __v: 0
  };

  // Variables for modals
  showModal = false;
  showEditModal = false;
  showDeleteModal = false;
  modalMode: 'create' | 'edit' = 'create';
  
  // Delete modal data
  deleteItemId = '';
  deleteItemName = '';
  deleteError = '';

  // Product groups list
  get_product: ItemGroup[] = [];
  filtered_product: ItemGroup[] = [];
  isLoading = false;

  // Filter variables (simplified like Stock Out)
  searchQuery: string = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  isSearchFocused: boolean = false;

  // Table headers
  tableHeaders: string[] = [
    '#',
    'Group Name',
    'Description',
    'Status',
    'Created At',
    'Actions'
  ];

  constructor(private service: ServiceData) {}

  ngOnInit(): void {
    this.getproduct();
  }

  // Helper methods for template
  getActiveGroupsCount(): number {
    return this.get_product.filter(p => p.isActive).length;
  }

  getInactiveGroupsCount(): number {
    return this.get_product.filter(p => !p.isActive).length;
  }

  // Open Create Modal
  openCreateModal() {
    this.modalMode = 'create';
    this.ProductGroup = {
      itemGroupName: '',
      group_description: ''
    };
    this.showModal = true;
  }

  // Open Edit Modal
  openEditModal(product: ItemGroup) {
    this.modalMode = 'edit';
    this.editProductGroup = { ...product };
    this.showEditModal = true;
  }

  // Open Delete Modal
  openDeleteModal(product: ItemGroup) {
    this.deleteItemId = product._id;
    this.deleteItemName = product.itemGroupName;
    this.deleteError = '';
    this.showDeleteModal = true;
  }

  // Close Modals
  closeModal() {
    this.showModal = false;
    this.showEditModal = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteItemId = '';
    this.deleteItemName = '';
    this.deleteError = '';
  }

  // Create Product Group
  onSubmit() {
    if (!this.validateForm(this.ProductGroup)) {
      return;
    }

    this.isLoading = true;
    this.service.create_product_Group(this.ProductGroup).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.statuscode === 201) {
          alert(res.message || 'Product Group created successfully');
          this.getproduct();
          this.showModal = false;
          this.ProductGroup = {
            itemGroupName: '',
            group_description: ''
          };
        } else {
          alert(res.message || 'Failed to create product group');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.handleError(err, 'create');
      },
    });
  }

  // Edit Product Group
  onEditSubmit() {
    if (!this.validateForm(this.editProductGroup)) {
      return;
    }

    this.isLoading = true;
    const updateData: productGroup = {
      itemGroupName: this.editProductGroup.itemGroupName,
      group_description: this.editProductGroup.group_description
    };

    this.service.edit_product_group(this.editProductGroup._id, updateData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.statuscode === 200) {
          alert(res.message || 'Product Group updated successfully');
          this.getproduct();
          this.showEditModal = false;
        } else {
          alert(res.message || 'Failed to update product group');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.handleError(err, 'edit');
      },
    });
  }

  // Delete Product Group
  confirmDelete() {
    if (!this.deleteItemId) {
      this.deleteError = 'No item selected for deletion';
      return;
    }

    this.isLoading = true;
    this.service.delete_product_group(this.deleteItemId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.statuscode === 200 || res.success) {
          alert(res.message || 'Product Group deleted successfully');
          this.getproduct();
          this.closeDeleteModal();
        } else {
          this.deleteError = res.message || 'Failed to delete product group';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.deleteError = err.error?.message || 'Failed to delete product group';
        console.error('Delete error:', err);
      },
    });
  }

  // Get Product Groups
  getproduct() {
    this.isLoading = true;
    this.service.get_product_group().subscribe({
      next: (res: ItemGroupResponse) => {
        this.isLoading = false;
        if (res.success) {
          this.get_product = res.data || [];
          this.applyFilters();
        } else {
          console.error('Failed to fetch product groups:', res.message);
          this.get_product = [];
          this.filtered_product = [];
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching product groups:', err);
        alert('Failed to load product groups. Please try again.');
        this.get_product = [];
        this.filtered_product = [];
      }
    });
  }

  // Apply Filters (simplified like Stock Out)
  applyFilters() {
    let filtered = [...this.get_product];
    
    // Apply search filter (both name and description)
    if (this.searchQuery.trim()) {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.itemGroupName.toLowerCase().includes(searchTerm) ||
        category.group_description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(category => 
        this.statusFilter === 'active' ? category.isActive : !category.isActive
      );
    }
    
    this.filtered_product = filtered;
  }

  // Toggle status filter
  toggleStatusFilter() {
    if (this.statusFilter === 'all') {
      this.statusFilter = 'active';
    } else if (this.statusFilter === 'active') {
      this.statusFilter = 'inactive';
    } else {
      this.statusFilter = 'all';
    }
    this.applyFilters();
  }

  // Clear all filters
  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.isSearchFocused = false;
    this.applyFilters();
  }

  // Form validation
  private validateForm(data: { itemGroupName: string; group_description: string }): boolean {
    if (!data.itemGroupName?.trim()) {
      alert('Please enter Product Group Name');
      return false;
    }
    if (!data.group_description?.trim()) {
      alert('Please enter Description');
      return false;
    }
    return true;
  }

  // Error Handler
  private handleError(err: any, operation: string) {
    console.error(`${operation} error:`, err);
    
    let errorMessage = 'An error occurred';
    
    if (err.error?.message) {
      errorMessage = err.error.message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    switch (err.status) {
      case 400:
        alert(`Bad Request: ${errorMessage}`);
        break;
      case 404:
        alert(`Not Found: ${errorMessage}`);
        break;
      case 409:
        alert(`Conflict: ${errorMessage}`);
        break;
      case 500:
        alert(`Server Error: ${errorMessage}`);
        break;
      default:
        alert(`Error: ${errorMessage}`);
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }
    isFocused: boolean = false;

}