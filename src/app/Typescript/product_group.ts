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

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ItemGroupResponse {
  data: ItemGroup[];
  pagination: PaginationInfo;
  message: string;
  statuscode: number;
  success: boolean;
}