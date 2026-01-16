export interface productGroup {
  itemGroupName: string;
  group_description: string;
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
