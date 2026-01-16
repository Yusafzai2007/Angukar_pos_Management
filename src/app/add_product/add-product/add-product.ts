import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceData } from '../../create_account/api_service/service-data';
import { ItemGroup, ItemGroupResponse } from '../../Typescript/product_group';
import { AddProducttypescript } from '../../Typescript/add_product/add_product';
import { ProductPayload } from '../../create_account/api_service/service-data';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  isOpen = false;
  selectedItem: string = '';
  get_product: ItemGroup[] = [];
  selectedGroupName: string = '';

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
  add_product: AddProducttypescript = {
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
  };

  adding_product() {
    console.log('Frontend form data:', this.add_product);
    
    // Auto-calculate final price if needed
    if (this.add_product.itemFinalPrice === 0 && 
        (this.add_product.sellingItemPrice > 0 || this.add_product.itemDiscountPrice > 0)) {
      this.calculateFinalPrice();
    }
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    // Convert to backend payload
    const payload: ProductPayload = {
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
    
    console.log('Backend payload:', payload);
    
    this.service.create_product(payload).subscribe({
      next: (res) => {
        console.log('Success:', res);
        alert('Product added successfully!');
        this.resetForm();
      },
      error: (err) => {
        console.error('Error:', err);
        if (err.error && err.error.message) {
          alert(`Error: ${err.error.message}`);
        } else {
          alert('An error occurred. Please check console for details.');
        }
      },
    });
  }

  validateForm(): boolean {
    if (!this.add_product.itemGroupName) {
      alert('Please select an item group');
      return false;
    }
    if (!this.add_product.itemName || this.add_product.itemName.trim() === '') {
      alert('Item name is required');
      return false;
    }
    if (!this.add_product.modelNoSKU || this.add_product.modelNoSKU.trim() === '') {
      alert('Model No/SKU is required');
      return false;
    }
    if (this.add_product.actualItemPrice <= 0) {
      alert('Actual price must be greater than 0');
      return false;
    }
    if (this.add_product.sellingItemPrice <= 0) {
      alert('Selling price must be greater than 0');
      return false;
    }
    if (this.add_product.itemDiscountPrice < 0) {
      alert('Discount cannot be negative');
      return false;
    }
    if (this.add_product.itemDiscountPrice > this.add_product.sellingItemPrice) {
      alert('Discount cannot be greater than selling price');
      return false;
    }
    if (!this.add_product.unit) {
      alert('Unit is required');
      return false;
    }
    if (!this.add_product.itemDescription || this.add_product.itemDescription.trim() === '') {
      alert('Description is required');
      return false;
    }
    return true;
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
    };
    this.selectedItem = '';
    this.selectedGroupName = '';
  }
}