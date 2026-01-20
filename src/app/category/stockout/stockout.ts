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
  showFilterSection: boolean = false;
  
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
  
  // Delete modal data
  deleteItemId: string = '';
  deleteItemName: string = '';
  deleteError: string = '';
  
  // Filter variables
  filterName: string = '';
  filterDescription: string = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  filterDateFrom: string = '';
  filterDateTo: string = '';
  
  constructor(
    private http: HttpClient,
    private stockoutService: ServiceData
  ) {}
  
  ngOnInit() {
    this.fetchStockOutCategories();
  }
  
  // Toggle filter section visibility
  toggleFilterSection() {
    this.showFilterSection = !this.showFilterSection;
    if (!this.showFilterSection) {
      // Clear filters when hiding the section
      this.clearFilters();
    }
  }
  
  // Fetch all stock out categories
  fetchStockOutCategories() {
    this.isLoading = true;
    this.stockoutService.get_stockout_category().subscribe({
      next: (response: StockOutCategoryResponse) => {
        if (response && response.data) {
          this.stockOutCategories = response.data;
          this.filteredCategories = [...response.data];
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
  
  // Apply filters
  applyFilters() {
    let filtered = [...this.stockOutCategories];
    
    // Filter by name
    if (this.filterName.trim()) {
      const searchTerm = this.filterName.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.stockoutCategoryName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by description
    if (this.filterDescription.trim()) {
      const searchTerm = this.filterDescription.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.stockout_category_description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(category => 
        this.filterStatus === 'active' ? category.isActive : !category.isActive
      );
    }
    
    // Filter by date range
    if (this.filterDateFrom) {
      const fromDate = new Date(this.filterDateFrom);
      filtered = filtered.filter(category => {
        const categoryDate = new Date(category.createdAt);
        return categoryDate >= fromDate;
      });
    }
    
    if (this.filterDateTo) {
      const toDate = new Date(this.filterDateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(category => {
        const categoryDate = new Date(category.createdAt);
        return categoryDate <= toDate;
      });
    }
    
    this.filteredCategories = filtered;
  }
  
  // Clear filters
  clearFilters() {
    this.filterName = '';
    this.filterDescription = '';
    this.filterStatus = 'all';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filteredCategories = [...this.stockOutCategories];
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
  
  // Get today's date for date filter max value
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
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
  
  // Get active categories count
  getActiveCategoriesCount() {
    return this.stockOutCategories.filter(category => category.isActive).length;
  }
  
  // Get inactive categories count
  getInactiveCategoriesCount() {
    return this.stockOutCategories.filter(category => !category.isActive).length;
  }
  
  // Debug method
  debugData() {
    console.log('=== DEBUG STOCK OUT DATA ===');
    console.log('Stock Out Categories:', this.stockOutCategories);
    console.log('Create Form Data:', this.stockOutCategory);
    console.log('Edit Form Data:', this.editStockOutCategory);
    console.log('============================');
  }
  
  // 测试 API 连接
  testApiConnection() {
    console.log('Testing API connection...');
    this.http.get(`${this.stockoutService.apiUrl}/get_stockOut_categories`).subscribe({
      next: (response) => {
        console.log('API connection successful:', response);
      },
      error: (error) => {
        console.error('API connection failed:', error);
      }
    });
  }
}