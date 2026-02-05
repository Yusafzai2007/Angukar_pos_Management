import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StockInStockInService } from '../../api_service/stock-in';
import { ActivatedRoute } from '@angular/router';
import {
  edit_stocuout_StockOutApiResponse,
  edit_stocuout_StockOutResponseType,
  edit_stocuout_StockOutItemType,
  edit_stocuout_ProductBarcodeType,
  EditProductPayload,
} from '../../Typescript/edit_stockout';
import { ServiceData } from '../../create_account/api_service/service-data';
import { ItemGroup } from '../../Typescript/product_group';
import { StockApiResponse, StockItem } from '../../Typescript/add_product/add_product';
import { StockOutCategoryResponse } from '../../Typescript/category/stockout_category';

@Component({
  selector: 'app-edit-stockout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-stockout.html',
  styleUrl: './edit-stockout.css',
})
export class EditStockout implements OnInit {
  // Data
  editStockOutData!: edit_stocuout_StockOutResponseType;
  stockOutCategories: any[] = [];
  filteredCategories: any[] = [];
  productGroups: ItemGroup[] = [];
  productsList: StockItem[] = [];
  filteredProducts: StockItem[] = [];

  // UI states
  loading: boolean = false;
  submitting: boolean = false;
  savingBarcodes: boolean = false;

  // Form visibility
  showCategoryDropdown: boolean = false;
  showGroupDropdown: boolean = false;
  showBarcodeModalIndex: number = -1;
  showEditProductModal: boolean = false;
  showProductSearchModal: boolean = false;

  // Search
  categorySearch: string = '';
  groupSearchTerm: string = '';
  productSearchTerm: string = '';

  // Current editing row index
  editingRowIndex: number = -1;
  selectedRowIndex: number = -1;

