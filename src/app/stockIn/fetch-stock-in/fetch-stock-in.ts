import { Component, OnInit } from '@angular/core';
import {
  Barcode,
  Item,
  ItemGroup,
  StockIn,
  StockInCategory,
  StockInResponse,
} from '../../Typescript/stockin/stockin';
import { StockInStockInService } from '../../api_service/stock-in';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockInCategoryResponse } from '../../Typescript/category/stockIn';
import { RouterLink } from '@angular/router';

interface TableRow {
  stockInId: string;
  invoiceNo: string;
  item: Item;
  stockAdded: number;
  stockPrice: number;
  category: StockInCategory;
  date: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockInItem {
  item: Item;
  stockAdded: number;
}

@Component({
  selector: 'app-fetch-stock-in',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './fetch-stock-in.html',
  styleUrls: ['./fetch-stock-in.css'],
})
export class FetchStockIn implements OnInit {
  stockindata: StockIn[] = [];
  tableRows: TableRow[] = [];
  filteredRows: TableRow[] = [];

  // Search filters - UPDATED
  showFilters = false;
  searchItemName = '';
  searchNotes = ''; // Added: Notes filter
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
  selectedStockIn: StockIn | null = null;
  selectedItems: StockInItem[] = [];
  selectedBarcodes: Barcode[] = [];
  selectedItemName: string = '';

  // Categories - ADDED
  stockInCategories: StockInCategory[] = [];

  // Table headers - UPDATED
  tableheader: string[] = [
    '#',
    'Item Name(s)', // Changed label
    'Invoice No',
    'Stock In Category',
    'Notes',

    'Stock Added',
    'Stock Price',
    'Is Active', // Changed from 'Group Name' to 'Is Active'
    'Stock-In Date',
    'CreatedAt',
    'UpdatedAt',
    'Actions',
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
    'Added Qty',
    'Unit',
    'Serial No',
  ];

  constructor(private service: StockInStockInService) {}

  ngOnInit(): void {
    this.fetch_data();
    this.get_stockIn_category();
  }

  fetch_data(): void {
    this.service.get_stockIn().subscribe((res: StockInResponse) => {
      this.stockindata = res.message;
      this.processStockInData();
      this.filteredRows = this.getUniqueTableRows();
      console.log('tableRows', this.tableRows);
    });
  }

  processStockInData(): void {
    this.tableRows = [];

    this.stockindata.forEach((stockItem) => {
      if (stockItem.itemId && stockItem.itemId.length > 0) {
        stockItem.itemId.forEach((item, index) => {
          const stockAdded =
            stockItem.stockAdded && stockItem.stockAdded[index] !== undefined
              ? stockItem.stockAdded[index]
              : stockItem.stockAdded?.[0] || 1;

          let itemPrice = 0;
          if (stockItem.itemId.length === 1) {
            itemPrice = stockItem.stcokIn_price;
          } else {
            const totalActualPrice = stockItem.itemId.reduce(
              (sum, item) => sum + (item.actual_item_price || 0),
              0,
            );
            if (totalActualPrice > 0) {
              itemPrice = (item.actual_item_price / totalActualPrice) * stockItem.stcokIn_price;
            } else {
              itemPrice = stockItem.stcokIn_price / stockItem.itemId.length;
            }
          }

          this.tableRows.push({
            stockInId: stockItem._id,
            invoiceNo: stockItem.invoiceNo,
            item: item,
            stockAdded: stockAdded,
            stockPrice: Math.round(itemPrice * 100) / 100,
            category: stockItem.stockInCategoryId,
            date: stockItem.stockInDate,
            notes: stockItem.notes,
            isActive: stockItem.isActive,
            createdAt: stockItem.createdAt,
            updatedAt: stockItem.updatedAt,
          });
        });
      }
    });
  }

