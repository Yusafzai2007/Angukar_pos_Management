import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { dashboardStockOutResponse } from '../../Typescript/dashboard/dashboard';

@Injectable({
  providedIn: 'root',
})
export class Dashboardservice {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'http://localhost:4000/api/v1/pos';
  
  getDashboardItems() {
    return this.http.get<dashboardStockOutResponse>(`${this.apiUrl}/dashboard_stockOut`);
  }
}