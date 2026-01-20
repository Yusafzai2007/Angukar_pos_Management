import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockApiResponse } from '../Typescript/add_product/add_product';
import { StockInCategoryResponse } from '../Typescript/category/stockIn';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockIn {
 
  


 constructor(private http:HttpClient){}

  apiUrl: string = 'http://localhost:4000/api/v1/pos';

 
   stockIn(data:any){
    return this.http.post(`${this.apiUrl}/create_stockIn`,data)
   }




products() {
    return this.http.get<StockApiResponse>(`${this.apiUrl}/stock/grouped`);
  }






  get_stockIn_category(): Observable<StockInCategoryResponse> {
    return this.http.get<StockInCategoryResponse>(`${this.apiUrl}/get_stockIn_categories`);
  }



}
