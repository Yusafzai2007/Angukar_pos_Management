import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceData } from '../../create_account/api_service/service-data';
import { StockInCategory, StockInCategoryResponse } from '../../Typescript/category/stockIn';

@Component({
  selector: 'app-stock-in',
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-in.html',
  styleUrl: './stock-in.css',
})
export class StockInComponent implements OnInit {
  // State variables
  isLoading: boolean = false;
  showModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  showFilterSection: boolean = false;
  
  // Data arrays
  stockInCategories: StockInCategory[] = [];
  filteredCategories: StockInCategory[] = [];
  
  // Form models
  stockInCategory = {
    stockInCategoryName: '',
    category_description: ''
  };
  
  editStockInCategory: StockInCategory = {
    _id: '',
    stockInCategoryName: '',
    category_description: '',
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
  
  constructor(private stockInService: ServiceData) {}
  
  ngOnInit() {
    this.fetchStockInCategories();
  }
  
  // Toggle filter section visibility
  toggleFilterSection() {
    this.showFilterSection = !this.showFilterSection;
    if (!this.showFilterSection) {
      // Clear filters when hiding the section
      this.clearFilters();
    }
  }
  
  // Fetch all stock in categories
  fetchStockInCategories() {
    this.isLoading = true;
    this.stockInService.get_stockIn_category().subscribe({
      next: (response: StockInCategoryResponse) => {
        if (response && response.data) {
          this.stockInCategories = response.data;
          this.filteredCategories = [...response.data];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching stock in categories:', error);
        this.isLoading = false;
      }
    });
  }
  
  // Apply filters
  applyFilters() {
    let filtered = [...this.stockInCategories];
    
    // Filter by name
    if (this.filterName.trim()) {
      const searchTerm = this.filterName.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.stockInCategoryName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by description
    if (this.filterDescription.trim()) {
      const searchTerm = this.filterDescription.toLowerCase().trim();
      filtered = filtered.filter(category => 
        category.category_description?.toLowerCase().includes(searchTerm)
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
    this.filteredCategories = [...this.stockInCategories];
  }
  
  // Open create modal
  openCreateModal() {
    this.modalMode = 'create';
    this.stockInCategory = {
      stockInCategoryName: '',
      category_description: ''
    };
    this.showModal = true;
  }
  
  // Open edit modal
  openEditModal(category: StockInCategory) {
    this.modalMode = 'edit';
    this.editStockInCategory = {
      _id: category._id,
      stockInCategoryName: category.stockInCategoryName,
      category_description: category.category_description,
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
    if (!this.stockInCategory.stockInCategoryName || !this.stockInCategory.category_description) {
      alert('Please fill all required fields');
      return;
    }
    
    this.isLoading = true;
    
    // Format data to match backend expectations
    const formattedData = {
      categoryName: this.stockInCategory.stockInCategoryName,
      description: this.stockInCategory.category_description
    };
    
    this.stockInService.create_stockIn_category(formattedData).subscribe({
      next: (response: any) => {
        this.closeModal();
        this.fetchStockInCategories();
        alert('Stock In Category created successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating stock in category:', error);
        alert(error.error?.message || 'Failed to create category');
        this.isLoading = false;
      }
    });
  }
  
  // Submit edit form
  onEditSubmit() {
    if (!this.editStockInCategory.stockInCategoryName || !this.editStockInCategory.category_description) {
      alert('Please fill all required fields');
      return;
    }
    
    this.isLoading = true;
    
    // Prepare update data - match backend expectations
    const updateData = {
      categoryName: this.editStockInCategory.stockInCategoryName,
      description: this.editStockInCategory.category_description,
      isActive: this.editStockInCategory.isActive
    };
    
    this.stockInService.edit_stockIn_category(this.editStockInCategory._id, updateData).subscribe({
      next: (response: any) => {
        this.closeModal();
        this.fetchStockInCategories();
        alert('Stock In Category updated successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating stock in category:', error);
        alert(error.error?.message || 'Failed to update category');
        this.isLoading = false;
      }
    });
  }
  
  // Open delete modal
  openDeleteModal(category: StockInCategory) {
    this.deleteItemId = category._id;
    this.deleteItemName = category.stockInCategoryName;
    this.deleteError = '';
    this.showDeleteModal = true;
  }
  
  // Confirm delete
  confirmDelete() {
    this.isLoading = true;
    this.stockInService.delete_stockIn_category(this.deleteItemId).subscribe({
      next: (response: any) => {
        this.closeDeleteModal();
        this.fetchStockInCategories();
        alert('Stock In Category deleted successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting stock in category:', error);
        this.deleteError = error.error?.message || 'Failed to delete category';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Get active categories count
  getActiveCategoriesCount() {
    return this.stockInCategories.filter(category => category.isActive).length;
  }
  
  // Get inactive categories count
  getInactiveCategoriesCount() {
    return this.stockInCategories.filter(category => !category.isActive).length;
  }
}