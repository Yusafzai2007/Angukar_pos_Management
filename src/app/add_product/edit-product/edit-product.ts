import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceData, EditProductPayload, EditStockPayload, EditBarcodePayload, CreateBarcodePayload } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct implements OnInit {
  productId!: string | null;
  stockRecordId!: string | null;
  
  // Product data from API
  productData: any = null;
  product: any = null;
  barcodes: any[] = [];
  
  // Form model for editing
  editProduct = {
    itemGroupName: '',
    item_Name: '',
    item_Description: '',
    actual_item_price: 0,
    selling_item_price: 0,
    item_discount_price: 0,
    item_final_price: 0,
    modelNoSKU: '',
    serialNo: false,
    unit: 'piece',
    isActive: true,
    openingStock: 0,
    remainingStock: 0
  };
  
  // Original values for comparison
  originalProduct: any = null;
  originalOpeningStock: number = 0;
  
  // Barcode management
  barcodeInput: string = '';
  
  // Separate arrays for existing and new barcodes
  existingBarcodes: Array<{
    _id: string, 
    barcode_serila: string, 
    isEditing?: boolean, 
    tempValue?: string,
    isChanged?: boolean
  }> = [];
  
  newBarcodes: string[] = [];
  
  // UI state
  isLoading = false;
  isSaving = false;
  isOpen = false;
  selectedItem = '';
  get_product: any[] = [];
  showDeleteConfirm = false;
  barcodeToDelete: string | null = null;
  showAddBarcodeModal = false;
  bulkBarcodeInput: string = '';

  constructor(
    private service: ServiceData,
    private active: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = this.active.snapshot.paramMap.get('id');
    console.log('Route ID:', this.productId);

    if (this.productId) {
      this.loadProductData();
      this.loadItemGroups();
    }
  }

  loadProductData(): void {
    this.service.edit_product(this.productId!).subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.length > 0) {
          this.productData = res.data[0];
          this.product = res.data[0].product;
          this.barcodes = res.data[0].barcodes;
          
          if (this.productData._id) {
            this.stockRecordId = this.productData._id;
            console.log('Stock Record ID found:', this.stockRecordId);
          }
          
          // Populate existing barcodes
          this.existingBarcodes = this.barcodes.map(b => ({
            _id: b._id,
            barcode_serila: b.barcode_serila,
            isEditing: false,
            tempValue: b.barcode_serila,
            isChanged: false
          }));

          // Populate edit form with current data
          this.editProduct = {
            itemGroupName: this.product.itemGroupName || '',
            item_Name: this.product.item_Name || '',
            item_Description: this.product.item_Description || '',
            actual_item_price: this.product.actual_item_price || 0,
            selling_item_price: this.product.selling_item_price || 0,
            item_discount_price: this.product.item_discount_price || 0,
            item_final_price: this.product.item_final_price || 0,
            modelNoSKU: this.product.modelNoSKU || '',
            serialNo: this.product.serialNo || false,
            unit: this.product.unit || 'piece',
            isActive: this.product.isActive !== undefined ? this.product.isActive : true,
            openingStock: this.productData.totalOpeningStock || 0,
            remainingStock: this.productData.totalRemainingStock || 0
          };

          // Store original values
          this.originalProduct = { ...this.editProduct };
          this.originalOpeningStock = this.editProduct.openingStock;

          // Get item group name
          if (this.product.itemGroupId) {
            this.getProductGroupName();
          }
        }
      },
      error: (err) => console.error('Error loading product:', err),
    });
  }

  loadItemGroupName(): void {
    this.service.get_product_group().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const group = res.data.find((g: any) => g._id === this.product.itemGroupId);
          if (group) {
            this.editProduct.itemGroupName = group.itemGroupName;
            this.selectedItem = group.itemGroupName;
          }
        }
      },
      error: (err) => console.error('Error loading item group:', err),
    });
  }

  loadItemGroups(): void {
    this.service.get_product_group().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.get_product = res.data;
        }
      },
      error: (err) => console.error('Error loading item groups:', err),
    });
  }

  getProductGroupName(): void {
    if (!this.editProduct.itemGroupName && this.product.itemGroupId) {
      this.loadItemGroupName();
    }
  }

  calculateFinalPrice(): void {
    const sellingPrice = this.editProduct.selling_item_price || 0;
    const discount = this.editProduct.item_discount_price || 0;
    this.editProduct.item_final_price = Math.max(0, sellingPrice - discount);
  }

  updateRemainingStock(): void {
    this.editProduct.remainingStock = this.editProduct.openingStock;
  }

  // Individual barcode editing
  startEditBarcode(index: number): void {
    this.existingBarcodes[index].isEditing = true;
    this.existingBarcodes[index].tempValue = this.existingBarcodes[index].barcode_serila;
  }

  saveEditBarcode(index: number): void {
    const newValue = this.existingBarcodes[index].tempValue?.trim();
    
    if (newValue && newValue !== this.existingBarcodes[index].barcode_serila) {
      // Check for duplicates
      const isDuplicate = this.existingBarcodes.some((b, i) => 
        i !== index && b.barcode_serila === newValue
      ) || this.newBarcodes.includes(newValue);
      
      if (isDuplicate) {
        alert('This barcode already exists!');
        return;
      }
      
      // Mark as changed
      this.existingBarcodes[index].isChanged = true;
      this.existingBarcodes[index].barcode_serila = newValue;
      this.existingBarcodes[index].isEditing = false;
    } else {
      this.existingBarcodes[index].isEditing = false;
    }
  }

  cancelEditBarcode(index: number): void {
    this.existingBarcodes[index].isEditing = false;
    this.existingBarcodes[index].tempValue = this.existingBarcodes[index].barcode_serila;
  }

  deleteBarcode(barcodeId: string): void {
    this.barcodeToDelete = barcodeId;
    this.showDeleteConfirm = true;
  }

  confirmDeleteBarcode(): void {
    if (this.barcodeToDelete) {
      this.service.delete_barcode(this.barcodeToDelete).subscribe({
        next: () => {
          const index = this.existingBarcodes.findIndex(b => b._id === this.barcodeToDelete);
          if (index !== -1) {
            this.existingBarcodes.splice(index, 1);
          }
          this.showDeleteConfirm = false;
          this.barcodeToDelete = null;
        },
        error: (err) => {
          console.error('Error deleting barcode:', err);
          alert('Failed to delete barcode');
          this.showDeleteConfirm = false;
          this.barcodeToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.barcodeToDelete = null;
  }

  // Add single barcode
  addSingleBarcode(): void {
    if (this.barcodeInput.trim()) {
      const barcode = this.barcodeInput.trim();
      
      // Check for duplicates
      const isDuplicate = this.existingBarcodes.some(b => b.barcode_serila === barcode) || 
                         this.newBarcodes.includes(barcode);
      
      if (isDuplicate) {
        alert('This barcode already exists!');
        return;
      }
      
      this.newBarcodes.push(barcode);
      this.barcodeInput = '';
    }
  }

  // Remove new barcode
  removeNewBarcode(index: number): void {
    this.newBarcodes.splice(index, 1);
  }

  // Bulk add barcodes
  openAddBarcodeModal(): void {
    this.showAddBarcodeModal = true;
    this.bulkBarcodeInput = '';
  }

  closeAddBarcodeModal(): void {
    this.showAddBarcodeModal = false;
    this.bulkBarcodeInput = '';
  }

  addBulkBarcodes(): void {
    if (!this.bulkBarcodeInput.trim()) return;
    
    const barcodes = this.bulkBarcodeInput
      .split(/[\n,]/)
      .map(b => b.trim())
      .filter(b => b.length > 0);
    
    const existingBarcodes = this.existingBarcodes.map(b => b.barcode_serila);
    const allExistingBarcodes = [...existingBarcodes, ...this.newBarcodes];
    
    const uniqueNewBarcodes = barcodes.filter(b => !allExistingBarcodes.includes(b));
    
    if (uniqueNewBarcodes.length > 0) {
      this.newBarcodes.push(...uniqueNewBarcodes);
      this.closeAddBarcodeModal();
    } else {
      alert('All barcodes already exist!');
    }
  }

  // Generate barcodes
  generateBarcodes(): void {
    const count = this.editProduct.openingStock - (this.existingBarcodes.length + this.newBarcodes.length);
    if (count <= 0) {
      alert('No more barcodes needed');
      return;
    }
    
    const existingBarcodes = this.existingBarcodes.map(b => b.barcode_serila);
    const allExistingBarcodes = [...existingBarcodes, ...this.newBarcodes];
    
    for (let i = 1; i <= count; i++) {
      let newBarcode;
      let attempts = 0;
      
      do {
        newBarcode = `BRC-${Date.now()}-${(i + attempts).toString().padStart(3, '0')}`;
        attempts++;
      } while (allExistingBarcodes.includes(newBarcode) && attempts < 10);
      
      if (!allExistingBarcodes.includes(newBarcode)) {
        this.newBarcodes.push(newBarcode);
      }
    }
  }

  // Clear all new barcodes
  clearAllNewBarcodes(): void {
    if (this.newBarcodes.length > 0) {
      if (confirm('Are you sure you want to clear all new barcodes?')) {
        this.newBarcodes = [];
      }
    }
  }

  // Scan barcode
  scanBarcode(): void {
    // Simulate barcode scanning
    const randomBarcode = `SCAN-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    this.barcodeInput = randomBarcode;
  }

  // Dropdown management
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectItem(item: any): void {
    this.selectedItem = item.itemGroupName;
    this.editProduct.itemGroupName = item.itemGroupName;
    this.isOpen = false;
  }

  // Form submission
  async onSaveClick(): Promise<void> {
    if (!this.isButtonDisabled()) {
      this.isSaving = true;
      
      try {
        // 1. Update product details
        const productUpdateData: EditProductPayload = {
          itemGroupName: this.editProduct.itemGroupName,
          item_Name: this.editProduct.item_Name,
          item_Description: this.editProduct.item_Description,
          actual_item_price: this.editProduct.actual_item_price,
          selling_item_price: this.editProduct.selling_item_price,
          item_discount_price: this.editProduct.item_discount_price,
          item_final_price: this.editProduct.item_final_price,
          modelNoSKU: this.editProduct.modelNoSKU,
          serialNo: this.editProduct.serialNo,
          unit: this.editProduct.unit,
          isActive: this.editProduct.isActive
        };

        await this.service.edit_item(this.productId!, productUpdateData).toPromise();

        // 2. Update stock record if opening stock changed
        if (this.stockRecordId && this.editProduct.openingStock !== this.originalOpeningStock) {
          const stockUpdateData: EditStockPayload = {
            openingStock: this.editProduct.openingStock
          };
          await this.service.edit_stock_record(this.stockRecordId, stockUpdateData).toPromise();
        }

        // 3. Handle barcode updates
        if (this.editProduct.serialNo) {
          // Update individual barcodes
          const updatePromises = this.existingBarcodes
            .filter(b => b.isChanged)
            .map(b => 
              this.service.update_single_barcode(b._id, { 
                barcode_serila: b.barcode_serila 
              }).toPromise()
            );

          await Promise.all(updatePromises);

          // Add new barcodes using create barcode API
          if (this.newBarcodes.length > 0) {
            const createBarcodeData: CreateBarcodePayload = {
              barcode_serila: this.newBarcodes,
              stockInId: null,
              stockoutId: null
            };
            await this.service.add_barcode_serillla(this.productId!, createBarcodeData).toPromise();
          }
        }

        this.isSaving = false;
        alert('Product updated successfully!');
        this.router.navigateByUrl('admin/products')
        this.loadProductData();
        
      } catch (error: any) {
        this.isSaving = false;
        console.error('Update failed:', error);
        
        if (error.status === 404) {
          if (error.url?.includes('edit_product_stock_record')) {
            alert('Stock record not found.');
          } else {
            alert('Resource not found.');
          }
        } else {
          alert(`Failed to update product: ${error.message || 'Unknown error'}`);
        }
      }
    }
  }

  resetForm(): void {
    if (this.originalProduct) {
      this.editProduct = { ...this.originalProduct };
      
      this.existingBarcodes = this.barcodes.map(b => ({
        _id: b._id,
        barcode_serila: b.barcode_serila,
        isEditing: false,
        tempValue: b.barcode_serila,
        isChanged: false
      }));
      this.newBarcodes = [];
      this.barcodeInput = '';
    }
  }

  isButtonDisabled(): boolean {
    const requiredFields = [
      this.editProduct.itemGroupName,
      this.editProduct.item_Name,
      this.editProduct.modelNoSKU,
      this.editProduct.actual_item_price,
      this.editProduct.selling_item_price,
      this.editProduct.unit,
      this.editProduct.item_Description
    ];

    const hasRequiredFields = requiredFields.every(field => 
      field !== null && field !== undefined && field.toString().trim() !== ''
    );

    const hasValidPrices = this.editProduct.actual_item_price >= 0 && 
                          this.editProduct.selling_item_price >= 0;

    if (this.editProduct.serialNo) {
      const totalBarcodes = this.existingBarcodes.length + this.newBarcodes.length;
      const hasValidBarcodes = totalBarcodes === this.editProduct.openingStock;
      return !hasRequiredFields || !hasValidPrices || !hasValidBarcodes;
    }

    return !hasRequiredFields || !hasValidPrices;
  }

  hasChanges(): boolean {
    if (!this.originalProduct) return false;
    
    const productChanged = 
      this.editProduct.item_Name !== this.originalProduct.item_Name ||
      this.editProduct.modelNoSKU !== this.originalProduct.modelNoSKU ||
      this.editProduct.actual_item_price !== this.originalProduct.actual_item_price ||
      this.editProduct.selling_item_price !== this.originalProduct.selling_item_price ||
      this.editProduct.item_discount_price !== this.originalProduct.item_discount_price ||
      this.editProduct.unit !== this.originalProduct.unit ||
      this.editProduct.isActive !== this.originalProduct.isActive ||
      this.editProduct.serialNo !== this.originalProduct.serialNo ||
      this.editProduct.item_Description !== this.originalProduct.item_Description ||
      this.editProduct.itemGroupName !== this.originalProduct.itemGroupName;

    const stockChanged = this.editProduct.openingStock !== this.originalOpeningStock;

    const barcodesChanged = 
      this.existingBarcodes.some(b => b.isChanged) ||
      this.newBarcodes.length > 0;

    return productChanged || stockChanged || barcodesChanged;
  }
}