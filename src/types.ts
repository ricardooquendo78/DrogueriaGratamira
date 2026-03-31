export type TransactionType = 'income' | 'expense';
export type CategoryType = 'business' | 'home';

export interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  category: CategoryType;
  subcategory: string;
  description: string;
  date: string;
  monthYear: string;
  uid: string;
  supplierId?: string; // Optional field for supplier payments
}

export interface Supplier {
  id?: string;
  name: string;
  uid: string;
  createdAt: string;
}

export interface MonthlyClosure {
  id?: string;
  monthYear: string;
  totalIncome: number;
  totalBusinessExpenses: number;
  totalHomeExpenses: number;
  balance: number;
  timestamp: string;
  uid: string;
}

export interface AppSettings {
  fixedExpensesGoal: number;
}

export interface Category {
  id?: string;
  name: string;
  type: TransactionType;
  category: CategoryType;
  uid: string;
}