  // Get unique table rows (one per stock-in record)
  getUniqueTableRows(): TableRow[] {
    const uniqueRows: TableRow[] = [];
    const seenIds = new Set<string>();

    this.tableRows.forEach((row) => {
      if (!seenIds.has(row.stockInId)) {
        seenIds.add(row.stockInId);
        uniqueRows.push(row);
      }
    });

    return uniqueRows;
  }

  // NEW: Get item display name for a stock-in record
  getItemDisplayName(stockInId: string): string {
    const stockIn = this.stockindata.find((item) => item._id === stockInId);
    if (!stockIn?.itemId) return 'N/A';

    if (stockIn.itemId.length === 1) {
      // Single item - show item name
      return stockIn.itemId[0].item_Name || 'N/A';
    } else {
      // Multiple items - show count
      return `${stockIn.itemId.length} item(s)`;
    }
  }

  // Get items count for a stock-in record
  getItemsCount(stockInId: string): number {
    const stockIn = this.stockindata.find((item) => item._id === stockInId);
    return stockIn?.itemId?.length || 0;
  }

  // Get active status for display
  getActiveStatus(stockInId: string): string {
    const stockIn = this.stockindata.find((item) => item._id === stockInId);
    return stockIn?.isActive ? 'Active' : 'Inactive';
  }

  // Get total stock added for a stock-in record
  getTotalStockAdded(stockInId: string): number {
    const stockIn = this.stockindata.find((item) => item._id === stockInId);
    if (!stockIn?.stockAdded) return 0;

    return stockIn.stockAdded.reduce((sum, added) => sum + (added || 0), 0);
  }

  // Open Items Modal
  openItemsModal(stockInId: string): void {
    const stockInItem = this.stockindata.find((item) => item._id === stockInId);
    if (stockInItem) {
      this.selectedStockIn = stockInItem;

      this.selectedItems = [];
      if (stockInItem.itemId && stockInItem.itemId.length > 0) {
        stockInItem.itemId.forEach((item, index) => {
          const stockAdded =
            stockInItem.stockAdded && stockInItem.stockAdded[index] !== undefined
              ? stockInItem.stockAdded[index]
              : stockInItem.stockAdded?.[0] || 1;

          this.selectedItems.push({ item, stockAdded });
        });
      }

      this.showItemsModal = true;
    }
  }