  // Notification state
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'success';

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
    barcodeSaved: boolean;
    stockRecordId?: string;
    isSerialTracking: boolean;
    productGroupName: string;
    productGroupId: string;
    originalStockAdded: number;
    barcodeData: edit_stocuout_ProductBarcodeType[];
    isNewProduct: boolean;
  }> = [];

  // Main form data
  stockOutData = {
    Total_sale: 0,
    stockOutDate: '',
    stockOutCategoryId: '',
    stockOutCategoryName: '',
    invoiceNo: '',
    isActive: true,
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
    serialNo: false,
    barcodes: [] as string[],
  };

  tableHeader: string[] = [
    'Item Name *',
    'SKU/Model',
    'Unit',
    'Status',
    'Cost Price',
    'Opening',
    'Remaining',
    'Original Qty',
    'New Qty *',
    'Barcodes',
    'Actions',
  ];

  constructor(
    private service: StockInStockInService,
    private active: ActivatedRoute,
    private router: Router,
    private services: ServiceData,
  ) {}

  ngOnInit(): void {
    const stockOutId = this.active.snapshot.paramMap.get('id');
    console.log('Stock Out ID:', stockOutId);

    if (stockOutId) {
      this.loading = true;
      this.service.Id_stockOut(stockOutId).subscribe({
        next: (res: edit_stocuout_StockOutApiResponse) => {
          console.log('Stock Out Response:', res);
          if (res.success && res.data) {
            this.editStockOutData = res.data;
            console.log('editStockOutData', this.editStockOutData);
            this.loadStockOutData();
            this.getStockOutCategories();
            this.loadProductGroups();
            this.getAllProducts();
          } else {
            this.showNotificationMessage('Failed to load stock out data', 'error');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading stock out data:', err);
          this.showNotificationMessage('Failed to load stock out data', 'error');
          this.loading = false;
        },
      });
    }
  }

  // Notification system
  showNotificationMessage(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
  ): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  closeNotification(): void {
    this.showNotification = false;
  }

  // Go back to Stock Out list
  goBack(): void {
    this.router.navigate(['/admin/stockout']);
  }

  // Load all products for search
  getAllProducts(): void {
    this.service.products().subscribe({
      next: (res: StockApiResponse) => {
        this.productsList = res.data;
        this.filteredProducts = [...this.productsList];
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.showNotificationMessage('Failed to load products', 'error');
      },
    });
  }

  // Load stock out data
  loadStockOutData(): void {
    // Populate main form data
    const stockDate = this.editStockOutData.stockOutDate;
    const formattedDate = stockDate ? stockDate.split('T')[0] : '';

    this.stockOutData = {
      Total_sale: this.editStockOutData.Total_sale,
      stockOutDate: formattedDate,
      stockOutCategoryId: this.editStockOutData.stockOutCategoryId._id,
      stockOutCategoryName: this.editStockOutData.stockOutCategoryId.stockoutCategoryName,
      invoiceNo: this.editStockOutData.invoiceNo || '',
      isActive: this.editStockOutData.isActive,
    };

    this.categorySearch = this.editStockOutData.stockOutCategoryId.stockoutCategoryName;

    // Populate product rows from existing data
    this.productRows = [];

    // Ensure itemId is an array
    const items = Array.isArray(this.editStockOutData.itemId) ? this.editStockOutData.itemId : [];
    const quantities = Array.isArray(this.editStockOutData.quantity)
      ? this.editStockOutData.quantity
      : [];

    items.forEach((item: edit_stocuout_StockOutItemType, index: number) => {
      const barcodes = item.barcodes?.map((barcode) => barcode.barcode_serila) || [];
      const quantity = quantities[index] || 0;

      this.productRows.push({
        _id: item._id,
        productName: item.item_Name,
        modelNoSKU: item.modelNoSKU,
        unit: item.unit,
        status: item.isActive ? 'Active' : 'Inactive',
        costPrice: item.actual_item_price,
        salePrice: item.selling_item_price,
        discount: item.item_discount_price,
        finalPrice: item.item_final_price,
        openingStock: item.openingStock || 0,
        currentStock: item.remainingStock || 0,
        quantity: quantity,
        totalAfter: (item.remainingStock || 0) - quantity,
        barcodes: barcodes,
        newBarcode: '',
        barcodeSaved: barcodes.length > 0,
        isSerialTracking: item.serialNo,
        productGroupName: item.itemGroupId?.itemGroupName || '',
        productGroupId: item.itemGroupId?._id || '',
        originalStockAdded: quantity,
        barcodeData: item.barcodes || [],
        isNewProduct: false,
      });
    });

    this.updateTotalPrice();
  }

  getStockOutCategories(): void {
    this.service.get_stockout_category().subscribe({
      next: (res: StockOutCategoryResponse) => {
        this.stockOutCategories = res.data.filter((category) => category.isActive);
        this.filteredCategories = [...this.stockOutCategories];
      },
      error: (err) => {
        console.error('Error loading stock out categories:', err);
        this.showNotificationMessage('Failed to load categories', 'error');
      },
    });
  }

  loadProductGroups(): void {
    this.services.get_product_group().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.productGroups = res.data.filter((group: ItemGroup) => group.isActive);
        }
      },
      error: (err) => {
        console.error('Error loading product groups:', err);
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
    this.filteredCategories = this.stockOutCategories.filter((category) =>
      category.stockoutCategoryName.toLowerCase().includes(searchTerm),
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

  // Add new product row
  addNewProductRow(): void {
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
      barcodeSaved: false,
      stockRecordId: '',
      isSerialTracking: false,
      productGroupName: '',
      productGroupId: '',
      originalStockAdded: 0,
      barcodeData: [],
      isNewProduct: true,
    });

    this.showNotificationMessage('New product row added. Please select a product.', 'info');
  }

  // Open product search modal
  openProductSearchModal(index: number): void {
    const row = this.productRows[index];
    if (!row.isNewProduct) {
      this.showNotificationMessage(
        'Cannot change existing product. Add a new row for new product.',
        'warning',
      );
      return;
    }

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

  // Check if product is already selected
  isProductSelected(productId: string): boolean {
    return this.productRows.some((row) => row._id === productId);
  }

  getProductItemClass(productId: string): string {
    const baseClass = 'p-4 border rounded-lg cursor-pointer transition';
    if (this.isProductSelected(productId)) {
      return `${baseClass} bg-blue-50 border-blue-300`;
    }
    return `${baseClass} border-gray-200 hover:border-blue-300 hover:bg-blue-50`;
  }

  // Select product from modal
  selectProductFromModal(product: StockItem): void {
    if (this.selectedRowIndex === -1) return;

    const productId = product.product._id;

    if (this.isProductSelected(productId)) {
      this.showNotificationMessage('This product is already selected in another row', 'warning');
      return;
    }

    this.fillProductDetails(this.selectedRowIndex, product);
    this.closeProductSearchModal();
  }

  // Fill product details
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
    row.finalPrice = this.calculateFinalPrice(row.salePrice, row.discount);
    row.openingStock = product.totalOpeningStock;
    row.currentStock = product.totalRemainingStock;
    row.quantity = 1;
    row.totalAfter = row.currentStock - row.quantity;

    row.isSerialTracking =
      typeof productData.serialNo === 'string'
        ? productData.serialNo.toLowerCase() === 'true'
        : Boolean(productData.serialNo);

    row.stockRecordId = product._id;
    row.originalStockAdded = 0;

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

    row.barcodes = [];
    row.barcodeSaved = false;
    row.isNewProduct = false;

    this.updateTotalPrice();
    this.showNotificationMessage(`Product "${row.productName}" selected`, 'success');
  }

  calculateFinalPrice(salePrice: number, discount: number): number {
    const finalPrice = salePrice - discount;
    return finalPrice > 0 ? parseFloat(finalPrice.toFixed(2)) : 0;
  }

  // Quantity change handler
  onQuantityChange(index: number): void {
    const row = this.productRows[index];
    if (row.quantity < 0) row.quantity = 0;

    // Check if quantity exceeds available stock
    if (row.quantity > row.currentStock) {
      this.showNotificationMessage(
        `Quantity cannot exceed available stock (${row.currentStock})`,
        'warning',
      );
      row.quantity = row.currentStock;
    }

    if (row._id) {
      row.totalAfter = row.currentStock - row.quantity;
    }

    this.updateTotalPrice();
  }

  updateTotalPrice(): void {
    let total = 0;
    this.productRows.forEach((row) => {
      if (row._id && row.quantity > 0) {
        total += row.salePrice * row.quantity;
      }
    });
    this.stockOutData.Total_sale = parseFloat(total.toFixed(2));
  }

  // Remove product row
  removeProductRow(index: number): void {
    if (this.productRows.length === 1) {
      this.showNotificationMessage('Cannot remove the last product row', 'warning');
      return;
    }

    this.productRows.splice(index, 1);
    this.updateTotalPrice();
    this.showNotificationMessage('Product removed from list', 'info');
  }

  // Open edit product modal
  openEditProductModal(index: number): void {
    const row = this.productRows[index];
    if (!row._id) {
      this.showNotificationMessage('Please select a product first', 'warning');
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
      barcodes: [...row.barcodes],
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
      barcodes: [],
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
    row.barcodes = [...this.editFormData.barcodes];

    // Update product via API
    const productPayload: EditProductPayload = {
      itemGroupId: this.editFormData.productGroupId,
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
        this.updateTotalPrice();
        this.getAllProducts();
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.showNotificationMessage(
          err.error?.message || 'Failed to update product details',
          'error',
        );
      },
    });
  }

  // Barcode Management
  openBarcodeModal(index: number): void {
    const row = this.productRows[index];
    if (!row._id) {
      this.showNotificationMessage('Please select a product first', 'warning');
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
      this.showNotificationMessage('Please enter a barcode', 'warning');
      return;
    }

    if (row.barcodes.includes(row.newBarcode.trim())) {
      this.showNotificationMessage('Barcode already exists', 'warning');
      return;
    }

    row.barcodes.push(row.newBarcode.trim());
    row.newBarcode = '';
    row.barcodeSaved = false;
  }

  removeBarcode(rowIndex: number, barcodeIndex: number): void {
    this.productRows[rowIndex].barcodes.splice(barcodeIndex, 1);
    this.productRows[rowIndex].barcodeSaved = false;
  }

  saveBarcodes(index: number): void {
    const row = this.productRows[index];
    if (!row._id) return;

    const payload = {
      barcode_serila: row.barcodes,
      stockInId: null,
      stockoutId: this.editStockOutData._id,
    };

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
        this.showNotificationMessage(err.error?.message || 'Failed to save barcodes', 'error');
      },
    });
  }
