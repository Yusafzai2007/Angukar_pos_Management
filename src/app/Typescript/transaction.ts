// Transaction details for Stock-In
export interface StockInTransaction {
  _id: string;
  itemId: string[];
  stcokIn_price: number;
  stockAdded: number[];
  stockInDate: string; // ISO string
  stockInCategoryId: string;
  invoiceNo: string;
  notes: string;
  isActive: boolean;
  transactions: any[]; // can define if nested transactions exist
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Transaction details for Stock-Out
export interface StockOutTransaction {
  _id: string;
  itemId: string[];
  stockOutCategoryId: string;
  Total_sale: number;
  quantity: number[];
  stockOutDate: string;
  invoiceNo: string;
  isActive: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

// Individual transaction in ItemStockRecord
export interface StockTransactiondata {
  _id: string;
  quantity: number;
  type: "Opening" | "Stock-In" | "Stock-Out";
  reference: string;
  costPrice: number;
  salePrice: number;
  discount: number;
  finalPrice: number;
  date: string;
  fullTransaction: StockInTransaction | StockOutTransaction | null;
}

// Product information
export interface Product {
  _id: string;
  item_Name: string;
  modelNoSKU: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

// Stock record for each product
export interface ItemStockRecordType {
  _id: string;
  productId: Product;
  openingStock: number;
  remainingStock: number;
  transactions: StockTransactiondata[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API response wrapper
export interface StockRecordResponse {
  data: ItemStockRecordType[];
  message: string;
  statuscode: number;
  success: boolean;
}
