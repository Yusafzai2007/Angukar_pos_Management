export interface Product {
  _id: string;
  item_Name: string;
  modelNoSKU: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullTransaction {
  _id: string;
  itemId: string[];
  stcokIn_price?: number;
  stockAdded?: number[];
  stockInDate?: string;
  stockInCategoryId?: string;
  invoiceNo?: string;
  notes?: string;
  stockOutCategoryId?: string;
  Total_sale?: number;
  quantity?: number[];
  stockOutDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  quantity: number;
  type: string;
  reference: string;
  Total_sale: number;
  stockInCost: number;
  costPrice: number;
  salePrice: number;
  discount: number;
  finalPrice: number;
  date: string;
  fullTransaction: FullTransaction | null;
}

export interface StockRecord {
  _id: string;
  productId: Product;
  openingStock: number;
  remainingStock: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StockRecordResponsedata {
  data: StockRecord[];
  message: string;
  statuscode: number;
  success: boolean;
}

export interface YearOption {
  year: string;
  count: number;
}