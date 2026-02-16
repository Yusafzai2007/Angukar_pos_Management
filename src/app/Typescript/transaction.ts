export interface StockInTransaction {
  _id: string;
  itemId: string[];
  stcokIn_price: number;
  stockAdded: number[];
  stockInDate: string; 
  stockInCategoryId: string;
  invoiceNo: string;
  notes: string;
  isActive: boolean;
  transactions: any[]; 
  createdAt: string;
  updatedAt: string;
  __v: number;
}

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

export interface StockTransactiondata {
  _id: string;
  quantity: number;
  type: 'Opening' | 'Stock-In' | 'Stock-Out';
  reference: string;
  costPrice: number;
  salePrice: number;
  discount: number;
  finalPrice: number;
  date: string;
  fullTransaction: StockInTransaction | StockOutTransaction | null;
}

export interface Product {
  _id: string;
  item_Name: string;
  modelNoSKU: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface StockRecordResponse {
  data: ItemStockRecordType[];
  message: string;
  statuscode: number;
  success: boolean;
}
