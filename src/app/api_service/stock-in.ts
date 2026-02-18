import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockApiResponse } from '../Typescript/add_product/add_product';
import { StockInCategoryResponse } from '../Typescript/category/stockIn';
import { Observable } from 'rxjs';
import { StockInResponse } from '../Typescript/stockin/stockin';
import { StockOutCategoryResponse } from '../Typescript/category/stockout_category';
import { EditStockInResponse } from '../Typescript/edit_stcokIn';
import { edit_stocuout_StockOutApiResponse } from '../Typescript/edit_stockout';

@Injectable({
  providedIn: 'root',
})
export class StockInStockInService {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'http://localhost:4000/api/v1/pos';

  stockIn(data: any) {
    return this.http.post(`${this.apiUrl}/create_stockIn`, data);
  }

  products() {
    return this.http.get<StockApiResponse>(`${this.apiUrl}/stock/grouped`);
  }

  get_stockIn_category(): Observable<StockInCategoryResponse> {
    return this.http.get<StockInCategoryResponse>(`${this.apiUrl}/get_stockIn_categories`);
  }

  get_stockIn() {
    return this.http.get<StockInResponse>(`${this.apiUrl}/get_stockIn`);
  }

  get_stockout_category(): Observable<StockOutCategoryResponse> {
    return this.http.get<StockOutCategoryResponse>(`${this.apiUrl}/get_stockOut_categories`);
  }

  // Strongly typed method
  Id_stcoIn(id: string): Observable<EditStockInResponse> {
    return this.http.get<EditStockInResponse>(`${this.apiUrl}/get_stockInById/${id}`);
  }

  // In your stock-in.service.ts, add these methods:

  update_stockIn(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_stockIn/${id}`, data);
  }

  delete_stockIn(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_stockIn/${id}`);
  }

  // stock-in.service.ts میں یہ methods شامل کریں

  // Get stock out by ID
  Id_stockOut(id: string): Observable<edit_stocuout_StockOutApiResponse> {
    return this.http.get<edit_stocuout_StockOutApiResponse>(
      `${this.apiUrl}/get_stockOutById/${id}`,
    );
  }

  // Update stock out
  update_stockOut(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/stock-out/${id}`, data);
  }

  // Delete stock out
  delete_stockOut(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_stockOut/${id}`);
  }
}
