import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceData } from '../../create_account/api_service/service-data';
import {
  StockApiResponse,
  StockItem,
  Transaction,
  Barcode,
} from '../../Typescript/add_product/add_product';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  productsList: StockItem[] = [];
  filteredProducts: StockItem[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Modal states
  showDescriptionModal: boolean = false;
  showTransactionsModal: boolean = false;
  showBarcodesModal: boolean = false;

  // Selected items for modals
  selectedProduct: StockItem | null = null;
  selectedDescription: string = '';
  selectedTransactions: Transaction[] = [];
  selectedBarcodes: Barcode[] = [];

  // Filter variables
  itemNameFilter: string = '';
  skuFilter: string = '';
  statusFilter: string = 'all';
  descriptionFilter: string = '';

  showFilters: boolean = false;

  tableheader: string[] = [
    '#',
    'Item Name',
    'SKU/Model',
    'Unit',
    'Status',
    'Cost',
    'Price',
    'Discount',
    'Final',
    'Opening',
    'Remaining',
    'Barcodes',
    'CreatedAt',
    'UpdatedAt',
  ];

  tableheaderbody: string[] = [
    '#',
    'Type',
    'Date',
    'Quantity',
    'Cost Price',
    'Sale Price',
    'Discount',
    'Final Price',
  ];

  constructor(
    private service: ServiceData,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.loading = true;
    this.error = null;

    this.service.products().subscribe({
      next: (res: StockApiResponse) => {
        this.productsList = res.data;
        this.filteredProducts = [...this.productsList];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load products';
        this.loading = false;
      },
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  filterProducts(): void {
    this.filteredProducts = this.productsList.filter((product) => {
      // Item Name filter
      if (
        this.itemNameFilter &&
        !product.product.item_Name.toLowerCase().includes(this.itemNameFilter.toLowerCase())
      ) {
        return false;
      }

      // SKU filter
      if (
        this.skuFilter &&
        !product.product.modelNoSKU.toLowerCase().includes(this.skuFilter.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (this.statusFilter !== 'all') {
        const isActive = this.statusFilter === 'active';
        if (product.product.isActive !== isActive) {
          return false;
        }
      }

      // Description filter
      if (
        this.descriptionFilter &&
        product.product.item_Description &&
        !product.product.item_Description.toLowerCase().includes(this.descriptionFilter.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }

  clearFilters(): void {
    this.itemNameFilter = '';
    this.skuFilter = '';
    this.statusFilter = 'all';
    this.descriptionFilter = '';
    this.filteredProducts = [...this.productsList];
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  openDescriptionModal(product: StockItem): void {
    this.selectedProduct = product;
    this.selectedDescription = product.product.item_Description;
    this.showDescriptionModal = true;
  }

  openTransactionsModal(product: StockItem): void {
    this.selectedProduct = product;
    this.selectedTransactions = product.allTransactions.flat();
    this.showTransactionsModal = true;
  }

  openBarcodesModal(product: StockItem): void {
    this.selectedProduct = product;
    this.selectedBarcodes = product.barcodes;
    this.showBarcodesModal = true;
  }

  closeModal(): void {
    this.showDescriptionModal = false;
    this.showTransactionsModal = false;
    this.showBarcodesModal = false;
    this.selectedProduct = null;
    this.selectedDescription = '';
    this.selectedTransactions = [];
    this.selectedBarcodes = [];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  delete_products(id: string): void {
    if (confirm('Are you sure you want to delete this product group?')) {
      this.service.delete_product(id).subscribe({
        next: (res) => {
          console.log(res);
          alert('Product group deleted successfully!');
          this.getProducts();
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the product group.');
        }
      });
    }
  }

  toggleStatusFilter(): void {
    if (this.statusFilter === 'all') {
      this.statusFilter = 'active';
    } else if (this.statusFilter === 'active') {
      this.statusFilter = 'inactive';
    } else {
      this.statusFilter = 'all';
    }
    this.filterProducts(); // Apply filter immediately
  }

  /**
   * Get stock price based on transaction type:
   * - Opening: returns 0
   * - Stock-In: returns stockInCost
   * - Stock-Out: returns Total_sale
   */
  getStockPrice(transaction: Transaction): number {
    switch(transaction.type) {
      case 'Opening':
        return 0;
      case 'Stock-In':
        // Use stockInCost if available, otherwise fall back to costPrice
        return (transaction as any).stockInCost || transaction.costPrice || 0;
      case 'Stock-Out':
        // Use Total_sale if available
        return (transaction as any).Total_sale || 0;
      default:
        return 0;
    }
  }
}