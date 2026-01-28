import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockApiResponse } from '../Typescript/add_product/add_product';
import { StockInCategoryResponse } from '../Typescript/category/stockIn';
import { Observable } from 'rxjs';
import { StockInResponse } from '../Typescript/stockin/stockin';
import { StockOutCategoryResponse } from '../Typescript/category/stockout_category';

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
}
