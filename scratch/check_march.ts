
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TransactionSchema = new mongoose.Schema({
  amount: Number,
  type: String,
  category: String,
  subcategory: String,
  monthYear: String,
  date: String,
  uid: String
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

async function checkMarch() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gratamira');
  const marchTxs = await Transaction.find({ monthYear: '2026-03' });
  console.log('Transactions in March 2026:', marchTxs.length);
  marchTxs.forEach(t => console.log(`- ${t.subcategory}: ${t.amount}`));
  process.exit(0);
}
checkMarch().catch(err => { console.error(err); process.exit(1); });
