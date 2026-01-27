export interface StockOutApiResponse {
  success: boolean;
  count: number;
  data: StockOutItem[];
}

export interface StockOutItem {
  _id: string;
  totalRemainingStock: number;
  totalOpeningStock: number;
  allTransactions: Transaction[][];
  product: Product;
  barcodes: Barcode[];
  itemGroupName?: string;
}

export interface Transaction {
  _id: string;
  date: string;
  quantity: number;
  type: 'Opening' | 'In' | 'Out';
  reference: string;
}

export interface Product {
  _id: string;
  itemGroupId: string;
  itemGroupName?: string;
  item_Name: string;
  item_Description: string;
  actual_item_price: number;
  selling_item_price: number;
  item_discount_price: number;
  item_final_price: number;
  isActive: boolean;
  modelNoSKU: string;
  serialNo: boolean | string;
  unit: string;
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
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StockOutResponse {
  success: boolean;
  data: {
    _id: string;
    itemId: string[];
    stockOutCategoryId: string;
    Total_sale: number;
    quantity: number[];
    stockOutDate: Date;
    invoiceNo: string;
    isActive: boolean;
    stockOutNumber: string;
  };
  message: string;
}