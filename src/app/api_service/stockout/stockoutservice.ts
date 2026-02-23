import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockOutApiResponse } from '../../Typescript/stcokout/stock_out';
import { StockOutCategoryResponse } from '../../Typescript/category/stockout_category';
import { StockOutApiResponsedata } from '../../Typescript/stcokout/stock_out_data';

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





 all_stock_out(): Observable<StockOutApiResponsedata>{
  return this.http.get<StockOutApiResponsedata>(`${this.apiUrl}/get_all_stockOut`)
}





delete_stock_out(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/delete-stock-out/${id}`)
 } ;




// In your Stockoutservice class, add this method:
get_stockOut_paginated(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = 'all',
  categoryId: string = '',
  invoiceNo: string = '',
  itemName: string = '',
  modelSKU: string = ''
): Observable<any> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
    status: status,
    categoryId: categoryId,
    invoiceNo: invoiceNo,
    itemName: itemName,
    modelSKU: modelSKU
  });
  
  return this.http.get<any>(`${this.apiUrl}/get_all_stockOut?${params.toString()}`);
}












  
}