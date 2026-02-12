// Single User type
export interface UserSignup {
  userName: string;
  email: string;
  password: string;
}

export interface Userlogin {
  email: string;
  password: string;
}

export interface CurrentUser {
  _id: string;
  userName: string;
  email: string;
  role: string;
  createat: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SingleUserResponse {
  statuscode: number;
  success: boolean;
  data: string;
  message: {
    users: CurrentUser;
  };
}