  // Open Barcode Modal
  openBarcodeModal(barcodes: Barcode[], itemName: string): void {
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
    this.selectedStockIn = null;
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
  getFilteredCategories(): StockInCategory[] {
    if (!this.categorySearch) {
      return this.stockInCategories;
    }
    return this.stockInCategories.filter((category) =>
      category.stockInCategoryName.toLowerCase().includes(this.categorySearch.toLowerCase()),
    );
  }

  // UPDATED: applyFilters method
  applyFilters(): void {
    const uniqueRows = this.getUniqueTableRows();

    this.filteredRows = uniqueRows.filter((row) => {
      const stockIn = this.stockindata.find((item) => item._id === row.stockInId);
      if (!stockIn) return false;

      const hasMatchingItem = stockIn.itemId?.some((item) => {
        return (
          (!this.searchItemName ||
            item.item_Name?.toLowerCase().includes(this.searchItemName.toLowerCase())) &&
          (!this.searchModelSKU ||
            item.modelNoSKU?.toLowerCase().includes(this.searchModelSKU.toLowerCase()))
        );
      });

      // Check active status
      const isActiveMatch =
        !this.searchIsActive ||
        (this.searchIsActive === 'active' && stockIn.isActive) ||
        (this.searchIsActive === 'inactive' && !stockIn.isActive);

      // Check category
      const categoryMatch =
        !this.searchCategoryId || stockIn.stockInCategoryId?._id === this.searchCategoryId;

      return (
        hasMatchingItem &&
        isActiveMatch &&
        categoryMatch &&
        (!this.searchInvoiceNo ||
          row.invoiceNo?.toLowerCase().includes(this.searchInvoiceNo.toLowerCase())) &&
        (!this.searchNotes || row.notes?.toLowerCase().includes(this.searchNotes.toLowerCase()))
      );
    });
  }

  // UPDATED: clearFilters method
  clearFilters(): void {
    this.searchItemName = '';
    this.searchNotes = '';
    this.searchInvoiceNo = '';
    this.searchIsActive = '';
    this.searchCategoryId = '';
    this.categorySearch = '';
    this.searchModelSKU = '';
    this.filteredRows = this.getUniqueTableRows();
  }

  editStockIn(id: string): void {
    console.log('Edit stock-in:', id);
  }

deleteStockIn(id: string): void {
  if (confirm('Are you sure you want to delete this stock-in record?')) {
    this.service.delete_stockIn(id).subscribe({
      next: (res) => {
        console.log(res, "Deleted successfully!");
        alert("Stock-in deleted successfully!");

        // 🔹 Remove from stockindata
        this.stockindata = this.stockindata.filter(stock => stock._id !== id);

        // 🔹 Re-process tableRows after deletion
        this.processStockInData();

        // 🔹 Re-apply filters if any
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
        alert("An error occurred while deleting.");
      }
    });
  }
}



  // Helper function to format date
  formatDate(dateString: string): string {
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

  // Get barcode status text
  getBarcodeStatus(barcode: Barcode): string {
    if (barcode.stockoutId) return 'Used';
    return 'Available';
  }

  // Get barcode status color
  getBarcodeStatusColor(barcode: Barcode): string {
    if (barcode.stockoutId) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  }

  // Print stock-in items report
  printStockInItems(): void {
    if (!this.selectedStockIn) return;

    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 10px;">Stock-In Items Report</h2>
        <h3 style="text-align: center; margin-bottom: 20px; color: #666;">Stock-In #${this.selectedStockIn._id}</h3>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div>
              <strong>Invoice No:</strong> ${this.selectedStockIn.invoiceNo || 'N/A'}
            </div>
            <div>
              <strong>Stock-In Date:</strong> ${this.formatDate(this.selectedStockIn.stockInDate)}
            </div>
            <div>
              <strong>Total Price:</strong> $${this.selectedStockIn.stcokIn_price}
            </div>
            <div>
              <strong>Category:</strong> ${this.selectedStockIn.stockInCategoryId?.stockInCategoryName || 'N/A'}
            </div>
            <div>
              <strong>Notes:</strong> ${this.selectedStockIn.notes || 'No notes'}
            </div>
            <div>
              <strong>Total Items:</strong> ${this.selectedItems.length}
            </div>
          </div>
        </div>
        
        <h4 style="margin-bottom: 10px;">Items List (${this.selectedItems.length} items)</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">SKU/Model</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Opening</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Remaining</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Added Qty</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unit</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Serial No</th>
            </tr>
          </thead>
          <tbody>
            ${this.selectedItems
              .map(
                (itemData, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${itemData.item.item_Name || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${itemData.item.modelNoSKU || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <span style="padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; 
                    ${itemData.item.isActive ? 'background-color: #d1fae5; color: #065f46;' : 'background-color: #fee2e2; color: #991b1b;'}">
                    ${itemData.item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${itemData.item.openingStock || 0}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${itemData.item.remainingStock || 0}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${itemData.stockAdded || 0}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${itemData.item.unit || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  ${itemData.item.serialNo ? 'Yes' : 'No'}
                </td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
          <p>Report generated on: ${new Date().toLocaleString()}</p>
          <p>Created: ${this.formatDate(this.selectedStockIn.createdAt)} | Updated: ${this.formatDate(this.selectedStockIn.updatedAt)}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Stock-In Items Report - ${this.selectedStockIn._id}</title>
            <style>
              @media print {
                @page { margin: 0.5in; }
                body { margin: 0; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  // Get stock-in categories
  get_stockIn_category() {
    this.service.get_stockIn_category().subscribe((res: StockInCategoryResponse) => {
      this.stockInCategories = res.data;
    });
  }


dletestcoIn(id: string) {
  
}





















}
