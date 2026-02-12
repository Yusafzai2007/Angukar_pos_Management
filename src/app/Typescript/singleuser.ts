// TypeScript interfaces for your JSON response

export interface singleUserMessage {
status: "active" | "inactive";
  _id: string;
  userName: string;
  email: string;
  role: string;
  createat: string;  // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface singleApiResponse {
  data: string;
  message: singleUserMessage;
  statuscode: number;
  success: boolean;
}










export interface updateuserdata {
  userName: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}
