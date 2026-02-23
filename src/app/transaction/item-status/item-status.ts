import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { StockRecord, Transaction } from '../../Typescript/Item_transaction';
import { ServiceStockoutdata } from '../../transaction/stock_services/service-stockoutdata';

@Component({
  selector: 'app-item-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './item-status.html',
  styleUrls: ['./item-status.css'],
})
export class ItemStatus implements OnInit {
  // Data arrays
  items: StockRecord[] = [];
  filteredItems: StockRecord[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedYear: string = '';
  availableYears: string[] = [];

  // Modal properties
  showModal: boolean = false;
  showDetailsModal: boolean = false;
  selectedItem: StockRecord | null = null;
  selectedTransaction: Transaction | null = null;

  // Transaction filters
  fromDate: string = '';
  toDate: string = '';
  filteredTransactions: Transaction[] = [];

  // Calculated properties
  totalItems: number = 0;

  constructor(private stockService: ServiceStockoutdata) {}

  ngOnInit(): void {
    this.loadStockRecords();
  }

  loadStockRecords(): void {
    this.stockService.Item_stock_record().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.items = response.data;
          this.filteredItems = [...this.items];
          this.totalItems = this.items.length;
          this.extractAvailableYears();
        }
      },
      error: (error) => {
        console.error('Error loading stock records:', error);
      },
    });
  }

  extractAvailableYears(): void {
    const years = new Set<string>();
    this.items.forEach((item) => {
      const year = new Date(item.createdAt).getFullYear().toString();
      years.add(year);
    });
    this.availableYears = Array.from(years).sort((a, b) => b.localeCompare(a));
  }

  applyFilters(): void {
    this.filteredItems = this.items.filter((item) => {
      // Search filter
      const matchesSearch =
        this.searchTerm === '' ||
        item.productId.item_Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.productId.modelNoSKU &&
          item.productId.modelNoSKU.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Year filter
      const matchesYear =
        this.selectedYear === '' ||
        new Date(item.createdAt).getFullYear().toString() === this.selectedYear;

      return matchesSearch && matchesYear;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedYear = '';
    this.applyFilters();
  }

  openTransactionModal(item: StockRecord): void {
    this.selectedItem = item;
    this.filteredTransactions = [...item.transactions];
    this.fromDate = '';
    this.toDate = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedItem = null;
    this.filteredTransactions = [];
  }

  filterTransactions(): void {
    if (!this.selectedItem) return;

    this.filteredTransactions = this.selectedItem.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      if (this.fromDate && transactionDate < new Date(this.fromDate)) {
        return false;
      }

      if (this.toDate) {
        const toDateObj = new Date(this.toDate);
        toDateObj.setHours(23, 59, 59, 999);
        if (transactionDate > toDateObj) {
          return false;
        }
      }

      return true;
    });
  }

  // Getter to filter out Opening transactions
  get filteredNonOpeningTransactions(): Transaction[] {
    return this.filteredTransactions.filter((t) => t.type !== 'Opening');
  }

  calculateOpeningBalance(): number {
    if (!this.selectedItem) return 0;
    return this.selectedItem.openingStock;
  }

  calculateTotalStockIn(): number {
    if (!this.filteredTransactions.length) return 0;

    return this.filteredTransactions
      .filter((t) => t.type === 'Stock-In')
      .reduce((sum, t) => sum + t.quantity, 0);
  }

  // New method to calculate total stock-in quantity (cumulative)
  calculateTotalStockInQuantity(): number {
    if (!this.selectedItem) return 0;

    // Get all stock-in transactions (excluding Opening)
    const stockInTransactions = this.selectedItem.transactions.filter((t) => t.type === 'Stock-In');

    // Calculate total quantity from all stock-in transactions
    return stockInTransactions.reduce((sum, t) => sum + t.quantity, 0);
  }

  calculateTotalStockOut(): number {
    if (!this.filteredTransactions.length) return 0;

    return this.filteredTransactions
      .filter((t) => t.type === 'Stock-Out')
      .reduce((sum, t) => sum + t.quantity, 0);
  }

  viewTransactionDetails(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedTransaction = null;
  }
}
