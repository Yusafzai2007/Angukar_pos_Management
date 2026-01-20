import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SingleUserResponse, Userlogin, UserSignup } from '../../Typescript/signnup';
import { ItemGroupResponse, productGroup } from '../../Typescript/product_group';
import { stockIn_category, StockInCategoryResponse } from '../../Typescript/category/stockIn';
import { StockOutCategoryResponse } from '../../Typescript/category/stockout_category';
import { AddProduct } from '../../add_product/add-product/add-product';
import {
  AddProducttypescript,
  barcode_serila,
  StockApiResponse,
} from '../../Typescript/add_product/add_product';
import { productstock_record } from '../../Typescript/product_record';
import { AllUsersResponse } from '../../Typescript/user/user';

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

export interface EditProductPayload {
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
  isActive: boolean;
}

export interface EditStockPayload {
  openingStock: number;
}

export interface EditBarcodePayload {
  updateBarcodes?: Array<{
    _id: string;
    barcode_serila: string;
  }>;
  newBarcodes?: string[];
  stockInId?: string | null;
  stockoutId?: string | null;
}

export interface CreateBarcodePayload {
  barcode_serila: string[];
  stockInId?: string | null;
  stockoutId?: string | null;
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


  deleteuser(userId: string){
    return this.http.delete(`${this.apiUrl}/deleteuser`)
  }

  logout(data: any = {}) {
    return this.http.post(`${this.apiUrl}/logout`, data, {
      withCredentials: true,
    });
  }

  login(data: Userlogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data, {
      withCredentials: true,
    });
  }


  get_user(){
    return this.http.get<AllUsersResponse>(`${this.apiUrl}/users`) 
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

  products() {
    return this.http.get<StockApiResponse>(`${this.apiUrl}/stock/grouped`);
  }

  ///////////////////////////   add_product_stock_record /////////////////////////////////////////////////

  // Update the add_product_record method to accept productId
  add_product_record(data: { productId: string; openingStock: number }): Observable<any> {
    // Note: Update the API endpoint according to your backend
    // If your backend expects productId in params, you might need to adjust
    return this.http.post(`${this.apiUrl}/product_stock_record/${data.productId}`, {
      openingStock: data.openingStock,
    });
  }

  add_barcode_serillla(stock_productId: string, data: CreateBarcodePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/product_barcode/${stock_productId}`, data);
  }

  edit_product(id: string) {
    return this.http.get(`${this.apiUrl}/getStockGroupedByProductId/${id}`);
  }

  // Update product
  edit_item(id: string, updatedata: EditProductPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_item/${id}`, updatedata);
  }

  // Update stock record
  edit_stock_record(id: string, updatedata: EditStockPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/edit_product_stock_record/${id}`, updatedata);
  }

  // Update barcodes (edit existing and add new)
  edit_barcode(id: string, updatedata: EditBarcodePayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/edit_barcode/${id}`, updatedata);
  }

  // Edit single barcode
  update_single_barcode(id: string, updatedata: { barcode_serila: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_single_barcode/${id}`, updatedata);
  }

  // Delete single barcode
  delete_barcode(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_product_barcode/${id}`);
  }




add_new_barcode_serillla(stock_productId: string, data: CreateBarcodePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/product_barcode/${stock_productId}`, data);
  }
  



  




















}