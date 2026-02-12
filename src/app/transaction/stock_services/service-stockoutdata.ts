import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockRecordResponse } from '../../Typescript/transaction';

@Injectable({
  providedIn: 'root',
})
export class ServiceStockoutdata {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'http://localhost:4000/api/v1/pos';

  get_stock_transaction() {
    return this.http.get<StockRecordResponse>(`${this.apiUrl}/get_stock_record`);
  }
}
