import { Document, Date, Types } from "mongoose";

export interface IUser extends Document {         
  userName: string;       
  email: string;          
  password: string;  
  isBlocked:boolean; 
  isGoogle:boolean;    
  createdAt: Date;       
}
