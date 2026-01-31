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

  // Current editing row index
  editingRowIndex: number = -1;
  selectedRowIndex: number = -1;

  // Search
  productSearchTerm: string = '';
  groupSearchTerm: string = '';

  // Store the created StockOut ID
  currentStockOutId: string | null = null;
  stockOutSubmitted: boolean = false;
  stockOutNumber: string | null = null;

  // Product rows array
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
    lineTotal: number;
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

  // Edit form data
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
      },
      error: (err) => {
        console.error('Error loading stock out categories:', err);
        this.error = 'Failed to load categories';
      },
    });
  }

  onCategorySelect(): void {
    const selectedCategory = this.stockOutCategories.find(
      (cat) => cat._id === this.stockOutData.stockOutCategoryId,
    );
    if (selectedCategory) {
      this.stockOutData.stockOutCategoryName = selectedCategory.stockoutCategoryName;
    }
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
      lineTotal: 0,
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
    row.lineTotal = row.salePrice * row.quantity;

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
      this.error = 'Please select a product first';
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
      serialNo: row.isSerialTracking,
      unit: this.editFormData.unit,
      isActive: row.status === 'Active',
    };

    this.services.edit_item(row._id, productPayload).subscribe({
      next: (itemRes: any) => {
        this.successMessage = 'Product updated successfully!';
        this.closeEditProductModal();
        this.getProducts();
        this.updateTotalSale();

        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.error = err.error?.message || 'Failed to update product details';
      },
    });
  }

  onQuantityChange(index: number): void {
    const row = this.productRows[index];
    if (row.quantity < 0) row.quantity = 0;

    // Check if quantity exceeds current stock
    if (row.quantity > row.currentStock) {
      row.quantity = row.currentStock;
      this.error = `Cannot sell more than available stock (${row.currentStock})`;
      setTimeout(() => (this.error = null), 3000);
    }

    row.totalAfter = row.currentStock - row.quantity;
    row.lineTotal = row.salePrice * row.quantity;

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
        total += row.finalPrice * row.quantity;
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
      this.error = 'Please select a product first';
      return;
    }
    if (row.quantity <= 0) {
      this.error = 'Please enter quantity greater than 0';
      return;
    }

    if (!row.isSerialTracking) {
      this.error = 'This product does not require barcodes (Serial tracking is disabled)';
      return;
    }

    this.showBarcodeModalIndex = index;
  }

  closeBarcodeModal(): void {
    this.showBarcodeModalIndex = -1;
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

  removeBarcode(rowIndex: number, barcodeIndex: number): void {
    this.productRows[rowIndex].barcodes.splice(barcodeIndex, 1);
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
      stockoutId: this.currentStockOutId,
    };

    this.savingBarcodes = true;
    this.services.add_barcode_serillla(row._id, payload).subscribe({
      next: (res: any) => {
        this.savingBarcodes = false;
        row.barcodeSaved = true;
        this.successMessage = 'Barcodes saved successfully!';
        this.showBarcodeModalIndex = -1;

        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        this.savingBarcodes = false;
        console.error(err);
        this.error = err.error?.message || 'Failed to save barcodes';
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

    // Check barcode requirements for serial tracking products
    for (const row of validRows) {
      if (row.isSerialTracking && row.barcodes.length < row.quantity && !row.barcodeSaved) {
        return false;
      }
    }

    return true;
  }

  submitStockOut(): void {
    if (!this.isFormValid()) {
      this.error =
        'Please fill all required fields and add at least one product with valid quantity';
      return;
    }

    this.submitting = true;
    this.error = null;

    // Filter only valid rows with product ID and quantity > 0
    const validRows = this.productRows.filter((row) => row._id && row.quantity > 0);

    if (validRows.length === 0) {
      this.error = 'Please add at least one product with quantity';
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

        this.successMessage = `Stock Out created successfully! Stock Out Number: ${this.stockOutNumber}`;

        // Reset barcode saved status for serial tracking products
        validRows.forEach((row) => {
          if (row.isSerialTracking) {
            row.barcodeSaved = false;
          }
        });

        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error creating Stock Out:', err);
        this.error = err.error?.message || 'Failed to create stock out';
        this.submitting = false;
      },
    });
  }

  completeStockOut(): void {
    const serialProducts = this.productRows.filter(
      (row) => row._id && row.quantity > 0 && row.isSerialTracking,
    );

    const unsavedSerialProducts = serialProducts.filter((row) => !row.barcodeSaved);

    if (unsavedSerialProducts.length > 0) {
      const productNames = unsavedSerialProducts.map((row) => row.productName).join(', ');
      const confirmMessage = `The following products require barcodes but haven't been saved:\n${productNames}\n\nDo you want to continue anyway?`;

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    this.resetForm();
    this.toggleMainForm();
    this.successMessage = 'Stock Out process completed successfully!';

    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
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
      return 'flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';
    }

    if (!row.isSerialTracking) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg transition text-sm font-medium cursor-not-allowed';
    }

    if (row.barcodeSaved) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition text-sm font-medium';
    } else if (row.barcodes.length === row.quantity) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition text-sm font-medium';
    } else {
      return 'flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition text-sm font-medium';
    }
  }

  getBarcodeButtonTitle(row: any): string {
    if (!row._id) return 'Select product first';
    if (row.quantity <= 0) return 'Enter quantity first';
    if (!row.isSerialTracking) return 'Serial tracking disabled';
    if (row.barcodeSaved) return `Barcodes saved: ${row.barcodes.length}/${row.quantity}`;
    return `Add/Edit barcodes: ${row.barcodes.length}/${row.quantity}`;
  }

  generateBarcodesForCurrentProduct(): void {
    if (this.showBarcodeModalIndex === -1) return;

    const row = this.productRows[this.showBarcodeModalIndex];
    const needed = row.quantity - row.barcodes.length;

    if (needed <= 0) {
      this.error = 'No more barcodes needed';
      return;
    }

    for (let i = 1; i <= needed; i++) {
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);
      const newBarcode = `${row.modelNoSKU}-${timestamp}-${randomNum.toString().padStart(4, '0')}`;

      if (!row.barcodes.includes(newBarcode)) {
        row.barcodes.push(newBarcode);
      }
    }
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
    'Line Total',
    'Barcodes',
    'Actions',
  ];
}
