// add_product.ts file ko update karein
export interface AddProducttypescript {
  itemGroupName: string;
  itemName: string;
  itemDescription: string;
  actualItemPrice: number;
  sellingItemPrice: number;
  itemDiscountPrice: number;
  itemFinalPrice: number;
  isActive?: boolean;
  modelNoSKU: string;
  serialNo: boolean;
  unit: string;
}

export interface productstock_record {
  openingStock: string;
}

export interface barcode_serila {
  barcode_serila: string[];
  stockInId: string | null;
  stockoutId: string | null;
}

////////////////////////////////////      products ////////////////////////////////////////////////

/* =========================
   MAIN API RESPONSE
========================= */

export interface StockApiResponse {
  success: boolean;
  count: number;
  data: StockItem[];
}

/* =========================
   STOCK ITEM
========================= */

export interface StockItem {
  _id: string;
  totalRemainingStock: number;
  totalOpeningStock: number;
  allTransactions: Transaction[][];
  product: Product;
  barcodes: Barcode[];
  itemGroupName?: string; // Add this property
}

/* =========================
   TRANSACTION
========================= */

export interface Transaction {
  _id: string;
  date: string; // ISO Date
  quantity: number;
  type: 'Opening' | 'In' | 'Out';
  reference: string;
}

/* =========================
   PRODUCT (UPDATED)
========================= */

export interface Product {
  _id: string;
  itemGroupId: string;
  itemGroupName?: string; // Make this optional
  item_Name: string;
  item_Description: string;
  actual_item_price: number;
  selling_item_price: number;
  item_discount_price: number;
  item_final_price: number;
  isActive: boolean;
  modelNoSKU: string;
  serialNo: boolean | string;
  unit: string; // More flexible
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/* =========================
   BARCODE
========================= */

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