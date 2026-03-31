import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['business', 'home'], required: true },
  subcategory: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String, required: true },
  monthYear: { type: String, required: true },
  uid: { type: String, required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null }
}, { timestamps: true });

export const TransactionModel = mongoose.model('Transaction', TransactionSchema);
