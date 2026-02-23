import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockRecordResponse } from '../../Typescript/transaction';
import { StockRecordResponsedata } from '../../Typescript/Item_transaction';

@Injectable({
  providedIn: 'root',
})
export class ServiceStockoutdata {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'http://localhost:4000/api/v1/pos';

  get_stock_transaction() {
    return this.http.get<StockRecordResponse>(`${this.apiUrl}/get_stock_record`);
  }




  Item_stock_record() {
    return this.http.get<StockRecordResponsedata>(`${this.apiUrl}/get_stock_record`);
  }


}
