// Typescript/category/stockout.ts

// 用于创建和更新的请求数据
export interface StockOutCategoryRequest {
  stockoutCategoryName: string;
  stockout_category_description: string;
}

// 用于显示的单个类别数据
export interface StockOutCategoryDisplay {
  _id: string;
  stockoutCategoryName: string;
  stockout_category_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

// API 响应格式
export interface StockOutCategoryResponse {
  data: StockOutCategoryDisplay[];
  message: string;
  statuscode: number;
  success: boolean;
}