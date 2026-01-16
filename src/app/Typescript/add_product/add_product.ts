export interface AddProducttypescript {
  itemGroupName: string;         // ID from dropdown
  itemName: string;
  itemDescription: string;
  actualItemPrice: number;
  sellingItemPrice: number;
  itemDiscountPrice: number;  // optional, default 0
  itemFinalPrice: number;
  isActive?: boolean;          // optional, default true
  modelNoSKU: string;
  serialNo: boolean;          // optional, default false
  unit: string;
}
