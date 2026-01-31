// stockout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ServiceData } from '../../create_account/api_service/service-data';
import { StockOutCategoryDisplay, StockOutCategoryRequest, StockOutCategoryResponse } from '../../Typescript/category/stockout_category';

@Component({
  selector: 'app-stockout',
  imports: [CommonModule, FormsModule],
  templateUrl: './stockout.html',
  styleUrl: './stockout.css',
})
export class StockoutComponent implements OnInit {
  // State variables
  isLoading: boolean = false;
  showModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  
  // Data arrays
  stockOutCategories: StockOutCategoryDisplay[] = [];
  filteredCategories: StockOutCategoryDisplay[] = [];
  
  // Form models
  stockOutCategory: StockOutCategoryRequest = {
    stockoutCategoryName: '',
    stockout_category_description: ''
  };
  
  editStockOutCategory: StockOutCategoryDisplay = {
    _id: '',
    stockoutCategoryName: '',
    stockout_category_description: '',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    __v: 0,
    id: ''
  };
  clearFilter() {
  this.searchQuery = '';
  this.applySearch();
}

  
  // Delete modal data
  deleteItemId: string = '';
  deleteItemName: string = '';
  deleteError: string = '';
  
  // Filter variables - Simplified
  searchQuery: string = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  
  constructor(
    private http: HttpClient,
    private stockoutService: ServiceData
  ) {}
  
  ngOnInit() {
    this.fetchStockOutCategories();
  }
  
  // Fetch all stock out categories
  fetchStockOutCategories() {
    this.isLoading = true;
    this.stockoutService.get_stockout_category().subscribe({
      next: (response: StockOutCategoryResponse) => {
        if (response && response.data) {
          this.stockOutCategories = response.data;
          this.applyFilters();
          console.log('Fetched categories:', this.stockOutCategories);
        } else {
          this.stockOutCategories = [];
          this.filteredCategories = [];
          console.log('No data received');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching stock out categories:', error);
        this.isLoading = false;
        alert('Failed to load categories. Please try again.');
      }
    });
  }
  
  // Apply combined search and status filter
  applyFilters() {
    let filtered = [...this.stockOutCategories];
    
    // Apply search filter (both name and description)
    if (this.searchQuery.trim()) {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.stockoutCategoryName.toLowerCase().includes(searchTerm) ||
        category.stockout_category_description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(category => 
        this.statusFilter === 'active' ? category.isActive : !category.isActive
      );
    }
    
    this.filteredCategories = filtered;
  }
  
  // Apply search when typing
  applySearch() {
    this.applyFilters();
  }
  isFocused: boolean = false;

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
    this.applyFilters();
  }
  
  // Open create modal
  openCreateModal() {
    this.modalMode = 'create';
    this.stockOutCategory = {
      stockoutCategoryName: '',
      stockout_category_description: ''
    };
    this.showModal = true;
  }
  
  // Open edit modal
  openEditModal(category: StockOutCategoryDisplay) {
    this.modalMode = 'edit';
    this.editStockOutCategory = {
      _id: category._id,
      stockoutCategoryName: category.stockoutCategoryName,
      stockout_category_description: category.stockout_category_description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      __v: category.__v,
      id: category.id
    };
    this.showEditModal = true;
  }
  
  // Submit create form
  onSubmit() {
    // Validation
    if (!this.stockOutCategory.stockoutCategoryName.trim()) {
      alert('Please enter category name');
      return;
    }
    
    if (!this.stockOutCategory.stockout_category_description.trim()) {
      alert('Please enter description');
      return;
    }
    
    this.isLoading = true;
    console.log('Sending create data:', this.stockOutCategory);
    
    this.stockoutService.create_stockout_category(this.stockOutCategory).subscribe({
      next: (response: any) => {
        console.log('Create response:', response);
        this.closeModal();
        this.fetchStockOutCategories();
        alert(response.message || 'Stock Out Category created successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating stock out category:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to create category';
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }
  
  // Submit edit form
  onEditSubmit() {
    // Validation
    if (!this.editStockOutCategory.stockoutCategoryName.trim()) {
      alert('Please enter category name');
      return;
    }
    
    if (!this.editStockOutCategory.stockout_category_description.trim()) {
      alert('Please enter description');
      return;
    }
    
    this.isLoading = true;
    
    // Prepare update data
    const updateData = {
      stockoutCategoryName: this.editStockOutCategory.stockoutCategoryName,
      stockout_category_description: this.editStockOutCategory.stockout_category_description,
      isActive: this.editStockOutCategory.isActive
    };
    
    console.log('Updating with data:', updateData);
    console.log('Category ID:', this.editStockOutCategory._id);
    
    this.stockoutService.edit_stockout_category(this.editStockOutCategory._id, updateData).subscribe({
      next: (response: any) => {
        console.log('Update response:', response);
        this.closeModal();
        this.fetchStockOutCategories();
        alert(response.message || 'Stock Out Category updated successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating stock out category:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to update category';
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }
  
  // Open delete modal
  openDeleteModal(category: StockOutCategoryDisplay) {
    this.deleteItemId = category._id;
    this.deleteItemName = category.stockoutCategoryName;
    this.deleteError = '';
    this.showDeleteModal = true;
  }
  
  // Confirm delete
  confirmDelete() {
    this.isLoading = true;
    console.log('Deleting category with ID:', this.deleteItemId);
    
    this.stockoutService.delete_stockout_category(this.deleteItemId).subscribe({
      next: (response: any) => {
        console.log('Delete response:', response);
        this.closeDeleteModal();
        this.fetchStockOutCategories();
        alert(response.message || 'Stock Out Category deleted successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting stock out category:', error);
        this.deleteError = error.error?.message || error.message || 'Failed to delete category';
        this.isLoading = false;
      }
    });
  }
  
  // Close modals
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
  
  // Format date
  formatDate(dateString: string) {
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
  
  // Debug method
  debugData() {
    console.log('=== DEBUG STOCK OUT DATA ===');
    console.log('Stock Out Categories:', this.stockOutCategories);
    console.log('Create Form Data:', this.stockOutCategory);
    console.log('Edit Form Data:', this.editStockOutCategory);
    console.log('============================');
  }
  
  // Table headers
  tableheader:string[] = [
    '#',
    'Category Name',
    'Description',
    'Status',
    'Created At',
    'Actions',
  ]
}