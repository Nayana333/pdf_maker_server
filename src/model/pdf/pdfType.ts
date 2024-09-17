
import { Document,Types } from 'mongoose';

export interface IPDF extends Document {
  userId: Types.ObjectId;
  title: string;
  pdf: string; 
  uploadedAt: Date;
}
