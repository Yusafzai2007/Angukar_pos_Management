import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SingleUserResponse, Userlogin, UserSignup } from '../../Typescript/signnup';
import { ItemGroupResponse, productGroup } from '../../Typescript/product_group';
import { stockIn_category, StockInCategoryResponse } from '../../Typescript/category/stockIn';
import { StockOutCategoryResponse } from '../../Typescript/category/stockout_category';
import { AddProduct } from '../../add_product/add-product/add-product';
import { AddProducttypescript, barcode_serila } from '../../Typescript/add_product/add_product';
import { productstock_record } from '../../Typescript/product_record';
export interface ProductPayload {
  itemGroupName: string;
  item_Name: string;
  item_Description: string;
  actual_item_price: number;
  selling_item_price: number;
  item_discount_price: number;
  item_final_price: number;
  modelNoSKU: string;
  serialNo: boolean;
  unit: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceData {
  apiUrl: string = 'http://localhost:4000/api/v1/pos';

  constructor(private http: HttpClient) {}

  // Authentication
  signup(data: UserSignup): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  login(data: Userlogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data, {
      withCredentials: true,
    });
  }

  currentuser(): Observable<SingleUserResponse> {
    return this.http.get<SingleUserResponse>(`${this.apiUrl}/current_user`, {
      withCredentials: true,
    });
  }

  // Product Group
  create_product_Group(data: productGroup): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-product-group`, data);
  }

  get_product_group(): Observable<ItemGroupResponse> {
    return this.http.get<ItemGroupResponse>(`${this.apiUrl}/get-product-groups`);
  }

  edit_product_group(id: string, updatedata: productGroup): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-product-group/${id}`, updatedata);
  }

  delete_product_group(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-product-group/${id}`);
  }

  // Stock In Category
  create_stockIn_category(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_stockIn_category`, data);
  }

  get_stockIn_category(): Observable<StockInCategoryResponse> {
    return this.http.get<StockInCategoryResponse>(`${this.apiUrl}/get_stockIn_categories`);
  }

  edit_stockIn_category(id: string, updatedata: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_stockIn_category/${id}`, updatedata);
  }

  delete_stockIn_category(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_stockIn_category/${id}`);
  }


   // Stock out Category - 修正返回类型
  create_stockout_category(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_stockOut_category`, data);
  }

  get_stockout_category(): Observable<StockOutCategoryResponse> {
    return this.http.get<StockOutCategoryResponse>(`${this.apiUrl}/get_stockOut_categories`);
  }

  edit_stockout_category(id: string, updatedata: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_stockOut_category/${id}`, updatedata);
  }

  delete_stockout_category(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_stockOut_category/${id}`);
  }



 ////////////////////////////////////   add_product ///////////////////////////////////////


  create_product(product: ProductPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/add_item`, product);
  }





















    ///////////////////////////   add_product_stock_record /////////////////////////////////////////////////



// Update the add_product_record method to accept productId
add_product_record(data: { productId: string; openingStock: number }): Observable<any> {
  // Note: Update the API endpoint according to your backend
  // If your backend expects productId in params, you might need to adjust
  return this.http.post(`${this.apiUrl}/product_stock_record/${data.productId}`, {
    openingStock: data.openingStock
  });
}







  add_barcode_serillla( stock_productId:string,data:barcode_serila){
   return this.http.post(`${this.apiUrl}/product_barcode/${stock_productId}`,data)
  }




   















}