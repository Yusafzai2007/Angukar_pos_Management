import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stockoutservice } from '../../api_service/stockout/stockoutservice';
import {
  StockOutApiResponsedata,
  StockOutItemdata,
} from '../../Typescript/stcokout/stock_out_data';
import { StockOutCategoryDisplay, StockOutCategoryResponse } from '../../Typescript/category/stockout_category';
import { RouterLink } from "@angular/router";

interface TableRow {
  stockOutId: string;
  invoiceNo: string;
  item: any;
  quantity: number;
  totalSale: number;
  category: any;
  date: string;
  stockOutDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockOutItem {
  item: any;
  quantity: number;
}

@Component({
  selector: 'app-fetch-stockout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './fetch-stockout.html',
  styleUrl: './fetch-stockout.css',
})
export class FetchStockout implements OnInit {
  stockoutData: StockOutItemdata[] = [];
  tableRows: TableRow[] = [];
  filteredRows: TableRow[] = [];

  // Search filters - UPDATED with Stock-In like filters
  showFilters = false;
  searchItemName = '';
  searchInvoiceNo = '';
  searchIsActive = ''; // Added: Is Active filter (dropdown)
  searchCategoryId = ''; // Added: Category ID for dropdown
  searchModelSKU = '';
  
  // Category dropdown - ADDED
  showCategoryDropdown = false;
  categorySearch = '';
  
  // Modals
  showItemsModal = false;
  showBarcodeModal = false;
  
  // Selected data for modals
  selectedStockOut: StockOutItemdata | null = null;
  selectedItems: StockOutItem[] = [];
  selectedBarcodes: any[] = [];
  selectedItemName: string = '';

  // Categories - ADDED
  stockOutCategories: StockOutCategoryDisplay[] = [];

  // Table headers - UPDATED
  tableheader: string[] = [
    '#',
    'Item Name(s)', // Changed label
    'Invoice No',
    'Category',
    'Quantity',
    'Total Sale',
    'Status',
    'Stock-Out Date',
    'CreatedAt',
    'UpdatedAt',
    'Actions'
  ];

  // Eye modal headers
  eyemodel: string[] = [
    '#',
    'Item Name',
    'SKU/Model',
    'Group Name',
    'Status',
    'Opening',
    'Remaining',
    'Quantity',
    'Unit',
    'Serial No'
  ];

  constructor(private service: Stockoutservice) {}

  ngOnInit(): void {
    this.fetch_data();
    this.get_stockout_category();
  }

  fetch_data(): void {
    this.service.all_stock_out().subscribe((res: StockOutApiResponsedata) => {
      this.stockoutData = res.message;
      this.processStockOutData();
      this.filteredRows = this.getUniqueTableRows();
      console.log('stockoutData', this.stockoutData);
    });
  }

  processStockOutData(): void {
    this.tableRows = [];

    this.stockoutData.forEach((stockOutItem) => {
      if (stockOutItem.itemId && stockOutItem.itemId.length > 0) {
        stockOutItem.itemId.forEach((item, index) => {
          const quantity =
            stockOutItem.quantity && stockOutItem.quantity[index] !== undefined
              ? stockOutItem.quantity[index]
              : stockOutItem.quantity?.[0] || 1;

          let itemSale = 0;
          if (stockOutItem.itemId.length === 1) {
            itemSale = stockOutItem.Total_sale;
          } else {
            const totalSellingPrice = stockOutItem.itemId.reduce(
              (sum, item) => sum + (item.selling_item_price || 0),
              0,
            );
            if (totalSellingPrice > 0) {
              itemSale = (item.selling_item_price / totalSellingPrice) * stockOutItem.Total_sale;
            } else {
              itemSale = stockOutItem.Total_sale / stockOutItem.itemId.length;
            }
          }

          this.tableRows.push({
            stockOutId: stockOutItem._id,
            invoiceNo: stockOutItem.invoiceNo,
            item: item,
            quantity: quantity,
            totalSale: Math.round(itemSale * 100) / 100,
            category: stockOutItem.stockOutCategoryId,
            date: stockOutItem.date,
            stockOutDate: stockOutItem.stockOutDate,
            isActive: stockOutItem.isActive,
            createdAt: stockOutItem.createdAt,
            updatedAt: stockOutItem.updatedAt || stockOutItem.createdAt,
          });
        });
      }
    });
  }

  // Get unique table rows (one per stock-out record)
  getUniqueTableRows(): TableRow[] {
    const uniqueRows: TableRow[] = [];
    const seenIds = new Set<string>();
    
    this.tableRows.forEach(row => {
      if (!seenIds.has(row.stockOutId)) {
        seenIds.add(row.stockOutId);
        uniqueRows.push(row);
      }
    });
    
    return uniqueRows;
  }

  // Get item display name for a stock-out record
  getItemDisplayName(stockOutId: string): string {
    const stockOut = this.stockoutData.find(item => item._id === stockOutId);
    if (!stockOut?.itemId) return 'N/A';
    
    if (stockOut.itemId.length === 1) {
      // Single item - show item name
      return stockOut.itemId[0].item_Name || 'N/A';
    } else {
      // Multiple items - show count
      return `${stockOut.itemId.length} item(s)`;
    }
  }

