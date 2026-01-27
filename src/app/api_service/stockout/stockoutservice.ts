import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockOutApiResponse } from '../../Typescript/stcokout/stock_out';
import { StockOutCategoryResponse } from '../../Typescript/category/stockout_category';

@Injectable({
  providedIn: 'root',
})
export class Stockoutservice {
  
  constructor(private http: HttpClient) {}

  private apiUrl: string = 'http://localhost:4000/api/v1/pos';

  // Create stock out
  stockOut(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/stock-out`, data);
  }

  // Get all products with stock info
  products(): Observable<StockOutApiResponse> {
    return this.http.get<StockOutApiResponse>(`${this.apiUrl}/stock/grouped`);
  }

  // Get stock out categories
  get_stockOut_category(): Observable<StockOutCategoryResponse> {
    return this.http.get<StockOutCategoryResponse>(`${this.apiUrl}/get_stockOut_categories`);
  }

  // Get all stock out records
  get_stockOut(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get_stockOut`);
  }
}