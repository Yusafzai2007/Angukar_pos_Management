// Single StockOut item interface
export interface dashboardStockOutItem {
  _id: string;
  itemId: string[];             // multiple item IDs
  stockOutCategoryId: string;
  Total_sale: number;
  quantity: number[];           // multiple quantities
  stockOutDate: string;         // ISO date string
  invoiceNo: string;
  isActive: boolean;
  date: string;                 // ISO date string
  createdAt: string;            // ISO date string
  updatedAt: string;            // ISO date string
  __v: number;
  id: string;
}

// API Response interface
export interface dashboardStockOutResponse {
  data: string;                 // "Stock-Out data fetched successfully"
  message: dashboardStockOutItem[];      // array of stock out items
  statuscode: number;
  success: boolean;
}