  // Get items count for a stock-out record
  getItemsCount(stockOutId: string): number {
    const stockOut = this.stockoutData.find(item => item._id === stockOutId);
    return stockOut?.itemId?.length || 0;
  }

  // Get total quantity for a stock-out record
  getTotalQuantity(stockOutId: string): number {
    const stockOut = this.stockoutData.find(item => item._id === stockOutId);
    if (!stockOut?.quantity) return 0;
    
    if (Array.isArray(stockOut.quantity)) {
      return stockOut.quantity.reduce((sum, qty) => sum + (qty || 0), 0);
    }
    return stockOut.quantity || 0;
  }

  // Open Items Modal
  openItemsModal(stockOutId: string): void {
    const stockOutItem = this.stockoutData.find(item => item._id === stockOutId);
    if (stockOutItem) {
      this.selectedStockOut = stockOutItem;
      
      this.selectedItems = [];
      if (stockOutItem.itemId && stockOutItem.itemId.length > 0) {
        stockOutItem.itemId.forEach((item, index) => {
          const quantity =
            stockOutItem.quantity && stockOutItem.quantity[index] !== undefined
              ? stockOutItem.quantity[index]
              : stockOutItem.quantity?.[0] || 1;
          
          this.selectedItems.push({ item, quantity });
        });
      }
      
      this.showItemsModal = true;
    }
  }

  // Open Barcode Modal
  openBarcodeModal(barcodes: any[], itemName: string): void {
    if (barcodes && barcodes.length > 0) {
      this.selectedBarcodes = barcodes;
      this.selectedItemName = itemName;
      this.showBarcodeModal = true;
    }
  }

  // Close all modals
  closeAllModals(): void {
    this.showItemsModal = false;
    this.showBarcodeModal = false;
    this.selectedStockOut = null;
    this.selectedItems = [];
    this.selectedBarcodes = [];
    this.selectedItemName = '';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // NEW: Toggle category dropdown
  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  // NEW: Handle category search change
  onCategorySearchChange(): void {
    this.showCategoryDropdown = true;
  }

  // NEW: Select category from dropdown
  selectCategory(categoryId: string, categoryName: string): void {
    this.searchCategoryId = categoryId;
    this.showCategoryDropdown = false;
    this.categorySearch = categoryName;
    this.applyFilters();
  }

  // NEW: Clear category selection
  clearCategory(): void {
    this.searchCategoryId = '';
    this.categorySearch = '';
    this.applyFilters();
  }

  // NEW: Get filtered categories for dropdown
  getFilteredCategories(): StockOutCategoryDisplay[] {
    if (!this.categorySearch) {
      return this.stockOutCategories;
    }
    return this.stockOutCategories.filter(category =>
      category.stockoutCategoryName.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  // UPDATED: applyFilters method
  applyFilters(): void {
    const uniqueRows = this.getUniqueTableRows();
    
    this.filteredRows = uniqueRows.filter(row => {
      const stockOut = this.stockoutData.find(item => item._id === row.stockOutId);
      if (!stockOut) return false;
      
      const hasMatchingItem = stockOut.itemId?.some(item => {
        return (
          (!this.searchItemName || 
            item.item_Name?.toLowerCase().includes(this.searchItemName.toLowerCase())) &&
          (!this.searchModelSKU || 
            item.modelNoSKU?.toLowerCase().includes(this.searchModelSKU.toLowerCase()))
        );
      });
      
      // Check active status
      const isActiveMatch = !this.searchIsActive || 
        (this.searchIsActive === 'active' && stockOut.isActive) ||
        (this.searchIsActive === 'inactive' && !stockOut.isActive);
      
      // Check category
      const categoryMatch = !this.searchCategoryId || 
        stockOut.stockOutCategoryId?._id === this.searchCategoryId;
      
      return (
        hasMatchingItem &&
        isActiveMatch &&
        categoryMatch &&
        (!this.searchInvoiceNo || 
          row.invoiceNo?.toLowerCase().includes(this.searchInvoiceNo.toLowerCase()))
      );
    });
  }

  // UPDATED: clearFilters method
  clearFilters(): void {
    this.searchItemName = '';
    this.searchInvoiceNo = '';
    this.searchIsActive = '';
    this.searchCategoryId = '';
    this.categorySearch = '';
    this.searchModelSKU = '';
    this.filteredRows = this.getUniqueTableRows();
  }

  editStockOut(id: string): void {
    console.log('Edit stock-out:', id);
    // Implement edit functionality here
  }

  deleteStockOut(id: string): void {
    if (confirm('Are you sure you want to delete this stock-out record?')) {
      console.log('Delete stock-out:', id);
      // Implement delete functionality here
    }
  }

  // Helper function to format date
  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }



  // Get stock-out categories
  get_stockout_category(): void {
    this.service.get_stockOut_category().subscribe((res: StockOutCategoryResponse) => {
      this.stockOutCategories = res.data;
      console.log('Stock-Out Categories:', this.stockOutCategories);
    });
  }
}