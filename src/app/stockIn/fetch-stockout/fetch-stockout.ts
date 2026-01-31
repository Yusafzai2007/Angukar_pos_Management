import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stockoutservice } from '../../api_service/stockout/stockoutservice';
import { StockOutApiResponsedata, StockOutItemdata } from '../../Typescript/stcokout/stock_out_data';

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
}

@Component({
  selector: 'app-fetch-stockout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fetch-stockout.html',
  styleUrl: './fetch-stockout.css'
})
export class FetchStockout implements OnInit {
  stockoutData: StockOutItemdata[] = [];
  tableRows: TableRow[] = [];
  filteredRows: TableRow[] = [];
  
  // Search filters
  showFilters = false;
  searchItemName = '';
  searchItemDescription = '';
  searchInvoiceNo = '';
  searchItemGroupName = '';
  searchCategoryName = '';
  searchModelSKU = '';
  
  // Modals
  showItemGroupModal = false;
  showItemModal = false;
  showCategoryModal = false;
  showBarcodeModal = false;
  
  // Selected data for modals
  selectedItemGroup: any = null;
  selectedItem: any = null;
  selectedCategory: any = null;
  selectedBarcodes: any[] = [];
  selectedItemName: string = '';

  constructor(private service: Stockoutservice) {}

  ngOnInit(): void {
    this.fetch_data();
  }

  fetch_data(): void {
this.service.all_stock_out().subscribe((res: StockOutApiResponsedata) => {
  this.stockoutData = res.message;
  this.processStockOutData();
  this.filteredRows = [...this.tableRows];
  console.log("stockoutData", this.stockoutData);
});

  }

  processStockOutData(): void {
    this.tableRows = [];
    
    this.stockoutData.forEach(stockOutItem => {
      // Check if there are multiple items in one stock-out record
      if (stockOutItem.itemId && stockOutItem.itemId.length > 0) {
        stockOutItem.itemId.forEach((item, index) => {
          // Get the corresponding quantity value for this item
          const quantity = stockOutItem.quantity && stockOutItem.quantity[index] !== undefined 
            ? stockOutItem.quantity[index] 
            : stockOutItem.quantity?.[0] || 1;
          
          // Get the corresponding sale amount for this item (or calculate proportionally)
          let itemSale = 0;
          if (stockOutItem.itemId.length === 1) {
            // Single item, use the full sale amount
            itemSale = stockOutItem.Total_sale;
          } else {
            // Multiple items, calculate proportional sale based on selling price
            const totalSellingPrice = stockOutItem.itemId.reduce((sum, item) => sum + (item.selling_item_price || 0), 0);
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
            totalSale: Math.round(itemSale * 100) / 100, // Round to 2 decimal places
            category: stockOutItem.stockOutCategoryId,
            date: stockOutItem.date,
            stockOutDate: stockOutItem.stockOutDate,
            isActive: stockOutItem.isActive,
            createdAt: stockOutItem.createdAt
          });
        });
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.filteredRows = this.tableRows.filter(row => {
      return (
        (!this.searchItemName || 
          row.item.item_Name?.toLowerCase().includes(this.searchItemName.toLowerCase())) &&
        (!this.searchItemDescription || 
          row.item.item_Description?.toLowerCase().includes(this.searchItemDescription.toLowerCase())) &&
        (!this.searchInvoiceNo || 
          row.invoiceNo?.toLowerCase().includes(this.searchInvoiceNo.toLowerCase())) &&
        (!this.searchItemGroupName || 
          row.item.itemGroupId?.itemGroupName?.toLowerCase().includes(this.searchItemGroupName.toLowerCase())) &&
        (!this.searchCategoryName || 
          row.category?.stockoutCategoryName?.toLowerCase().includes(this.searchCategoryName.toLowerCase())) &&
        (!this.searchModelSKU || 
          row.item.modelNoSKU?.toLowerCase().includes(this.searchModelSKU.toLowerCase()))
      );
    });
  }

  clearFilters(): void {
    this.searchItemName = '';
    this.searchItemDescription = '';
    this.searchInvoiceNo = '';
    this.searchItemGroupName = '';
    this.searchCategoryName = '';
    this.searchModelSKU = '';
    this.filteredRows = [...this.tableRows];
  }

  // Open Item Group Modal with safe check
  openItemGroupModal(itemGroup?: any): void {
    if (itemGroup) {
      this.selectedItemGroup = itemGroup;
      this.showItemGroupModal = true;
    }
  }

  // Open Item Modal with safe check
  openItemModal(item?: any): void {
    if (item) {
      this.selectedItem = item;
      this.showItemModal = true;
    }
  }

  // Open Category Modal with safe check
  openCategoryModal(category?: any): void {
    if (category) {
      this.selectedCategory = category;
      this.showCategoryModal = true;
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
    this.showItemGroupModal = false;
    this.showItemModal = false;
    this.showCategoryModal = false;
    this.showBarcodeModal = false;
    this.selectedItemGroup = null;
    this.selectedItem = null;
    this.selectedCategory = null;
    this.selectedBarcodes = [];
    this.selectedItemName = '';
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
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  // Get barcode status text
  getBarcodeStatus(barcode: any): string {
    if (barcode.stockoutId) return 'Out of Stock';
    if (barcode.stockInId) return 'In Stock';
    return 'Available';
  }

  // Get barcode status color
  getBarcodeStatusColor(barcode: any): string {
    if (barcode.stockoutId) return 'bg-red-100 text-red-800';
    if (barcode.stockInId) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  }

  // Print barcodes function
  printBarcodes(): void {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 20px;">Barcode Report</h2>
        <h3 style="text-align: center; margin-bottom: 30px; color: #666;">${this.selectedItemName}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Barcode Serial</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Created At</th>
            </tr>
          </thead>
          <tbody>
            ${this.selectedBarcodes.map((barcode, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace; font-weight: bold;">${barcode.barcode_serila}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <span style="padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; 
                    ${barcode.stockoutId ? 'background-color: #fee2e2; color: #991b1b;' : 
                      barcode.stockInId ? 'background-color: #d1fae5; color: #065f46;' : 
                      'background-color: #dbeafe; color: #1e40af;'}">
                    ${this.getBarcodeStatus(barcode)}
                  </span>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">${this.formatDate(barcode.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
          <p>Total Barcodes: ${this.selectedBarcodes.length}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Barcode Report - ${this.selectedItemName}</title>
            <style>
              @media print {
                @page { margin: 0.5in; }
                body { margin: 0; }
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
}