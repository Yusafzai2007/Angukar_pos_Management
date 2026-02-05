export interface EditStockInResponse {
  data: EditStockInData[];
  message: string;
  statuscode: number;
  success: boolean;
}

export interface EditStockInData {
  _id: string;
  itemId: EditStockItem[];
  stcokIn_price: number;
  stockAdded: number[];
  stockInDate: string; // ISO date string
  stockInCategoryId: EditStockInCategory;
  invoiceNo: string;
  notes: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface EditStockItem {
  _id: string;
  itemGroupId: EditItemGroup;
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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  barcodes: EditBarcode[];
  openingStock: number; // NEW
  remainingStock: number; // NEW
}

export interface EditItemGroup {
  _id: string;
  itemGroupName: string;
  group_description: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface EditBarcode {
  _id: string;
  stock_productId: string;
  barcode_serila: string;
  stockInId: string | null;
  stockoutId: string | null;
  __v: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface EditStockInCategory {
  _id: string;
  stockInCategoryName: string;
  category_description: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}
// Interface for barcode
export interface EditBarcode {
  _id: string;
  stock_productId: string;
  barcode_serila: string;
  stockInId: string | null;
  stockoutId: string | null;
  __v: number;
  createdAt: string;
  updatedAt: string;
}
