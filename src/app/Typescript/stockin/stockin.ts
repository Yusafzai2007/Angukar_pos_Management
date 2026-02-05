
// Interfaces
export interface StockInResponse {
  data: string;
  message: StockIn[];
  statuscode: number;
  success: boolean;
}

export interface StockIn {
  _id: string;
  itemId: Item[];
  stcokIn_price: number;
  stockAdded: number[];
  stockInDate: string;
  stockInCategoryId: StockInCategory;
  invoiceNo: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Item {
  _id: string;
  itemGroupId: ItemGroup;
  item_Name: string;
  item_Description: string;
  actual_item_price: number;
  selling_item_price: number;
  item_discount_price: number;
  item_final_price: number;
  isActive: boolean;
  modelNoSKU: string;
  serialNo: boolean;
  unit: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  barcodes: Barcode[];
  openingStock:Number,
  remainingStock:Number,

}

export interface ItemGroup {
  _id: string;
  itemGroupName: string;
  group_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StockInCategory {
  _id: string;
  stockInCategoryName: string;
  category_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Barcode {
  _id: string;
  stock_productId: string;
  barcode_serila: string;
  stockInId: string | null;
  stockoutId: string | null;
  __v: number;
  createdAt: string;
  updatedAt: string;
}