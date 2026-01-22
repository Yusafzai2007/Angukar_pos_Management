export interface productGroup {
  itemGroupName: string;
  group_description: string;
}







export interface CreateBarcodePayload {
  barcode_serila: string[];
  productId: string; // Ensure this exists
  stockInId: string | null;
  stockoutId: string | null;
}

export interface EditProductPayload {
  itemGroupId?: string; // Add this
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


export interface ItemGroup {
  _id: string;
  itemGroupName: string;
  group_description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ItemGroupResponse {
  data: ItemGroup[];
  message: string;
  statuscode: number;
  success: boolean;
}
