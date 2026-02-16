export interface chartStockOutResponse {
  data: string;
  message: chartStockOut[];
  statuscode: number;
  success: boolean;
}
export interface chartStockOut {
  _id: string;
  itemId: string[];
  stockOutCategoryId: string;
  Total_sale: number;
  quantity: number[];
  stockOutDate: string;   // ISO Date string
  invoiceNo: string;
  isActive: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}
