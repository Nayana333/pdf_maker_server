// models/pdfDetails.ts
import mongoose, { Schema } from 'mongoose';
import { IPDF } from './pdfType';

const pdfSchema: Schema<IPDF> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
},

  title: {
    type: String,
    required: true,
  },
  pdf: {
    type: String,  
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model<IPDF>('pdfDetails', pdfSchema);
