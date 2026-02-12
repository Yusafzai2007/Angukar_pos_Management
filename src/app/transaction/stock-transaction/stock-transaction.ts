import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ItemStockRecordType,
  StockRecordResponse,
  StockTransactiondata,
  StockInTransaction,
  StockOutTransaction,
} from '../../Typescript/transaction';
import { ServiceStockoutdata } from '../stock_services/service-stockoutdata';

@Component({
  selector: 'app-stock-transaction',
  templateUrl: './stock-transaction.html',
  styleUrls: ['./stock-transaction.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
})
export class StockTransaction implements OnInit {
  stockTransactions: ItemStockRecordType[] = [];
  filteredTransactions: ItemStockRecordType[] = [];
  searchTerm: string = '';
  hasTicketFilter: string = 'All';

  // Modal properties
  showModal: boolean = false;
  selectedItem: ItemStockRecordType | null = null;
  selectedStockIn: StockTransactiondata | null = null;
  selectedStockOut: StockTransactiondata | null = null;

  // Accordion states
  itemDetailsExpanded: boolean = true;
  stockInExpanded: boolean = true;
  stockOutExpanded: boolean = true;
  timelineExpanded: boolean = true;

  constructor(private service: ServiceStockoutdata) {}

  ngOnInit(): void {
    this.fetchStockTransactions();
  }

  fetchStockTransactions() {
    this.service.get_stock_transaction().subscribe(
      (res: StockRecordResponse) => {
        if (res.success) {
          this.stockTransactions = res.data;
          this.filteredTransactions = [...res.data];
        } else {
          console.error('Failed to fetch stock transactions:', res.message);
        }
      },
      (err) => {
        console.error('API error:', err);
      },
    );
  }

  // Search functionality
  onSearch() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.hasTicketFilter = 'All';
    this.filteredTransactions = [...this.stockTransactions];
  }

  applyFilters() {
    this.filteredTransactions = this.stockTransactions.filter((transaction) => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        transaction.productId.item_Name.toLowerCase().includes(searchLower) ||
        transaction.productId.modelNoSKU.toLowerCase().includes(searchLower) ||
        transaction._id.toLowerCase().includes(searchLower);

      let matchesTicket = true;
      if (this.hasTicketFilter === 'Yes') {
        matchesTicket = true;
      } else if (this.hasTicketFilter === 'No') {
        matchesTicket = true;
      }

      return matchesSearch && matchesTicket;
    });
  }

  // Modal functions
  openDetailsModal(transaction: ItemStockRecordType) {
    this.selectedItem = transaction;

    // Reset accordion states
    this.itemDetailsExpanded = true;
    this.stockInExpanded = false;
    this.stockOutExpanded = false;
    this.timelineExpanded = false;

    // Find stock-in transaction (exclude Opening)
    this.selectedStockIn = transaction.transactions.find((t) => t.type === 'Stock-In') || null;

    // Find stock-out transaction
    this.selectedStockOut = transaction.transactions.find((t) => t.type === 'Stock-Out') || null;

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedItem = null;
    this.selectedStockIn = null;
    this.selectedStockOut = null;
  }

  // Toggle accordion sections
  toggleItemDetails() {
    this.itemDetailsExpanded = !this.itemDetailsExpanded;
  }

  toggleStockIn() {
    this.stockInExpanded = !this.stockInExpanded;
  }

  toggleStockOut() {
    this.stockOutExpanded = !this.stockOutExpanded;
  }

  toggleTimeline() {
    this.timelineExpanded = !this.timelineExpanded;
  }

  // Helper functions
  getStockInReference(transaction: ItemStockRecordType): string {
    const stockIn = transaction.transactions.find((t) => t.type === 'Stock-In');
    return stockIn ? stockIn.reference : '';
  }

  hasStockIn(transaction: ItemStockRecordType): boolean {
    return transaction.transactions.some((t) => t.type === 'Stock-In');
  }

  getStockOutReference(transaction: ItemStockRecordType): string {
    const stockOut = transaction.transactions.find((t) => t.type === 'Stock-Out');
    return stockOut ? stockOut.reference : '';
  }

  hasStockOut(transaction: ItemStockRecordType): boolean {
    return transaction.transactions.some((t) => t.type === 'Stock-Out');
  }

  getStockInType(transaction: ItemStockRecordType): string {
    const hasStockIn = transaction.transactions.some((t) => t.type === 'Stock-In');
    return hasStockIn ? 'Stock-In' : 'Opening';
  }

  getOpeningStock(transaction: ItemStockRecordType): number {
    const opening = transaction.transactions.find((t) => t.type === 'Opening');
    return opening ? opening.quantity : 0;
  }

  // Get stock-in quantity
  getStockInQuantity(): number {
    if (this.selectedStockIn) {
      return this.selectedStockIn.quantity;
    }
    return 0;
  }

  // Get stock-in total price from fullTransaction
  getStockInTotalPrice(): number {
    if (this.selectedStockIn && this.selectedStockIn.fullTransaction) {
      const stockInTransaction = this.selectedStockIn.fullTransaction as StockInTransaction;
      return stockInTransaction.stcokIn_price;
    }
    return 0;
  }

  // Get stock-out quantity
  getStockOutQuantity(): number {
    if (this.selectedStockOut) {
      return this.selectedStockOut.quantity;
    }
    return 0;
  }

  // Get stock-out total sale from fullTransaction
  getStockOutTotalSale(): number {
    if (this.selectedStockOut && this.selectedStockOut.fullTransaction) {
      const stockOutTransaction = this.selectedStockOut.fullTransaction as StockOutTransaction;
      return stockOutTransaction.Total_sale;
    }
    return 0;
  }

  // Get only Stock-In and Stock-Out transactions (exclude Opening)
  getFilteredTransactions(): StockTransactiondata[] {
    if (!this.selectedItem) return [];
    return this.selectedItem.transactions.filter(
      (t: StockTransactiondata) => t.type === 'Stock-In' || t.type === 'Stock-Out',
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ', ' + date.toLocaleTimeString();
  }

  // Get display text for Stock In column
  getStockInDisplay(transaction: ItemStockRecordType) {
    if (this.hasStockIn(transaction)) {
      const stockInRef = this.getStockInReference(transaction);
      return stockInRef;
    } else {
      return 'Opening';
    }
  }

  // Get router link for transaction
  getTransactionRouterLink(transaction: StockTransactiondata): string[] {
    if (transaction.type === 'Stock-In') {
      return ['/admin/edit_stockIn', transaction.reference];
    } else if (transaction.type === 'Stock-Out') {
      return ['/admin/edit_stockout', transaction.reference];
    }
    return [];
  }




tableheader:string[] = [
  '#',
  'Item Name',
  'SKU Model',
  'Unit',
  'Stock In',
  'Stock Out Id',
  'Updated At',
  'Created At',
  'Actions',

]

















}