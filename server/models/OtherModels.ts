import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uid: { type: String, required: true, index: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });

export const SupplierModel = mongoose.model('Supplier', SupplierSchema);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ['business', 'home'], required: true },
  uid: { type: String, required: true, index: true }
}, { timestamps: true });

export const CategoryModel = mongoose.model('Category', CategorySchema);

const MonthlyClosureSchema = new mongoose.Schema({
  monthYear: { type: String, required: true, unique: true },
  totalIncome: { type: Number, required: true },
  totalBusinessExpenses: { type: Number, required: true },
  totalHomeExpenses: { type: Number, required: true },
  balance: { type: Number, required: true },
  timestamp: { type: String, required: true },
  uid: { type: String, required: true, index: true }
}, { timestamps: true });

export const MonthlyClosureModel = mongoose.model('MonthlyClosure', MonthlyClosureSchema);

const AppSettingsSchema = new mongoose.Schema({
  fixedExpensesGoal: { type: Number, required: true },
  uid: { type: String, required: true, unique: true }
});

export const AppSettingsModel = mongoose.model('AppSettings', AppSettingsSchema);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  uid: { type: String, required: true, unique: true }
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);

