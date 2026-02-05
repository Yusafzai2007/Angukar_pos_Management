import { Component, OnInit } from '@angular/core';
import { StockOutApiResponse, StockOutItem } from '../../Typescript/stcokout/stock_out';
import {
  StockOutCategoryDisplay,
  StockOutCategoryResponse,
} from '../../Typescript/category/stockout_category';
import { ItemGroup } from '../../Typescript/product_group';
import { Stockoutservice } from '../../api_service/stockout/stockoutservice';
import { ServiceData } from '../../create_account/api_service/service-data';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FetchStockout } from "../fetch-stockout/fetch-stockout";

@Component({
  selector: 'app-stockout',
  imports: [CommonModule, FormsModule, FetchStockout],
  templateUrl: './stockout.html',
  styleUrl: './stockout.css',
})
export class Stockout implements OnInit {
  // Data arrays
  productsList: StockOutItem[] = [];
  filteredProducts: StockOutItem[] = [];
  stockOutCategories: StockOutCategoryDisplay[] = [];
  filteredCategories: StockOutCategoryDisplay[] = [];
  productGroups: ItemGroup[] = [];

  // UI states
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  submitting: boolean = false;
  savingBarcodes: boolean = false;
  loadingGroups: boolean = false;

  // Form visibility
  showMainForm: boolean = false;
  showProductSearchModal: boolean = false;
  showEditProductModal: boolean = false;
  showBarcodeModalIndex: number = -1;
  showGroupDropdown: boolean = false;
  showCategoryDropdown: boolean = false;

  // Current editing row index
  editingRowIndex: number = -1;
  selectedRowIndex: number = -1;

  // Search
  productSearchTerm: string = '';
  groupSearchTerm: string = '';
  categorySearch: string = '';

  // Store the created StockOut ID
  currentStockOutId: string | null = null;
  stockOutSubmitted: boolean = false;
  stockOutNumber: string | null = null;

  // Notification state
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'success';

  // Product rows array (removed lineTotal)
  productRows: Array<{
    _id: string;
    productName: string;
    modelNoSKU: string;
    unit: string;
    status: string;
    costPrice: number;
    salePrice: number;
    discount: number;
    finalPrice: number;
    openingStock: number;
    currentStock: number;
    quantity: number;
    totalAfter: number;
    barcodes: string[];
    newBarcode: string;
    availableBarcodes: string[];
    loadingBarcodes: boolean;
    barcodeSaved: boolean;
    stockRecordId?: string;
    isSerialTracking: boolean;
    productGroupName: string;
    productGroupId: string;
    itemGroupId: string;
  }> = [];

  // Main form data
  stockOutData = {
    Total_sale: 0,
    stockOutDate: new Date().toISOString().split('T')[0],
    stockOutCategoryId: '',
    stockOutCategoryName: '',
    invoiceNo: '',
    notes: '',
  };

  // Edit form data (added serialNo)
  editFormData = {
    productId: '',
    openingStock: 0,
    productName: '',
    modelNoSKU: '',
    unit: '',
    costPrice: 0,
    salePrice: 0,
    discount: 0,
    finalPrice: 0,
    productGroupName: '',
    productGroupId: '',
    serialNo: false,
  };

  constructor(
    private stockOutService: Stockoutservice,
    private services: ServiceData,
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getStockOutCategories();
    this.loadProductGroups();
  }

