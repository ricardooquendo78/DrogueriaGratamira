import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { TransactionModel } from './models/Transaction.js';
import { SupplierModel, CategoryModel, MonthlyClosureModel, AppSettingsModel, UserModel } from './models/OtherModels.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment variables.");
  process.exit(1);
}

import dns from 'dns';

// Fix for Node.js DNS resolution issues on Windows (ECONNREFUSED for SRV records)
dns.setDefaultResultOrder('ipv4first');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    // Seed Default Users
    const defaultUsers = [
      { email: 'ricardooquendo00@gmail.com', password: '7878', displayName: 'Ricardo Oquendo', uid: 'user-ricardo' },
      { email: 'drogueriagratamira@gmail.com', password: '4821', displayName: 'Margarita Alzate', uid: 'user-margarita' }
    ];
    for (const u of defaultUsers) {
      const exists = await UserModel.findOne({ email: u.email });
      if (!exists) {
        await new UserModel(u).save();
        console.log(`Seeded user: ${u.email}`);
      }
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));


// --- API ROUTES ---

// Authentication
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Return sanitized user
    res.json({ uid: user.uid, email: user.email, displayName: user.displayName });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Transactions
app.get('/api/transactions/:uid', async (req, res) => {
  try {
    const transactions = await TransactionModel.find({ uid: req.params.uid }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/transactions/month/:monthYear', async (req, res) => {
  try {
    const { uid } = req.query;
    const transactions = await TransactionModel.find({ 
      monthYear: req.params.monthYear,
      uid: uid
    }).sort({ date: 1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = new TransactionModel(req.body);
    const saved = await newTransaction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await TransactionModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Categories
app.get('/api/categories/:uid', async (req, res) => {
  try {
    const categories = await CategoryModel.find({ uid: req.params.uid });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const newCategory = new CategoryModel(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await CategoryModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Suppliers
app.get('/api/suppliers/:uid', async (req, res) => {
  try {
    const suppliers = await SupplierModel.find({ uid: req.params.uid });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const newSupplier = new SupplierModel(req.body);
    const saved = await newSupplier.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await SupplierModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Closures
app.get('/api/closures/:uid', async (req, res) => {
  try {
    const closures = await MonthlyClosureModel.find({ uid: req.params.uid }).sort({ monthYear: -1 });
    res.json(closures);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/closures', async (req, res) => {
  try {
    const newClosure = new MonthlyClosureModel(req.body);
    const saved = await newClosure.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Settings
app.get('/api/settings/:uid', async (req, res) => {
  try {
    const settings = await AppSettingsModel.findOne({ uid: req.params.uid });
    res.json(settings || { fixedExpensesGoal: 5000000 });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { uid, fixedExpensesGoal } = req.body;
    const settings = await AppSettingsModel.findOneAndUpdate(
      { uid },
      { fixedExpensesGoal },
      { upsert: true, new: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Start server natively only if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

// Export the express app for Vercel
export default app;
