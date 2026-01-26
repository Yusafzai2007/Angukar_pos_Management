import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockApiResponse, StockItem, Product } from '../../Typescript/add_product/add_product';
import {  StockInStockInService } from '../../api_service/stock-in';
import { StockInCategory, StockInCategoryResponse } from '../../Typescript/category/stockIn';
import { ServiceData } from '../../create_account/api_service/service-data';
import { ItemGroup } from '../../Typescript/product_group';
import { FetchStockIn } from "../fetch-stock-in/fetch-stock-in";

@Component({
  selector: 'app-stockin',
  standalone: true,
  imports: [CommonModule, FormsModule, FetchStockIn],
  templateUrl: './stockin.html',
  styleUrls: ['./stockin.css']
})
export class Stockin implements OnInit {
  // Data arrays
  productsList: StockItem[] = [];
  filteredProducts: StockItem[] = [];
  stockInCategories: StockInCategory[] = [];
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
  
  // Store the created StockIn ID
  currentStockInId: string | null = null;
  stockInSubmitted: boolean = false;
  stockInNumber: string | null = null;
  
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
  }> = [];

  // Main form data
  stockInData = {
    stcokIn_price: 0,
    stockInDate: new Date().toISOString().split('T')[0],
    stockInCategoryId: '',
    stockInCategoryName: '',
    invoiceNo: '',
    notes: ''
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
    productGroupId: ''
  };

  constructor(private service: StockInStockInService , private services: ServiceData) {}

  ngOnInit(): void {
    this.getProducts();
    this.getStockInCategories();
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

    this.service.products().subscribe({
      next: (res: StockApiResponse) => {
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
      }
    });
  }

  getStockInCategories(): void {
    this.service.get_stockIn_category().subscribe({
      next: (res: StockInCategoryResponse) => {
        this.stockInCategories = res.data.filter(category => category.isActive);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Failed to load categories';
      },
    });
  }

  onCategorySelect(): void {
    const selectedCategory = this.stockInCategories.find(
      cat => cat._id === this.stockInData.stockInCategoryId
    );
    if (selectedCategory) {
      this.stockInData.stockInCategoryName = selectedCategory.stockInCategoryName;
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
      itemGroupId: ''
    });
  }

  resetFormState(): void {
    this.currentStockInId = null;
    this.stockInSubmitted = false;
    this.stockInNumber = null;
    this.successMessage = null;
    this.productRows.forEach(row => {
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
    this.filteredProducts = this.productsList.filter(product => 
      product.product.item_Name.toLowerCase().includes(searchTerm) ||
      product.product.modelNoSKU.toLowerCase().includes(searchTerm)
    );
  }

  selectProductFromModal(product: StockItem): void {
    if (this.selectedRowIndex !== -1) {
      this.fillProductDetails(this.selectedRowIndex, product);
      this.closeProductSearchModal();
    }
  }

  fillProductDetails(index: number, product: StockItem): void {
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
    row.totalAfter = row.currentStock + row.quantity;
    
    this.getProductGroupInfo(productData, row);
    
    const serialNo = productData.serialNo;
    row.isSerialTracking = typeof serialNo === 'string' 
      ? serialNo.toLowerCase() === 'true' 
      : Boolean(serialNo);
    
    row.stockRecordId = product._id;
    row.itemGroupId = productData.itemGroupId;
    
    row.barcodes = [];
    row.barcodeSaved = false;
    
    this.updateTotalPrice();
  }

  calculateFinalPrice(salePrice: number, discount: number): number {
    const finalPrice = salePrice - discount;
    return finalPrice > 0 ? parseFloat(finalPrice.toFixed(2)) : 0;
  }

  getProductGroupInfo(productData: Product, row: any): void {
    if (productData.itemGroupName) {
      row.productGroupName = productData.itemGroupName;
      
      const matchingGroup = this.productGroups.find(
        group => group.itemGroupName === productData.itemGroupName
      );
      if (matchingGroup) {
        row.productGroupId = matchingGroup._id;
      }
    } else if (productData.itemGroupId) {
      const matchingGroup = this.productGroups.find(
        group => group._id === productData.itemGroupId
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
      productGroupId: row.productGroupId
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
      productGroupId: ''
    };
  }

  // Auto-calculate final price when sale price or discount changes in edit modal
  updateFinalPriceInEdit(): void {
    this.editFormData.finalPrice = this.calculateFinalPrice(
      this.editFormData.salePrice,
      this.editFormData.discount
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
      isActive: row.status === 'Active'
    };

    this.services.edit_item(row._id, productPayload).subscribe({
      next: (itemRes: any) => {
        this.successMessage = 'Product updated successfully!';
        this.closeEditProductModal();
        this.getProducts();
        this.updateTotalPrice();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.error = err.error?.message || 'Failed to update product details';
      }
    });
  }

  onQuantityChange(index: number): void {
    const row = this.productRows[index];
    if (row.quantity < 0) row.quantity = 0;
    row.totalAfter = row.currentStock + row.quantity;
    
    if (row.barcodes.length > row.quantity) {
      row.barcodes = row.barcodes.slice(0, row.quantity);
    }
    row.barcodeSaved = false;
    
    this.updateTotalPrice();
  }

  updateTotalPrice(): void {
    let total = 0;
    this.productRows.forEach(row => {
      if (row._id && row.quantity > 0) {
        total += row.costPrice * row.quantity;
      }
    });
    this.stockInData.stcokIn_price = parseFloat(total.toFixed(2));
  }

  removeProductRow(index: number): void {
    this.productRows.splice(index, 1);
    if (this.productRows.length === 0) {
      this.addProductRow();
    }
    this.updateTotalPrice();
  }

  // Barcode Management
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
      stockoutId: null
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
      }
    });
  }

  // Validate form before submission
  isFormValid(): boolean {
    if (!this.stockInData.stockInCategoryId) {
      return false;
    }

    if (!this.stockInData.stockInDate) {
      return false;
    }

    // Check if at least one product is added with quantity > 0
    const validRows = this.productRows.filter(row => row._id && row.quantity > 0);
    if (validRows.length === 0) {
      return false;
    }

    // Check barcode requirements for serial tracking products
    for (const row of validRows) {
      if (row.isSerialTracking && row.barcodes.length < row.quantity && !row.barcodeSaved) {
        return false;
      }
    }

    return true;
  }

  submitStockIn(): void {
    if (!this.isFormValid()) {
      this.error = 'Please fill all required fields and add at least one product with quantity';
      return;
    }

    this.submitting = true;
    this.error = null;
    
    // Filter only valid rows with product ID and quantity > 0
    const validRows = this.productRows.filter(row => row._id && row.quantity > 0);
    
    if (validRows.length === 0) {
      this.error = 'Please add at least one product with quantity';
      this.submitting = false;
      return;
    }

    // Calculate total price
    const totalPrice = validRows.reduce((total, row) => {
      return total + (row.costPrice * row.quantity);
    }, 0);
    
    // Prepare payload
    const payload = {
      ...this.stockInData,
      stcokIn_price: parseFloat(totalPrice.toFixed(2)),
      itemId: validRows.map(row => row._id),
      stockAdded: validRows.map(row => row.quantity)
    };

    console.log('Submitting Stock In with payload:', payload);

    this.service.stockIn(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.stockInSubmitted = true;
        
        if (res.data && res.data._id) {
          this.currentStockInId = res.data._id;
          this.stockInNumber = res.data.stockInNumber || `STOCK-${new Date().getTime()}`;
          
          // Update stock record IDs for barcode saving
          validRows.forEach(row => {
            if (row.stockRecordId) {
              // If you need to update barcodes with stockInId, do it here
            }
          });
        }
        
        this.successMessage = `Stock In created successfully! Stock In Number: ${this.stockInNumber}`;
        
        // Reset barcode saved status for serial tracking products
        validRows.forEach(row => {
          if (row.isSerialTracking) {
            row.barcodeSaved = false;
          }
        });
        
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error creating Stock In:', err);
        this.error = err.error?.message || 'Failed to create stock in';
        this.submitting = false;
      },
    });
  }

  completeStockIn(): void {
    const serialProducts = this.productRows.filter(row => 
      row._id && row.quantity > 0 && row.isSerialTracking
    );
    
    const unsavedSerialProducts = serialProducts.filter(row => !row.barcodeSaved);
    
    if (unsavedSerialProducts.length > 0) {
      const productNames = unsavedSerialProducts.map(row => row.productName).join(', ');
      const confirmMessage = `The following products require barcodes but haven't been saved:\n${productNames}\n\nDo you want to continue anyway?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }
    
    this.resetForm();
    this.toggleMainForm();
    this.successMessage = 'Stock In process completed successfully!';
    
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  resetForm(): void {
    this.stockInData = {
      stcokIn_price: 0,
      stockInDate: new Date().toISOString().split('T')[0],
      stockInCategoryId: '',
      stockInCategoryName: '',
      invoiceNo: '',
      notes: ''
    };
    this.productRows = [];
    this.currentStockInId = null;
    this.stockInNumber = null;
    this.stockInSubmitted = false;
    this.error = null;
    this.successMessage = null;
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getBarcodeButtonClass(row: any): string {
    if (!row._id || row.quantity <= 0) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';
    }
    
    if (!row.isSerialTracking) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg transition text-sm font-medium cursor-not-allowed';
    }
    
    if (row.barcodeSaved) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition text-sm font-medium';
    } else if (row.barcodes.length === row.quantity) {
      return 'flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition text-sm font-medium';
    } else {
      return 'flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition text-sm font-medium';
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
    
    return this.productGroups.filter(group =>
      group.itemGroupName.toLowerCase().includes(this.groupSearchTerm.toLowerCase())
    );
  }
}