  // Notification system
  showNotificationMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  closeNotification(): void {
    this.showNotification = false;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getProducts(): void {
    this.loading = true;
    this.error = null;

    this.stockOutService.products().subscribe({
      next: (res: StockOutApiResponse) => {
        this.productsList = res.data;
        this.filteredProducts = [...this.productsList];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products';
        this.loading = false;
      },
    });
  }

  loadProductGroups(): void {
    this.loadingGroups = true;
    this.services.get_product_group().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.productGroups = res.data.filter((group: ItemGroup) => group.isActive);
        }
        this.loadingGroups = false;
      },
      error: (err) => {
        console.error('Error loading product groups:', err);
        this.loadingGroups = false;
      },
    });
  }

  getStockOutCategories(): void {
    this.stockOutService.get_stockOut_category().subscribe({
      next: (res: StockOutCategoryResponse) => {
        this.stockOutCategories = res.data.filter((category) => category.isActive);
        this.filteredCategories = [...this.stockOutCategories];
      },
      error: (err) => {
        console.error('Error loading stock out categories:', err);
        this.error = 'Failed to load categories';
      },
    });
  }

  // Category dropdown methods
  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  onCategorySearchChange(): void {
    this.filterCategories();
  }

  filterCategories(): void {
    if (!this.categorySearch) {
      this.filteredCategories = [...this.stockOutCategories];
      return;
    }

    const searchTerm = this.categorySearch.toLowerCase();
    this.filteredCategories = this.stockOutCategories.filter(category =>
      category.stockoutCategoryName.toLowerCase().includes(searchTerm)
    );
  }

  selectCategory(categoryId: string, categoryName: string): void {
    this.stockOutData.stockOutCategoryId = categoryId;
    this.stockOutData.stockOutCategoryName = categoryName;
    this.showCategoryDropdown = false;
    this.categorySearch = categoryName;
  }

  clearCategory(): void {
    this.stockOutData.stockOutCategoryId = '';
    this.stockOutData.stockOutCategoryName = '';
    this.categorySearch = '';
    this.filteredCategories = [...this.stockOutCategories];
  }

  toggleMainForm(): void {
    this.showMainForm = !this.showMainForm;
    if (this.showMainForm) {
      this.addProductRow();
      this.resetFormState();
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
      status: '',
      costPrice: 0,
      salePrice: 0,
      discount: 0,
      finalPrice: 0,
      openingStock: 0,
      currentStock: 0,
      quantity: 0,
      totalAfter: 0,
      barcodes: [],
      newBarcode: '',
      availableBarcodes: [],
      loadingBarcodes: false,
      barcodeSaved: false,
      stockRecordId: '',
      isSerialTracking: false,
      productGroupName: '',
      productGroupId: '',
      itemGroupId: '',
    });
  }

  resetFormState(): void {
    this.currentStockOutId = null;
    this.stockOutSubmitted = false;
    this.stockOutNumber = null;
    this.successMessage = null;
    this.productRows.forEach((row) => {
      row.barcodeSaved = false;
      row.barcodes = [];
    });
  }

  openProductSearchModal(index: number): void {
    this.selectedRowIndex = index;
    this.showProductSearchModal = true;
    this.productSearchTerm = '';
    this.filteredProducts = [...this.productsList];
  }

  closeProductSearchModal(): void {
    this.showProductSearchModal = false;
    this.selectedRowIndex = -1;
    this.productSearchTerm = '';
  }

  filterProducts(): void {
    if (!this.productSearchTerm) {
      this.filteredProducts = [...this.productsList];
      return;
    }

    const searchTerm = this.productSearchTerm.toLowerCase();
    this.filteredProducts = this.productsList.filter(
      (product) =>
        product.product.item_Name.toLowerCase().includes(searchTerm) ||
        product.product.modelNoSKU.toLowerCase().includes(searchTerm),
    );
  }

  selectProductFromModal(product: StockOutItem): void {
    if (this.selectedRowIndex !== -1) {
      // Check if product is already added
      const isAlreadyAdded = this.productRows.some(
        (row, idx) => idx !== this.selectedRowIndex && row._id === product.product._id
      );
      
      if (isAlreadyAdded) {
        this.showNotificationMessage(
          `${product.product.item_Name} is already added to the list.`,
          'warning'
        );
        return;
      }
      
      this.fillProductDetails(this.selectedRowIndex, product);
      this.closeProductSearchModal();
    }
  }

  fillProductDetails(index: number, product: StockOutItem): void {
    const row = this.productRows[index];
    const productData = product.product;

    row._id = productData._id;
    row.productName = productData.item_Name;
    row.modelNoSKU = productData.modelNoSKU;
    row.unit = productData.unit;
    row.status = productData.isActive ? 'Active' : 'Inactive';
    row.costPrice = productData.actual_item_price;
    row.salePrice = productData.selling_item_price;
    row.discount = productData.item_discount_price;

    // Auto-calculate final price
    row.finalPrice = this.calculateFinalPrice(row.salePrice, row.discount);

    row.openingStock = product.totalOpeningStock;
    row.currentStock = product.totalRemainingStock;
    row.quantity = 1;
    row.totalAfter = row.currentStock - row.quantity;

    this.getProductGroupInfo(productData, row);

    const serialNo = productData.serialNo;
    row.isSerialTracking =
      typeof serialNo === 'string' ? serialNo.toLowerCase() === 'true' : Boolean(serialNo);

    row.stockRecordId = product._id;
    row.itemGroupId = productData.itemGroupId;

    row.barcodes = [];
    row.barcodeSaved = false;

    this.updateTotalSale();
  }

  calculateFinalPrice(salePrice: number, discount: number): number {
    const finalPrice = salePrice - discount;
    return finalPrice > 0 ? parseFloat(finalPrice.toFixed(2)) : 0;
  }

  getProductGroupInfo(productData: any, row: any): void {
    if (productData.itemGroupName) {
      row.productGroupName = productData.itemGroupName;

      const matchingGroup = this.productGroups.find(
        (group) => group.itemGroupName === productData.itemGroupName,
      );
      if (matchingGroup) {
        row.productGroupId = matchingGroup._id;
      }
    } else if (productData.itemGroupId) {
      const matchingGroup = this.productGroups.find(
        (group) => group._id === productData.itemGroupId,
      );
      if (matchingGroup) {
        row.productGroupName = matchingGroup.itemGroupName;
        row.productGroupId = matchingGroup._id;
      }
    }

    if (!row.productGroupName) {
      row.productGroupName = '';
      row.productGroupId = '';
    }
  }

  openEditProductModal(index: number): void {
    const row = this.productRows[index];
    if (!row._id) {
      this.showNotificationMessage('Please select a product first', 'error');
      return;
    }

    this.editingRowIndex = index;
    this.editFormData = {
      productId: row._id,
      productName: row.productName,
      modelNoSKU: row.modelNoSKU,
      unit: row.unit,
      openingStock: row.openingStock,
      costPrice: row.costPrice,
      salePrice: row.salePrice,
      discount: row.discount,
      finalPrice: row.finalPrice,
      productGroupName: row.productGroupName,
      productGroupId: row.productGroupId,
      serialNo: row.isSerialTracking,
    };

    this.showEditProductModal = true;
  }

  closeEditProductModal(): void {
    this.showEditProductModal = false;
    this.editingRowIndex = -1;
    this.editFormData = {
      productId: '',
      openingStock: 0,
      productName: '',
      modelNoSKU: '',
      unit: '',
      costPrice: 0,
      salePrice: 0,
      discount: 0,
      finalPrice: 0,
      productGroupName: '',
      productGroupId: '',
      serialNo: false,
    };
  }

  updateFinalPriceInEdit(): void {
    this.editFormData.finalPrice = this.calculateFinalPrice(
      this.editFormData.salePrice,
      this.editFormData.discount,
    );
  }

  saveProductEdit(): void {
    if (this.editingRowIndex === -1) return;

    const row = this.productRows[this.editingRowIndex];

    // Update the row data
    row.productName = this.editFormData.productName;
    row.modelNoSKU = this.editFormData.modelNoSKU;
    row.unit = this.editFormData.unit;
    row.openingStock = this.editFormData.openingStock;
    row.costPrice = this.editFormData.costPrice;
    row.salePrice = this.editFormData.salePrice;
    row.discount = this.editFormData.discount;
    row.finalPrice = this.editFormData.finalPrice;
    row.productGroupName = this.editFormData.productGroupName;
    row.productGroupId = this.editFormData.productGroupId;
    row.isSerialTracking = this.editFormData.serialNo;

    // Update product via API
    const productPayload = {
      itemGroupName: this.editFormData.productGroupName,
      item_Name: this.editFormData.productName,
      item_Description: `${this.editFormData.productName} - ${this.editFormData.modelNoSKU}`,
      actual_item_price: this.editFormData.costPrice,
      selling_item_price: this.editFormData.salePrice,
      item_discount_price: this.editFormData.discount,
      item_final_price: this.editFormData.finalPrice,
      modelNoSKU: this.editFormData.modelNoSKU,
      serialNo: this.editFormData.serialNo,
      unit: this.editFormData.unit,
      isActive: row.status === 'Active',
    };

    this.services.edit_item(row._id, productPayload).subscribe({
      next: (itemRes: any) => {
        this.showNotificationMessage('Product updated successfully!', 'success');
        this.closeEditProductModal();
        this.getProducts();
        this.updateTotalSale();
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.showNotificationMessage(
          err.error?.message || 'Failed to update product details',
          'error'
        );
      },
    });
  }

  onQuantityChange(index: number): void {
    const row = this.productRows[index];
    if (row.quantity < 0) row.quantity = 0;

    // Check if quantity exceeds current stock
    if (row.quantity > row.currentStock) {
      row.quantity = row.currentStock;
      this.showNotificationMessage(
        `Cannot sell more than available stock (${row.currentStock})`,
        'error'
      );
    }

    row.totalAfter = row.currentStock - row.quantity;

    if (row.barcodes.length > row.quantity) {
      row.barcodes = row.barcodes.slice(0, row.quantity);
    }
    row.barcodeSaved = false;

    this.updateTotalSale();
  }

  updateTotalSale(): void {
    let total = 0;
    this.productRows.forEach((row) => {
      if (row._id && row.quantity > 0) {
        total += row.salePrice * row.quantity;
      }
    });
    this.stockOutData.Total_sale = parseFloat(total.toFixed(2));
  }

  removeProductRow(index: number): void {
    this.productRows.splice(index, 1);
    if (this.productRows.length === 0) {
      this.addProductRow();
    }
    this.updateTotalSale();
  }

  openBarcodeModal(index: number): void {
    const row = this.productRows[index];
    if (!row._id) {
      this.showNotificationMessage('Please select a product first', 'error');
      return;
    }
    if (row.quantity <= 0) {
      this.showNotificationMessage('Please enter quantity greater than 0', 'error');
      return;
    }

    // Barcode is optional now, don't check for serial tracking
    this.showBarcodeModalIndex = index;
  }

  closeBarcodeModal(): void {
    this.showBarcodeModalIndex = -1;
  }

  addBarcode(index: number): void {
    const row = this.productRows[index];
    if (!row.newBarcode.trim()) {
      this.showNotificationMessage('Please enter a barcode', 'error');
      return;
    }

    if (row.barcodes.includes(row.newBarcode.trim())) {
      this.showNotificationMessage('Barcode already exists', 'error');
      return;
    }

    row.barcodes.push(row.newBarcode.trim());
    row.newBarcode = '';
  }

  removeBarcode(rowIndex: number, barcodeIndex: number): void {
    this.productRows[rowIndex].barcodes.splice(barcodeIndex, 1);
  }

  saveBarcodes(index: number): void {
    const row = this.productRows[index];
    if (!row._id) return;

    // Barcodes are optional now, so no need to check if length matches quantity
    // Save whatever barcodes are provided
    const payload = {
      barcode_serila: row.barcodes,
      stockInId: null,
      stockoutId: this.currentStockOutId,
    };

    // If no barcodes, just mark as saved
    if (row.barcodes.length === 0) {
      row.barcodeSaved = true;
      this.showNotificationMessage('No barcodes to save (barcodes are optional)', 'info');
      this.showBarcodeModalIndex = -1;
      return;
    }

    this.savingBarcodes = true;
    this.services.add_barcode_serillla(row._id, payload).subscribe({
      next: (res: any) => {
        this.savingBarcodes = false;
        row.barcodeSaved = true;
        this.showNotificationMessage('Barcodes saved successfully!', 'success');
        this.showBarcodeModalIndex = -1;
      },
      error: (err) => {
        this.savingBarcodes = false;
        console.error(err);
        this.showNotificationMessage(
          err.error?.message || 'Failed to save barcodes',
          'error'
        );
      },
    });
  }

  isFormValid(): boolean {
    if (!this.stockOutData.stockOutCategoryId) {
      return false;
    }

    if (!this.stockOutData.stockOutDate) {
      return false;
    }

    // Check if at least one product is added with quantity > 0
    const validRows = this.productRows.filter((row) => row._id && row.quantity > 0);
    if (validRows.length === 0) {
      return false;
    }

    // Check if quantity exceeds current stock
    for (const row of validRows) {
      if (row.quantity > row.currentStock) {
        return false;
      }
    }

    // No barcode validation - barcodes are optional
    return true;
  }

  submitStockOut(): void {
    if (!this.isFormValid()) {
      this.showNotificationMessage(
        'Please fill all required fields and add at least one product with valid quantity',
        'error'
      );
      return;
    }

    this.submitting = true;
    this.error = null;

    // Filter only valid rows with product ID and quantity > 0
    const validRows = this.productRows.filter((row) => row._id && row.quantity > 0);

    if (validRows.length === 0) {
      this.showNotificationMessage('Please add at least one product with quantity', 'error');
      this.submitting = false;
      return;
    }

    // Calculate total sale
    const totalSale = validRows.reduce((total, row) => {
      return total + row.salePrice * row.quantity;
    }, 0);

    // Prepare payload
    const payload = {
      ...this.stockOutData,
      Total_sale: parseFloat(totalSale.toFixed(2)),
      itemId: validRows.map((row) => row._id),
      quantity: validRows.map((row) => row.quantity),
    };

    console.log('Submitting Stock Out with payload:', payload);

    this.stockOutService.stockOut(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.stockOutSubmitted = true;

        if (res.data && res.data._id) {
          this.currentStockOutId = res.data._id;
          this.stockOutNumber = res.data.stockOutNumber || `STOCKOUT-${new Date().getTime()}`;
        }

        this.showNotificationMessage(
          `Stock Out created successfully! Stock Out Number: ${this.stockOutNumber}`,
          'success'
        );

        // Reset barcode saved status for all products
        validRows.forEach((row) => {
          row.barcodeSaved = false;
        });

        // Reset form after successful submission
        setTimeout(() => {
          this.resetForm();
          this.toggleMainForm();
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating Stock Out:', err);
        
        // Handle specific error codes
        let errorMessage = 'Failed to create stock out';
        if (err.status === 400) {
          errorMessage = err.error?.message || 'Bad request. Please check your data.';
        } else if (err.status === 409) {
          errorMessage = 'Invoice number already exists';
        } else if (err.status === 404) {
          errorMessage = 'One or more products not found';
        }
        
        this.showNotificationMessage(errorMessage, 'error');
        this.submitting = false;
      },
    });
  }

  completeStockOut(): void {
    // Removed as per request - single submit button handles everything
    this.resetForm();
    this.toggleMainForm();
    this.showNotificationMessage('Stock Out process completed successfully!', 'success');
  }

  resetForm(): void {
    this.stockOutData = {
      Total_sale: 0,
      stockOutDate: new Date().toISOString().split('T')[0],
      stockOutCategoryId: '',
      stockOutCategoryName: '',
      invoiceNo: '',
      notes: '',
    };
    this.productRows = [];
    this.currentStockOutId = null;
    this.stockOutNumber = null;
    this.stockOutSubmitted = false;
    this.error = null;
    this.successMessage = null;
    this.categorySearch = '';
    this.filteredCategories = [...this.stockOutCategories];
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getBarcodeButtonClass(row: any): string {
    if (!row._id || row.quantity <= 0) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';
    }

    if (row.barcodeSaved) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition text-sm font-medium';
    } else if (row.barcodes.length > 0) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition text-sm font-medium';
    } else {
      return 'flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition text-sm font-medium';
    }
  }

  getBarcodeButtonTitle(row: any): string {
    if (!row._id) return 'Select product first';
    if (row.quantity <= 0) return 'Enter quantity first';
    if (row.barcodeSaved) return `Barcodes saved: ${row.barcodes.length} (optional)`;
    return `Add barcodes: ${row.barcodes.length} (optional)`;
  }

  toggleGroupDropdown(): void {
    this.showGroupDropdown = !this.showGroupDropdown;
  }

  selectGroup(group: ItemGroup): void {
    this.editFormData.productGroupName = group.itemGroupName;
    this.editFormData.productGroupId = group._id;
    this.showGroupDropdown = false;
  }

  get filteredGroups(): ItemGroup[] {
    if (!this.groupSearchTerm) {
      return this.productGroups;
    }

    return this.productGroups.filter((group) =>
      group.itemGroupName.toLowerCase().includes(this.groupSearchTerm.toLowerCase()),
    );
  }

  tableheader: string[] = [
    'Item Name *',
    'SKU/Model',
    'Unit',
    'Status',
    'Cost Price',
    'Sale Price',
    'Discount',
    'Final Price',
    'Opening',
    'Remaining',
    'Stock Out *',
    'Total After',
    'Barcodes',
    'Actions',
  ];
}