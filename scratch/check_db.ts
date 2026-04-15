
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TransactionSchema = new mongoose.Schema({
  amount: Number,
  type: String,
  category: String,
  subcategory: String,
  supplierId: String,
  date: String,
  uid: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

async function checkSuppliers() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gratamira');
  const txs = await Transaction.find({ supplierId: { $exists: true, $ne: null } });
  console.log('Transactions with supplierId:', txs.length);
  txs.forEach(t => console.log(`- ${t.subcategory}: ${t.amount} (Supplier: ${t.supplierId})`));
  process.exit(0);
}

checkSuppliers().catch(err => { console.error(err); process.exit(1); });
