import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockApiResponse, StockItem } from '../../Typescript/add_product/add_product';
import { StockIn } from '../../api_service/stock-in';
import { StockInCategory, StockInCategoryResponse } from '../../Typescript/category/stockIn';
import { ServiceData } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-stockin',
  imports: [CommonModule, FormsModule],
  templateUrl: './stockin.html',
  styleUrls: ['./stockin.css']
})
export class Stockin implements OnInit {
  // Data arrays
  productsList: StockItem[] = [];
  filteredProducts: StockItem[] = [];
  stockInCategories: StockInCategory[] = [];
  
  // UI states
  loading: boolean = false;
  error: string | null = null;
  submitting: boolean = false;
  
  // Form visibility
  showMainForm: boolean = false;
  
  // Product rows array
  productRows: Array<{
    _id: string;
    productName: string;
    modelNoSKU: string;
    unit: string;
    currentStock: number;
    quantity: number;
    totalAfter: number;
    salePrice: number;
    totalPrice: number;
    barcodes: string[];
    showBarcodeModal: boolean;
    newBarcode: string;
    availableBarcodes: string[];
    loadingBarcodes: boolean;
  }> = [];

  // Main form data
  stockInData = {
    stcokIn_price: 0,
    stockInDate: new Date().toISOString().split('T')[0],
    stockInCategoryId: '',
    invoiceNo: '',
    notes: ''
  };

  constructor(private service: StockIn,private services:ServiceData) {}

  ngOnInit(): void {
    this.getProducts();
    this.getStockInCategories();
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

  getStockInCategories(): void {
    this.service.get_stockIn_category().subscribe({
      next: (res: StockInCategoryResponse) => {
        this.stockInCategories = res.data.filter(category => category.isActive);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load categories';
      },
    });
  }

  toggleMainForm(): void {
    this.showMainForm = !this.showMainForm;
    if (this.showMainForm) {
      // Add first empty row
      this.addProductRow();
    } else {
      this.resetForm();
    }
  }

  addProductRow(): void {
    this.productRows.push({
      _id: '',
      productName: '',
      modelNoSKU: '',
      unit: '',
      currentStock: 0,
      quantity: 0,
      totalAfter: 0,
      salePrice: 0,
      totalPrice: 0,
      barcodes: [],
      showBarcodeModal: false,
      newBarcode: '',
      availableBarcodes: [],
      loadingBarcodes: false
    });
  }

  onProductSelect(index: number, productId: string): void {
    if (!productId) {
      this.resetProductRow(index);
      return;
    }

    const product = this.productsList.find(p => p._id === productId);
    if (product) {
      const row = this.productRows[index];
      row._id = product._id;
      row.productName = product.product.item_Name;
      row.modelNoSKU = product.product.modelNoSKU;
      row.unit = product.product.unit;
      row.currentStock = product.totalRemainingStock;
      row.salePrice = product.product.item_final_price;
      row.quantity = 1;
      row.totalAfter = row.currentStock + row.quantity;
      row.totalPrice = row.salePrice * row.quantity;
      
      // Load barcodes for this product
      this.loadProductBarcodes(index);
    }
  }

  loadProductBarcodes(index: number): void {
    const row = this.productRows[index];
    if (!row._id) return;

    row.loadingBarcodes = true;
    // This would need a barcode service method
    // For now, we'll simulate with empty array
    setTimeout(() => {
      row.barcodes = [];
      row.availableBarcodes = [];
      row.loadingBarcodes = false;
    }, 500);
  }

  onQuantityChange(index: number): void {
    const row = this.productRows[index];
    if (row.quantity < 0) row.quantity = 0;
    row.totalAfter = row.currentStock + row.quantity;
    row.totalPrice = row.salePrice * row.quantity;
    
    // Update total price
    this.updateTotalPrice();
  }

  updateTotalPrice(): void {
    const total = this.productRows.reduce((sum, row) => sum + row.totalPrice, 0);
    this.stockInData.stcokIn_price = parseFloat(total.toFixed(2));
  }

  removeProductRow(index: number): void {
    this.productRows.splice(index, 1);
    if (this.productRows.length === 0) {
      this.addProductRow();
    }
    this.updateTotalPrice();
  }

  resetProductRow(index: number): void {
    this.productRows[index] = {
      _id: '',
      productName: '',
      modelNoSKU: '',
      unit: '',
      currentStock: 0,
      quantity: 0,
      totalAfter: 0,
      salePrice: 0,
      totalPrice: 0,
      barcodes: [],
      showBarcodeModal: false,
      newBarcode: '',
      availableBarcodes: [],
      loadingBarcodes: false
    };
    this.updateTotalPrice();
  }

  // Barcode Management
  toggleBarcodeModal(index: number): void {
    const row = this.productRows[index];
    if (!row._id) {
      this.error = 'Please select a product first';
      return;
    }
    row.showBarcodeModal = !row.showBarcodeModal;
    if (row.showBarcodeModal) {
      row.newBarcode = '';
    }
  }

  addBarcode(index: number): void {
    const row = this.productRows[index];
    if (!row.newBarcode.trim()) {
      this.error = 'Please enter a barcode';
      return;
    }

    if (row.barcodes.includes(row.newBarcode.trim())) {
      this.error = 'Barcode already exists';
      return;
    }

    row.barcodes.push(row.newBarcode.trim());
    row.newBarcode = '';
  }

  removeBarcode(index: number, barcodeIndex: number): void {
    this.productRows[index].barcodes.splice(barcodeIndex, 1);
  }

  saveBarcodes(index: number): void {
    const row = this.productRows[index];
    if (!row._id) return;

    if (row.barcodes.length !== row.quantity) {
      this.error = `Number of barcodes (${row.barcodes.length}) must match quantity (${row.quantity})`;
      return;
    }

    const payload = {
      barcode_serila: row.barcodes,
      stockInId: null,
      stockoutId: null
    };

    // Call barcode service
    this.services.add_barcode_serillla(row._id, payload).subscribe({
      next: (res: any) => {
        alert('Barcodes saved successfully!');
        row.showBarcodeModal = false;
        this.error = null;
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Failed to save barcodes';
      }
    });
  }

  validateForm(): boolean {
    this.error = null;

    // Check category
    if (!this.stockInData.stockInCategoryId) {
      this.error = 'Please select a category';
      return false;
    }

    // Check products
    const hasValidProducts = this.productRows.some(row => row._id && row.quantity > 0);
    if (!hasValidProducts) {
      this.error = 'Please add at least one product with quantity';
      return false;
    }

    // Check all rows
    for (const row of this.productRows) {
      if (row._id && row.quantity <= 0) {
        this.error = `Quantity must be greater than 0 for ${row.productName}`;
        return false;
      }
    }

    return true;
  }

  submitStockIn(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;
    
    // Filter only rows with products
    const validRows = this.productRows.filter(row => row._id && row.quantity > 0);
    
    const payload = {
      ...this.stockInData,
      itemId: validRows.map(row => row._id),
      stockAdded: validRows.map(row => row.quantity)
    };

    console.log('Submitting payload:', payload);

    this.service.stockIn(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        alert('Stock In created successfully!');
        this.resetForm();
        this.toggleMainForm();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = err.error?.message || 'Failed to create stock in';
        this.submitting = false;
      },
    });
  }

  resetForm(): void {
    this.stockInData = {
      stcokIn_price: 0,
      stockInDate: new Date().toISOString().split('T')[0],
      stockInCategoryId: '',
      invoiceNo: '',
      notes: ''
    };
    this.productRows = [];
    this.error = null;
  }
}