hasQuantityError: boolean = false;

  // Form validation
  isFormValid(): boolean {
    if (!this.stockOutData.stockOutCategoryId) {
      return false;
    }

    if (!this.stockOutData.stockOutDate) {
      return false;
    }

    const validRows = this.productRows.filter((row) => row._id && row.quantity > 0);
    if (validRows.length === 0) {
      return false;
    }


    for (const row of validRows) {
    if (row.quantity > row.currentStock) {
  this.showNotificationMessage(
      `Quantity cannot exceed available stock (${row.currentStock})`,
      'error'
    );      return false;
    }
  }

    // Check if any quantity exceeds available stock
    for (const row of validRows) {
      if (row.quantity > row.currentStock) {
        this.showNotificationMessage(
          `Quantity for ${row.productName} exceeds available stock`,
          'error',
        );
        return false;
      }
    }

    return true;
  }

  // Update Stock Out
  updateStockOut(): void {
    if (!this.isFormValid()) {
      this.showNotificationMessage(
        'Please fill all required fields and add at least one product with valid quantity',
        'error',
      );
      return;
    }

    const productIds = this.productRows
      .filter((row) => row._id && row.quantity > 0)
      .map((row) => row._id);

    const uniqueIds = [...new Set(productIds)];
    if (uniqueIds.length !== productIds.length) {
      this.showNotificationMessage('Duplicate products found. Please remove duplicates.', 'error');
      return;
    }

    this.submitting = true;

    const validRows = this.productRows.filter((row) => row._id && row.quantity > 0);

    const totalSale = validRows.reduce((total, row) => {
      return total + row.salePrice * row.quantity;
    }, 0);

    const payload = {
      ...this.stockOutData,
      Total_sale: parseFloat(totalSale.toFixed(2)),
      itemId: validRows.map((row) => row._id),
      quantity: validRows.map((row) => row.quantity),
    };

    console.log('Updating Stock Out with payload:', payload);

    const stockOutId = this.editStockOutData._id;
    this.service.update_stockOut(stockOutId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.showNotificationMessage('Stock Out updated successfully!', 'success');

        setTimeout(() => {
          this.router.navigate(['/admin/stockout']);
        }, 1000);
      },
      error: (err) => {
        console.error('Error updating Stock Out:', err);

        let errorMessage = 'Failed to update stock out';
        if (err.status === 400) {
          errorMessage = err.error?.message || 'Bad request. Please check your data.';
        } else if (err.status === 404) {
          errorMessage = 'Stock out record not found';
        } else if (err.status === 409) {
          errorMessage = 'Invoice number already exists';
        }

        this.showNotificationMessage(errorMessage, 'error');
        this.submitting = false;
      },
    });
  }

  // Delete Stock Out
  deleteStockOut(): void {
    if (
      confirm(
        'Are you sure you want to delete this stock out record? This action cannot be undone.',
      )
    ) {
      const stockOutId = this.editStockOutData._id;
      this.service.delete_stockOut(stockOutId).subscribe({
        next: (res: any) => {
          this.showNotificationMessage('Stock Out deleted successfully!', 'success');

          setTimeout(() => {
            this.router.navigate(['/admin/stockout']);
          }, 1000);
        },
        error: (err) => {
          console.error('Error deleting Stock Out:', err);
          this.showNotificationMessage('Failed to delete stock out', 'error');
        },
      });
    }
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
    if (!row._id) {
      return 'bg-blue-100 text-blue-700 opacity-50 cursor-not-allowed';
    }

    if (!row.isSerialTracking) {
      return 'bg-gray-100 text-gray-500 hover:bg-gray-200';
    }

    if (row.barcodeSaved) {
      return 'bg-green-100 text-green-700 hover:bg-green-200';
    } else if (row.barcodes.length > 0) {
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
    } else {
      return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    }
  }

  getBarcodeButtonTitle(row: any): string {
    if (!row._id) return 'Select product first';
    if (!row.isSerialTracking) return 'Serial tracking disabled';
    if (row.barcodeSaved) return `Barcodes saved: ${row.barcodes.length} added`;
    return `Add barcodes: ${row.barcodes.length} added`;
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
}
