export interface AddProducttypescript {
  itemGroupName: string;         
  itemName: string;
  itemDescription: string;
  actualItemPrice: number;
  sellingItemPrice: number;
  itemDiscountPrice: number;  
  itemFinalPrice: number;
  isActive?: boolean;         
  modelNoSKU: string;
  serialNo: boolean;         
  unit: string;
}



export interface productstock_record {
  openingStock:string
}

export interface barcode_serila {
  barcode_serila: string[];
  stockInId: string | null;
  stockoutId: string | null;
}


















