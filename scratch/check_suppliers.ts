
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const SupplierSchema = new mongoose.Schema({
  name: String,
  uid: String
});
const Supplier = mongoose.model('Supplier', SupplierSchema);

async function checkSuppliers() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gratamira');
  const sups = await Supplier.find({});
  console.log('Suppliers registered:', sups.length);
  sups.forEach(s => console.log(`- ${s.name} (${s._id})`));
  process.exit(0);
}
checkSuppliers().catch(err => { console.error(err); process.exit(1); });
