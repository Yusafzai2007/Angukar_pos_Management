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
  minDiscountFilter: number | null = null;
  maxDiscountFilter: number | null = null;

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

  // Get active products count
  getActiveProductsCount(): number {
    return this.productsList.filter((product) => product.product.isActive).length;
  }

  // Get total stock count
  getTotalStockCount(): number {
    return this.productsList.reduce((total, product) => total + product.totalRemainingStock, 0);
  }

  // Get total barcodes count
  getTotalBarcodesCount(): number {
    return this.productsList.reduce((total, product) => total + product.barcodes.length, 0);
  }

  // Get current date for header
  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Apply all filters
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

      // Discount filter
      const discount = product.product.item_discount_price;
      if (this.minDiscountFilter !== null && discount < this.minDiscountFilter) {
        return false;
      }
      if (this.maxDiscountFilter !== null && discount > this.maxDiscountFilter) {
        return false;
      }

      return true;
    });
  }

  // Clear all filters
  clearFilters(): void {
    this.itemNameFilter = '';
    this.skuFilter = '';
    this.statusFilter = 'all';
    this.minDiscountFilter = null;
    this.maxDiscountFilter = null;
    this.filteredProducts = [...this.productsList];
  }

  // Open description modal
  openDescriptionModal(product: StockItem): void {
    this.selectedProduct = product;
    this.selectedDescription = product.product.item_Description;
    this.showDescriptionModal = true;
  }

  // Open transactions modal
  openTransactionsModal(product: StockItem): void {
    this.selectedProduct = product;
    // Flatten the nested transactions array
    this.selectedTransactions = product.allTransactions.flat();
    this.showTransactionsModal = true;
  }

  // Open barcodes modal
  openBarcodesModal(product: StockItem): void {
    this.selectedProduct = product;
    this.selectedBarcodes = product.barcodes;
    this.showBarcodesModal = true;
  }

  // Edit product
  editProduct(product: StockItem): void {
    // Implement edit functionality
    console.log('Editing product:', product);
    this.router.navigate(['/products', product.product._id]);

    // You can navigate to edit page or open edit modal here
  }

  // Close all modals
  closeModal(): void {
    this.showDescriptionModal = false;
    this.showTransactionsModal = false;
    this.showBarcodesModal = false;
    this.selectedProduct = null;
    this.selectedDescription = '';
    this.selectedTransactions = [];
    this.selectedBarcodes = [];
  }

  // Format date for display
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

  // Get transaction type color
  getTransactionTypeColor(type: string): string {
    switch (type) {
      case 'Opening':
        return 'bg-blue-900/30 text-blue-400 border border-blue-800/50';
      case 'In':
        return 'bg-green-900/30 text-green-400 border border-green-800/50';
      case 'Out':
        return 'bg-red-900/30 text-red-400 border border-red-800/50';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  }
  showFilters: boolean = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

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
  ];
}
