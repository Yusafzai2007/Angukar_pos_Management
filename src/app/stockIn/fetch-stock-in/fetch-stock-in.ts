import { Component, OnInit } from '@angular/core';
import { Barcode, Item, ItemGroup, StockIn, StockInCategory, StockInResponse } from '../../Typescript/stockin/stockin';
import { StockInStockInService } from '../../api_service/stock-in';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'app-fetch-stock-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fetch-stock-in.html',
  styleUrls: ['./fetch-stock-in.css']
})
export class FetchStockIn implements OnInit {
  stockindata: StockIn[] = [];
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
  selectedItemGroup: ItemGroup | null = null;
  selectedItem: Item | null = null;
  selectedCategory: StockInCategory | null = null;
  selectedBarcodes: Barcode[] = [];
  selectedItemName: string = '';

  constructor(private service: StockInStockInService) {}

  ngOnInit(): void {
    this.fetch_data();
  }

  fetch_data(): void {
    this.service.get_stockIn().subscribe((res: StockInResponse) => {
      this.stockindata = res.message;
      this.processStockInData();
      this.filteredRows = [...this.tableRows];
      console.log("tableRows", this.tableRows);
    });
  }

  processStockInData(): void {
    this.tableRows = [];
    
    this.stockindata.forEach(stockItem => {
      // Check if there are multiple items in one stock-in record
      if (stockItem.itemId && stockItem.itemId.length > 0) {
        stockItem.itemId.forEach((item, index) => {
          // Get the corresponding stockAdded value for this item
          const stockAdded = stockItem.stockAdded && stockItem.stockAdded[index] !== undefined 
            ? stockItem.stockAdded[index] 
            : stockItem.stockAdded?.[0] || 1;
          
          // Get the corresponding price for this item (or calculate proportionally)
          let itemPrice = 0;
          if (stockItem.itemId.length === 1) {
            // Single item, use the full price
            itemPrice = stockItem.stcokIn_price;
          } else {
            // Multiple items, calculate proportional price based on actual_item_price
            const totalActualPrice = stockItem.itemId.reduce((sum, item) => sum + (item.actual_item_price || 0), 0);
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
            stockPrice: Math.round(itemPrice * 100) / 100, // Round to 2 decimal places
            category: stockItem.stockInCategoryId,
            date: stockItem.stockInDate,
            notes: stockItem.notes,
            isActive: stockItem.isActive,
            createdAt: stockItem.createdAt
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
          row.category?.stockInCategoryName?.toLowerCase().includes(this.searchCategoryName.toLowerCase())) &&
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
  openItemGroupModal(itemGroup?: ItemGroup): void {
    if (itemGroup) {
      this.selectedItemGroup = itemGroup;
      this.showItemGroupModal = true;
    }
  }

  // Open Item Modal with safe check
  openItemModal(item?: Item): void {
    if (item) {
      this.selectedItem = item;
      this.showItemModal = true;
    }
  }

  // Open Category Modal with safe check
  openCategoryModal(category?: StockInCategory): void {
    if (category) {
      this.selectedCategory = category;
      this.showCategoryModal = true;
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

  editStockIn(id: string): void {
    console.log('Edit stock-in:', id);
    // Implement edit functionality here
  }

  deleteStockIn(id: string): void {
    if (confirm('Are you sure you want to delete this stock-in record?')) {
      console.log('Delete stock-in:', id);
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
  getBarcodeStatus(barcode: Barcode): string {
    if (barcode.stockoutId) return 'Out of Stock';
    if (barcode.stockInId) return 'In Stock';
    return 'Available';
  }

  // Get barcode status color
  getBarcodeStatusColor(barcode: Barcode): string {
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