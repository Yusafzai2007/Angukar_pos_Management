// Barcode interface
export interface edit_stocuout_ProductBarcodeType {
  _id: string;
  stock_productId: string;
  barcode_serila: string;
  stockInId: string | null;
  stockoutId: string | null;
  __v: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Item Group interface
export interface edit_stocuout_ItemGroupType {
  _id: string;
  itemGroupName: string;
  group_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Item interface
export interface edit_stocuout_StockOutItemType {
  _id: string;
  itemGroupId: edit_stocuout_ItemGroupType;
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
  barcodes: edit_stocuout_ProductBarcodeType[];
  openingStock: number;
  remainingStock: number;
  transactionId: string | null;
}

// StockOut Category interface
export interface edit_stocuout_StockOutCategoryType {
  _id: string;
  stockoutCategoryName: string;
  stockout_category_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Main StockOut response interface
export interface edit_stocuout_StockOutResponseType {
  _id: string;
  itemId: edit_stocuout_StockOutItemType[];
  stockOutCategoryId: edit_stocuout_StockOutCategoryType;
  Total_sale: number;
  quantity: number[];
  stockOutDate: string;
  invoiceNo: string | null;
  isActive: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Full API Response
export interface edit_stocuout_StockOutApiResponse {
  data: edit_stocuout_StockOutResponseType;
  message: string;
  statuscode: number;
  success: boolean;
}
export interface EditProductPayload {
  itemGroupId: string;          // Required group ID
  itemGroupName: string;        // Required group name
  item_Name: string;
  item_Description: string;
  actual_item_price: number;
  selling_item_price: number;
  item_discount_price: number;
  item_final_price: number;
  modelNoSKU: string;
  serialNo: boolean;
  unit: string;
  isActive: boolean;
}
