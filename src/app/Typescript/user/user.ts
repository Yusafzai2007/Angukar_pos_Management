// single user
export interface userdata {
  _id: string;
  userName: string;
  email: string;
  role: 'user' | 'admin';
  status:string
  createat: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API response
export interface AllUsersResponse {
  data: string;
  message: userdata[];
  statuscode: number;
  success: boolean;
}
