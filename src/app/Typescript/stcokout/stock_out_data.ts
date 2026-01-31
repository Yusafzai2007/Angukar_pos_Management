// StockOutApiResponse interface
export interface StockOutApiResponsedata {
  data: string;
  message: StockOutItemdata[];
  statuscode: number;
  success: boolean;
}

// Barcode interface
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

// Item Group interface
export interface ItemGroup {
  _id: string;
  itemGroupName: string;
  group_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Item interface
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
}

// StockOutCategory interface
export interface StockOutCategory {
  _id: string;
  stockoutCategoryName: string;
  stockout_category_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// StockOut item interface
export interface StockOutItemdata {
  _id: string;
  itemId: Item[];
  stockOutCategoryId: StockOutCategory;
  Total_sale: number;
  quantity: number[];
  stockOutDate: string;
  invoiceNo: string;
  isActive: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
