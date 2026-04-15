
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const ClosureSchema = new mongoose.Schema({
  monthYear: String,
  uid: String
});
const MonthlyClosure = mongoose.model('MonthlyClosure', ClosureSchema);

async function checkClosures() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gratamira');
  const closures = await MonthlyClosure.find({});
  console.log('Closures in DB:', closures.length);
  closures.forEach(c => console.log(`- ${c.monthYear}`));
  process.exit(0);
}
checkClosures().catch(err => { console.error(err); process.exit(1); });
