export interface stockIn_category {
  stockInCategoryName: string;
  category_description: string;
}

// Single Category Item
export interface StockInCategory {
  _id: string;
  stockInCategoryName: string;
  category_description: string;
  isActive: boolean;
  createdAt: string;   // ISO date string
  updatedAt: string;   // ISO date string
  __v: number;
  id: string;
}

// API Response
export interface StockInCategoryResponse {
  data: StockInCategory[];
  message: string;
  statuscode: number;
  success: boolean;
}