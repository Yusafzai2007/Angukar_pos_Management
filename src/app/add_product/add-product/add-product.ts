import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ServiceData } from '../../create_account/api_service/service-data';
import { ItemGroup, ItemGroupResponse } from '../../Typescript/product_group';
import { AddProducttypescript, barcode_serila } from '../../Typescript/add_product/add_product';
import { ProductPayload } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  @ViewChild('productForm') productForm!: NgForm;

  isOpen = false;
  selectedItem: string = '';
  get_product: ItemGroup[] = [];
  selectedGroupName: string = '';
  isLoading: boolean = false;

  // Barcode Management
  barcodeInput: string = '';
  barcodes: string[] = [];

  constructor(private service: ServiceData) {}

  ngOnInit() {
    this.fetchProductGroups();
  }

  fetchProductGroups() {
    this.service.get_product_group().subscribe((res: ItemGroupResponse) => {
      this.get_product = res.data;
    });
  }

  calculateFinalPrice() {
    const sellingPrice = this.add_product.sellingItemPrice || 0;
    const discount = this.add_product.itemDiscountPrice || 0;

    if (sellingPrice >= discount) {
      this.add_product.itemFinalPrice = parseFloat((sellingPrice - discount).toFixed(2));
    } else {
      this.add_product.itemFinalPrice = sellingPrice;
      this.add_product.itemDiscountPrice = 0;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectItem(item: ItemGroup) {
    this.selectedItem = item.itemGroupName;
    this.selectedGroupName = item.itemGroupName;
    this.add_product.itemGroupName = item.itemGroupName;
    this.isOpen = false;
  }

  // Form object
  add_product = {
    itemGroupName: '',
    itemName: '',
    itemDescription: '',
    actualItemPrice: 0,
    sellingItemPrice: 0,
    itemDiscountPrice: 0,
    itemFinalPrice: 0,
    isActive: true,
    modelNoSKU: '',
    serialNo: false,
    unit: '',
    openingStock: 0,
    remainingStock: 0,
  };

  // Check if button should be disabled
  isButtonDisabled(): boolean {
    console.log('Checking button disabled state...');

    // Basic form validation
    const basicValidation =
      !this.add_product.itemGroupName ||
      !this.add_product.itemName ||
      !this.add_product.modelNoSKU ||
      this.add_product.actualItemPrice <= 0 ||
      this.add_product.sellingItemPrice <= 0 ||
      !this.add_product.unit ||
      !this.add_product.itemDescription ||
      this.add_product.openingStock < 0;

    if (basicValidation) {
      console.log('Button disabled: Basic validation failed');
      return true;
    }

    console.log('Button enabled: All validations passed');
    return false;
  }

  // Save button click handler
  onSaveClick() {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Form data:', this.add_product);
    console.log('Serial No:', this.add_product.serialNo);
    console.log('Barcodes:', this.barcodes);

    // Mark all fields as touched to show validation errors
    if (this.productForm) {
      this.productForm.form.markAllAsTouched();
    }

    // Manual validation
    if (!this.add_product.itemGroupName) {
      alert('Please select Item Group');
      return;
    }

    if (!this.add_product.itemName?.trim()) {
      alert('Please enter Item Name');
      return;
    }

    if (!this.add_product.modelNoSKU?.trim()) {
      alert('Please enter Model No/SKU');
      return;
    }

    if (this.add_product.actualItemPrice <= 0) {
      alert('Actual Price must be greater than 0');
      return;
    }

    if (this.add_product.sellingItemPrice <= 0) {
      alert('Selling Price must be greater than 0');
      return;
    }

    if (this.add_product.itemDiscountPrice < 0) {
      alert('Discount cannot be negative');
      return;
    }

    if (this.add_product.itemDiscountPrice > this.add_product.sellingItemPrice) {
      alert('Discount cannot be greater than selling price');
      return;
    }

    if (!this.add_product.unit) {
      alert('Please select Unit');
      return;
    }

    if (!this.add_product.itemDescription?.trim()) {
      alert('Please enter Description');
      return;
    }

    if (this.add_product.openingStock < 0) {
      alert('Opening Stock cannot be negative');
      return;
    }

    // Auto-calculate final price if needed
    if (
      this.add_product.itemFinalPrice === 0 &&
      (this.add_product.sellingItemPrice > 0 || this.add_product.itemDiscountPrice > 0)
    ) {
      this.calculateFinalPrice();
    }

    // Serial number validation - only check for duplicate barcodes if any
    if (this.add_product.serialNo && this.barcodes.length > 0) {
      // Check for duplicate barcodes
      const uniqueBarcodes = new Set(this.barcodes);
      if (uniqueBarcodes.size !== this.barcodes.length) {
        alert('Duplicate barcodes found. Please remove duplicates.');
        return;
      }
    }

    console.log('✅ All validations passed! Calling adding_product()...');

    // Call the save method
    this.adding_product();
  }

  // Generate a single barcode
  generateBarcode() {
    if (!this.add_product.serialNo) {
      alert('Please enable serial number tracking first.');
      return;
    }

    const prefix = this.add_product.modelNoSKU
      ? this.add_product.modelNoSKU.substring(0, 3).toUpperCase()
      : 'ITM';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const barcode = `${prefix}-${timestamp}-${random}`;

    // Check for duplicate
    if (!this.barcodes.includes(barcode)) {
      this.barcodes.push(barcode);
      console.log(`Generated barcode: ${barcode}`);
    } else {
      // Try again if duplicate
      this.generateBarcode();
    }
  }

  // Clear all barcodes
  clearAllBarcodes() {
    if (confirm('Are you sure you want to clear all barcodes?')) {
      this.barcodes = [];
      this.barcodeInput = '';
    }
  }

  updateRemainingStock() {
    this.add_product.remainingStock = this.add_product.openingStock;
  }

  // Barcode Management Methods
  addBarcode() {
    if (!this.barcodeInput.trim()) {
      alert('Please enter a barcode');
      return;
    }

    // Check for duplicate barcode
    if (this.barcodes.includes(this.barcodeInput.trim())) {
      alert('This barcode already exists!');
      return;
    }

    this.barcodes.push(this.barcodeInput.trim());
    this.barcodeInput = '';

    console.log(`Added barcode. Total: ${this.barcodes.length}`);
  }

  removeBarcode(index: number) {
    this.barcodes.splice(index, 1);
    console.log(`Removed barcode. Total: ${this.barcodes.length}`);
  }

  scanBarcode() {
    if (!this.add_product.serialNo) {
      alert('Please enable serial number tracking first.');
      return;
    }

    // Generate a random barcode for scanning simulation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let scannedBarcode = '';

    for (let i = 0; i < 8; i++) {
      scannedBarcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check for duplicate
    if (this.barcodes.includes(scannedBarcode)) {
      alert('Generated barcode already exists! Trying again...');
      this.scanBarcode(); // Try again
      return;
    }

    this.barcodes.push(scannedBarcode);
    this.barcodeInput = '';

    console.log(`Scanned barcode. Total: ${this.barcodes.length}`);
  }

  async adding_product() {
    console.log('=== STARTING API CALLS ===');

    this.isLoading = true;

    try {
      // Step 1: Create product payload
      const productPayload: ProductPayload = {
        itemGroupName: this.add_product.itemGroupName,
        item_Name: this.add_product.itemName,
        item_Description: this.add_product.itemDescription,
        actual_item_price: this.add_product.actualItemPrice,
        selling_item_price: this.add_product.sellingItemPrice,
        item_discount_price: this.add_product.itemDiscountPrice,
        item_final_price: this.add_product.itemFinalPrice,
        modelNoSKU: this.add_product.modelNoSKU,
        serialNo: this.add_product.serialNo,
        unit: this.add_product.unit,
      };

      console.log('Step 1: Creating product with payload:', productPayload);

      // Step 1: Create product API call
      const productResponse: any = await this.service.create_product(productPayload).toPromise();
      console.log('Product API Response:', productResponse);

      // Extract product ID from response
      let productId: string = '';

      if (productResponse.message && productResponse.message._id) {
        productId = productResponse.message._id;
      } else if (productResponse.data && productResponse.data._id) {
        productId = productResponse.data._id;
      } else if (productResponse._id) {
        productId = productResponse._id;
      } else if (productResponse.message && productResponse.message.id) {
        productId = productResponse.message.id;
      } else {
        console.error('Product ID not found in response:', productResponse);
        throw new Error('Product created but ID not returned');
      }

      console.log('✅ Product created with ID:', productId);

      // Step 2: Create stock record (only if opening stock > 0)
      if (this.add_product.openingStock > 0) {
        console.log('Step 2: Creating stock record for product:', productId);

        const stockRecordPayload = {
          productId: productId,
          openingStock: this.add_product.openingStock,
        };

        const stockResponse: any = await this.service
          .add_product_record(stockRecordPayload)
          .toPromise();
        console.log('✅ Stock record created:', stockResponse);
      }

      // Step 3: Create barcode records (only if serial number is required and barcodes exist)
      if (this.add_product.serialNo && this.barcodes.length > 0) {
        console.log('Step 3: Creating barcode records for product:', productId);

        const barcodePayload: barcode_serila = {
          barcode_serila: this.barcodes,
          stockInId: null,
          stockoutId: null,
        };

        const barcodeResponse: any = await this.service
          .add_barcode_serillla(productId, barcodePayload)
          .toPromise();
        console.log('✅ Barcode records created:', barcodeResponse);
      }

      alert('✅ Product and stock record created successfully!' + 
            (this.barcodes.length > 0 ? ' Barcodes also added.' : ''));
      this.resetForm();
    } catch (error: any) {
      console.error('❌ Error:', error);

      let errorMessage = 'Operation failed. ';
      if (error.error?.message) {
        errorMessage += error.error.message;
      } else if (error.message) {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm() {
    this.add_product = {
      itemGroupName: '',
      itemName: '',
      itemDescription: '',
      actualItemPrice: 0,
      sellingItemPrice: 0,
      itemDiscountPrice: 0,
      itemFinalPrice: 0,
      isActive: true,
      modelNoSKU: '',
      serialNo: false,
      unit: '',
      openingStock: 0,
      remainingStock: 0,
    };
    this.selectedItem = '';
    this.selectedGroupName = '';
    this.barcodes = [];
    this.barcodeInput = '';

    // Reset form validation state
    if (this.productForm) {
      this.productForm.resetForm();
    }
  }
}