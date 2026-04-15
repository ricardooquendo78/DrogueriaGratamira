import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { motion } from 'motion/react';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
}

// In production (Vercel), requests to /api are handled by the serverless functions.
// In development, they are routed to the local Node app.
const API_URL = (import.meta as any).env?.PROD ? '/api' : 'http://localhost:5000/api';
import { 
  Transaction, 
  MonthlyClosure, 
  AppSettings, 
  TransactionType, 
  CategoryType,
  Category,
  Supplier
} from './types';
import { 
  BUSINESS_SUBCATEGORIES, 
  HOME_SUBCATEGORIES, 
  INCOME_SUBCATEGORIES 
} from './constants';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Home, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Tags,
  Trash2,
  Save,
  Sun,
  Moon,
  Download,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, parseISO, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Enums for Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// --- Error Boundary ---

class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
          <div className="max-w-md w-full organic-card p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="text-rose-600 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-display text-brand-ink mb-4">Error en la Aplicación</h2>
            <p className="text-sm text-brand-secondary mb-8">Ocurrió un problema inesperado.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full organic-btn bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const Auth = ({ onLogin }: { onLogin: (user: AppUser) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Credenciales inválidas');
      }
      const user = await res.json();
      localStorage.setItem('gratamira_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/10 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-brand-accent/10 blur-[100px] rounded-full" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full organic-card p-6 md:p-12 text-center relative z-10"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 border border-white/10">
          <Wallet className="text-brand-secondary w-10 h-10 md:w-12 md:h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-brand-ink mb-4 tracking-tight">Gratamira</h1>
        <p className="text-brand-ink/50 mb-8 md:mb-12 font-medium tracking-wide text-xs md:text-sm">Acceso Autorizado</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Correo Electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="organic-input w-full text-base"
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="organic-input w-full text-base"
            required 
          />
          {error && <p className="text-rose-400 text-sm font-bold bg-rose-500/10 py-2 rounded-lg">{error}</p>}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full organic-btn bg-brand-primary text-white hover:brightness-110 flex items-center justify-center gap-4 text-base md:text-lg shadow-xl shadow-brand-primary/30 border border-white/10"
          >
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, amount, icon: Icon, colorClass, trend }: any) => (
  <motion.div 
    whileHover={{ y: -4, scale: 1.02 }}
    className="organic-card p-5 md:p-8 group overflow-hidden relative"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-colors" />
    <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
      <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg", colorClass)}>
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      {trend && (
        <div className={cn("px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border", trend > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20")}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-xs md:text-sm font-medium text-brand-ink/50 mb-2 relative z-10 uppercase tracking-widest">{title}</h3>
    <p className="text-2xl md:text-3xl font-accent text-brand-ink relative z-10">
      ${Math.round(amount).toLocaleString('es-CO')}
    </p>
  </motion.div>
);

const HealthThermometer = ({ current, goal }: { current: number, goal: number }) => {
  const percentage = Math.min(Math.max((current / goal) * 100, 0), 100);
  const isHealthy = current >= goal;

  return (
    <div className="organic-card p-5 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent opacity-50" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg md:text-xl font-accent italic text-brand-ink">Salud de Caja</h3>
        <span className={cn(
          "px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border",
          isHealthy ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        )}>
          {isHealthy ? 'Estado Saludable' : 'Atención Requerida'}
        </span>
      </div>
      <div className="relative h-3 md:h-4 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,245,255,0.5)]",
            isHealthy ? "bg-brand-secondary" : "bg-brand-accent"
          )}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-2 text-[10px] md:text-xs font-medium text-white/40">
        <span>Actual: ${Math.round(current).toLocaleString('es-CO')}</span>
        <span>Meta: ${goal.toLocaleString('es-CO')}</span>
      </div>
    </div>
  );
};

const CategoriesManager = ({ categories, suppliers, user }: { categories: Category[], suppliers: Supplier[], user: AppUser }) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newCategory, setNewCategory] = useState<CategoryType>('business');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          category: newType === 'income' ? 'business' : newCategory,
          uid: user.uid
        })
      });
      setNewName('');
      setSuccess('Categoría creada con éxito');
      setTimeout(() => setSuccess(null), 3000);
      // Trigger a re-fetch of categories (simplified by reloading effectively or adding a state)
      window.location.reload(); 
    } catch (error) {
      setError('Error al crear categoría');
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName.trim(),
          uid: user.uid,
          createdAt: new Date().toISOString()
        })
      });
      setNewSupplierName('');
      setSuccess('Proveedor agregado con éxito');
      setTimeout(() => setSuccess(null), 3000);
      window.location.reload();
    } catch (error) {
      setError('Error al agregar proveedor');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await fetch(`${API_URL}/suppliers/${id}`, { method: 'DELETE' });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  return (
    <div className="space-y-12">
      {(error || success) && (
        <div className={cn(
          "fixed top-24 md:top-8 right-4 md:right-8 z-50 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-8 duration-300 max-w-[90vw] md:max-w-md",
          error ? "bg-rose-50 border border-rose-100 text-rose-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"
        )}>
          {error ? <AlertCircle className="w-6 h-6 shrink-0" /> : <CheckCircle2 className="w-6 h-6 shrink-0" />}
          <p className="font-bold text-sm md:text-base">{error || success}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Categories Section */}
        <div className="space-y-6 md:space-y-8">
          <div className="organic-card p-6 md:p-10">
            <h3 className="text-2xl md:text-3xl font-display mb-6 md:mb-8 italic">Nueva Categoría</h3>
            <form onSubmit={handleAddCategory} className="space-y-4 md:space-y-6">
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre de la categoría..."
                className="organic-input text-sm md:text-base"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TransactionType)}
                  className="organic-input text-sm md:text-base"
                >
                  <option value="expense">Egreso</option>
                  <option value="income">Ingreso</option>
                </select>
                {newType === 'expense' && (
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                    className="organic-input text-sm md:text-base"
                  >
                    <option value="business">Negocio</option>
                    <option value="home">Hogar</option>
                  </select>
                )}
              </div>
              <button 
                type="submit"
                className="w-full organic-btn bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/10 py-4 md:py-5"
              >
                <PlusCircle className="w-5 h-5 inline-block mr-2" /> Crear Categoría
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {['income', 'expense'].map((type) => (
              <div key={type} className="organic-card p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-display mb-6 italic">
                  {type === 'income' ? 'Fuentes de Ingreso' : 'Tipos de Egreso'}
                </h3>
                <div className="space-y-3">
                  {categories
                    .filter(c => c.type === type)
                    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                    .map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg/40 border border-transparent hover:border-brand-primary/10 transition-all group">
                        <div>
                          <p className="font-bold text-brand-ink text-sm">{cat.name}</p>
                          {type === 'expense' && (
                            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                              {cat.category === 'business' ? 'Negocio' : 'Hogar'}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => cat.id && handleDeleteCategory(cat.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers Section */}
        <div className="space-y-6 md:space-y-8">
          <div className="organic-card p-6 md:p-10">
            <h3 className="text-2xl md:text-3xl font-display mb-6 md:mb-8 italic">Gestión de Proveedores</h3>
            <form onSubmit={handleAddSupplier} className="space-y-4 md:space-y-6">
              <input 
                type="text"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Nombre del proveedor..."
                className="organic-input text-sm md:text-base"
                required
              />
              <button 
                type="submit"
                className="w-full organic-btn bg-brand-accent text-white hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/10 py-4 md:py-5"
              >
                <PlusCircle className="w-5 h-5 inline-block mr-2" /> Agregar Proveedor
              </button>
            </form>
          </div>

          <div className="organic-card p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-display mb-6 italic">Lista de Proveedores</h3>
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg/40 border border-transparent hover:border-brand-primary/10 transition-all group">
                  <p className="font-bold text-brand-ink text-sm">{supplier.name}</p>
                  <button 
                    onClick={() => supplier.id && handleDeleteSupplier(supplier.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {suppliers.length === 0 && (
                <p className="text-center py-10 text-brand-secondary italic text-sm">No hay proveedores registrados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuppliersReport = ({ transactions, suppliers }: { transactions: Transaction[], suppliers: Supplier[] }) => {
  const supplierStats = useMemo(() => {
    const stats: { [key: string]: { total: number, payments: Transaction[] } } = {};
    
    // Initialize stats for all suppliers
    suppliers.forEach(s => {
      if (s.id) stats[s.id] = { total: 0, payments: [] };
    });

    // Filter transactions that have a supplierId
    transactions.filter(t => t.supplierId && t.subcategory === 'Facturas proveedores').forEach(t => {
      if (t.supplierId && stats[t.supplierId]) {
        stats[t.supplierId].total += t.amount;
        stats[t.supplierId].payments.push(t);
      }
    });

    return Object.entries(stats).map(([id, data]) => ({
      id,
      name: suppliers.find(s => s.id === id)?.name || 'Desconocido',
      ...data
    })).sort((a, b) => b.total - a.total);
  }, [transactions, suppliers]);

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {supplierStats.map((stat) => (
          <div key={stat.id} className="organic-card p-5 md:p-10 flex flex-col">
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-brand-accent" />
              </div>
              <div className="text-right">
                <p className="text-[10px] md:text-xs font-bold text-brand-secondary uppercase tracking-widest mb-1">Total Pagado</p>
                <p className="text-2xl md:text-3xl font-display text-brand-ink italic">${Math.round(stat.total).toLocaleString('es-CO')}</p>
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-display mb-6 italic border-b border-black/5 pb-4">{stat.name}</h3>
            
            <div className="space-y-4 flex-1 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {stat.payments.length > 0 ? (
                stat.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 md:p-4 rounded-2xl bg-brand-bg/40 text-xs md:text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-brand-ink">{format(parseISO(p.date), "d MMM, yyyy", { locale: es })}</span>
                      {p.description && <span className="text-[10px] text-brand-secondary italic truncate max-w-[100px] md:max-w-[120px]">{p.description}</span>}
                    </div>
                    <span className="font-display text-base md:text-lg text-brand-primary">${Math.round(p.amount).toLocaleString('es-CO')}</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-brand-secondary italic text-xs">No hay pagos registrados.</p>
              )}
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-32 text-center organic-card">
            <Briefcase className="w-16 h-16 text-brand-secondary/20 mx-auto mb-6" />
            <p className="text-brand-secondary italic text-lg">No hay proveedores registrados para generar reportes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'add' | 'history' | 'closure-detail' | 'categories' | 'suppliers-report'>('dashboard');
  const [selectedClosure, setSelectedClosure] = useState<MonthlyClosure | null>(null);
  const [closureTransactions, setClosureTransactions] = useState<Transaction[]>([]);
  const [loadingClosure, setLoadingClosure] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]); // For reports
  const [closures, setClosures] = useState<MonthlyClosure[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ fixedExpensesGoal: 5000000 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('gratamira_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gratamira_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: 'business' as CategoryType,
    subcategory: '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    supplierId: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('gratamira_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions/${user.uid}`);
        const data = await response.json();
        const currentMonth = format(new Date(), 'yyyy-MM');
        setTransactions(data.filter((t: Transaction) => t.monthYear === currentMonth));
        setAllTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
    
    // In a real MongoDB app, we could use WebSockets for real-time updates.
    // For now, simple fetch is used.
    const interval = setInterval(fetchTransactions, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${API_URL}/suppliers/${user.uid}`);
        const data = await response.json();
        data.sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name));
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchClosures = async () => {
      try {
        const response = await fetch(`${API_URL}/closures/${user.uid}`);
        const data = await response.json();
        setClosures(data);
      } catch (error) {
        console.error("Error fetching closures:", error);
      }
    };
    fetchClosures();
  }, [user]);

  // Automatic Month Closure Logic
  useEffect(() => {
    if (!user || allTransactions.length === 0 || closures.length === 0) return;

    const checkAndCloseMonths = async () => {
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      // Get all unique months from transactions
      const monthsInTransactions = [...new Set(allTransactions.map(t => t.monthYear))];
      const closedMonths = closures.map(c => c.monthYear);

      // Find months that are not the current month and are not closed
      const missingMonths = monthsInTransactions.filter(m => 
        m < currentMonth && !closedMonths.includes(m)
      );

      if (missingMonths.length > 0) {
        for (const month of missingMonths) {
          const monthTransactions = allTransactions.filter(t => t.monthYear === month);
          
          const monthTotals = monthTransactions.reduce((acc, t) => {
            if (t.type === 'income') {
              acc.income += t.amount;
            } else {
              if (t.category === 'business') acc.businessExpenses += t.amount;
              else acc.homeExpenses += t.amount;
            }
            return acc;
          }, { income: 0, businessExpenses: 0, homeExpenses: 0 });

          try {
            await fetch(`${API_URL}/closures`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                monthYear: month,
                totalIncome: monthTotals.income,
                totalBusinessExpenses: monthTotals.businessExpenses,
                totalHomeExpenses: monthTotals.homeExpenses,
                balance: monthTotals.income - (monthTotals.businessExpenses + monthTotals.homeExpenses),
                timestamp: new Date().toISOString(),
                uid: user.uid
              })
            });
            console.log(`Auto-closed month: ${month}`);
          } catch (error) {
            console.error(`Error auto-closing month ${month}:`, error);
          }
        }
      }
    };

    checkAndCloseMonths();
  }, [user, allTransactions, closures]);

  useEffect(() => {
    if (!user) return;
    const getSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings/${user.uid}`);
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error getting settings:", error);
      }
    };
    getSettings();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/${user.uid}`);
        const cats = await response.json();
        
        if (cats.length === 0) {
          // Seed initial categories if empty
          const initial = [
            ...INCOME_SUBCATEGORIES.map(name => ({ name, type: 'income' as TransactionType, category: 'business' as CategoryType, uid: user.uid })),
            ...BUSINESS_SUBCATEGORIES.map(name => ({ name, type: 'expense' as TransactionType, category: 'business' as CategoryType, uid: user.uid })),
            ...HOME_SUBCATEGORIES.map(name => ({ name, type: 'expense' as TransactionType, category: 'home' as CategoryType, uid: user.uid }))
          ];
          for (const cat of initial) {
            await fetch(`${API_URL}/categories`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cat)
            });
          }
          // Fetch again after seeding
          const res2 = await fetch(`${API_URL}/categories/${user.uid}`);
          setCategories(await res2.json());
        } else {
          setCategories(cats);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [user]);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const businessExpenses = transactions.filter(t => t.type === 'expense' && t.category === 'business').reduce((acc, t) => acc + t.amount, 0);
    const homeExpenses = transactions.filter(t => t.type === 'expense' && t.category === 'home').reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      businessExpenses,
      homeExpenses,
      totalExpenses: businessExpenses + homeExpenses,
      balance: income - (businessExpenses + homeExpenses)
    };
  }, [transactions]);

  const chartData = [
    { 
      name: 'Balance', 
      Ingresos: totals.income, 
      'Gastos Comunes': totals.homeExpenses, 
      'Costos Negocio': totals.businessExpenses 
    }
  ];

  const expenseDistribution = useMemo(() => {
    const dist: { [key: string]: number } = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      dist[t.subcategory] = (dist[t.subcategory] || 0) + t.amount;
    });
    return Object.entries(dist).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.amount || !formData.subcategory) return;

    const amountNum = Math.round(parseFloat(formData.amount));
    const dateObj = parseISO(formData.date);
    const monthYear = format(dateObj, 'yyyy-MM');

    // Validation for mandatory observations
    if (formData.type === 'expense' && formData.category === 'home' && (formData.subcategory === 'Gastos diarios' || formData.subcategory === 'Otros Hogar') && !formData.description) {
      console.warn("Observación obligatoria faltante");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: amountNum,
          uid: user.uid,
          monthYear,
          supplierId: (formData.supplierId && formData.supplierId.trim() !== '') ? formData.supplierId : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la transacción');
      }

      setFormData({
        type: 'expense',
        amount: '',
        category: 'business',
        subcategory: '',
        description: '',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        supplierId: ''
      });
      
      // Actualizar el estado local antes de recargar para una mejor UX
      const savedTransaction = await response.json();
      setTransactions(prev => [savedTransaction, ...prev]);
      
      setView('dashboard');
      // No recargamos instantáneamente para que el usuario vea el cambio, 
      // o usamos window.location.reload() si lo prefieres, pero después de validar éxito.
      window.location.reload(); 
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert(error instanceof Error ? error.message : 'Error desconocido al guardar');
    }
  };

  const handleViewClosure = async (closure: MonthlyClosure) => {
    setSelectedClosure(closure);
    setLoadingClosure(true);
    setView('closure-detail');

    try {
      const response = await fetch(`${API_URL}/transactions/month/${closure.monthYear}?uid=${user.uid}`);
      const data = await response.json();
      setClosureTransactions(data);
    } catch (error) {
      console.error("Error fetching closure transactions:", error);
    } finally {
      setLoadingClosure(false);
    }
  };

  const handleExportExcel = () => {
    if (!selectedClosure || !closureTransactions.length) {
      alert("No hay transacciones para exportar");
      return;
    }

    const fileName = `Reporte_Gratamira_${selectedClosure.monthYear}.xlsx`;
    
    // Prepare data for Excel
    const data = closureTransactions.map(t => ({
      Fecha: format(parseISO(t.date), "dd/MM/yyyy"),
      Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
      'Ámbito': t.category === 'business' ? 'Negocio' : 'Hogar',
      'Subcategoría': t.subcategory,
      'Descripción': t.description || '-',
      Monto: t.amount
    }));

    // Create summary rows
    const summaryData = [
      {}, // Empty row
      { Fecha: 'RESUMEN TOTAL', Tipo: '', 'Ámbito': '', 'Subcategoría': '', 'Descripción': '', Monto: '' },
      { Fecha: 'Total Ingresos', Tipo: '', 'Ámbito': '', 'Subcategoría': '', 'Descripción': '', Monto: selectedClosure.totalIncome },
      { Fecha: 'Gastos Negocio', Tipo: '', 'Ámbito': '', 'Subcategoría': '', 'Descripción': '', Monto: selectedClosure.totalBusinessExpenses },
      { Fecha: 'Gastos Hogar', Tipo: '', 'Ámbito': '', 'Subcategoría': '', 'Descripción': '', Monto: selectedClosure.totalHomeExpenses },
      { Fecha: 'Balance Neto', Tipo: '', 'Ámbito': '', 'Subcategoría': '', 'Descripción': '', Monto: selectedClosure.balance }
    ];

    const worksheet = XLSX.utils.json_to_sheet([...data, ...summaryData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transacciones");
    
    XLSX.writeFile(workbook, fileName);
  };

  const groupedClosureTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    closureTransactions.forEach(t => {
      const day = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!groups[day]) groups[day] = [];
      groups[day].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [closureTransactions]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="font-display text-white text-xl tracking-widest uppercase animate-pulse">Cargando...</div>
      </div>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <ErrorBoundary>
      <div className="h-screen bg-brand-bg flex flex-col md:flex-row font-sans selection:bg-brand-primary/20 relative overflow-hidden">
        {/* Background nebula effects */}
        <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-brand-secondary/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Mobile Header */}
      <div className="md:hidden bg-brand-bg/80 backdrop-blur-2xl border-b border-brand-ink/5 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 border border-white/10">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display tracking-tight text-brand-ink">Gratamira</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-3 bg-brand-ink/5 rounded-xl text-brand-ink border border-brand-ink/10"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 bg-brand-ink/5 rounded-xl text-brand-ink border border-brand-ink/10"
          >
            {isMobileMenuOpen ? <ArrowLeft className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar / Navigation */}
      <nav className={cn(
        "fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-2xl md:relative md:inset-auto md:flex md:w-80 border-r border-white/10 flex-col p-8 md:p-10 transition-transform duration-500 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-6 right-6 p-3 bg-brand-ink/5 rounded-xl text-brand-ink border border-brand-ink/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-5 mb-12 md:mb-16">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 border border-white/10">
            <Wallet className="text-white w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display tracking-tight text-brand-ink">Gratamira</h1>
        </div>

        <div className="flex-1 space-y-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'add', icon: PlusCircle, label: 'Nueva Transacción' },
            { id: 'history', icon: History, label: 'Historial' },
            { id: 'suppliers-report', icon: Briefcase, label: 'Pagos Proveedores' },
            { id: 'categories', icon: Tags, label: 'Categorías' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-5 px-8 py-5 rounded-2xl transition-all duration-300 border",
                view === item.id 
                  ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 border-white/20" 
                  : "text-brand-ink/40 border-transparent hover:bg-brand-ink/5 hover:text-brand-ink"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-10 border-t border-white/10">
          <div className="flex items-center gap-5 mb-8 p-5 bg-brand-ink/5 rounded-3xl border border-brand-ink/5">
            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-12 h-12 rounded-2xl border-2 border-brand-ink/10 shadow-sm" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-brand-ink truncate">{user.displayName}</p>
              <p className="text-[10px] text-brand-ink/30 font-bold uppercase tracking-widest">Administrador</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('gratamira_user'); setUser(null); }}
            className="w-full flex items-center gap-5 px-8 py-5 text-rose-400 font-medium hover:bg-rose-500/10 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-16 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-8">
          <div>
            <h2 className="text-3xl md:text-7xl font-display text-brand-ink leading-tight mb-2 italic">
              {view === 'dashboard' && 'Resumen General'}
              {view === 'add' && 'Nuevo Registro'}
              {view === 'history' && 'Historial de Cierres'}
              {view === 'closure-detail' && 'Detalle del Mes'}
              {view === 'suppliers-report' && 'Pagos a Proveedores'}
              {view === 'categories' && 'Gestión de Categorías'}
            </h2>
            <p className="text-brand-secondary text-xs md:text-base font-medium tracking-wide">
              {view === 'closure-detail' && selectedClosure 
                ? format(parseISO(`${selectedClosure.monthYear}-01`), "MMMM yyyy", { locale: es })
                : format(new Date(), "MMMM yyyy", { locale: es })}
            </p>
          </div>
          
            {view === 'dashboard' && (
              <div className="flex items-center gap-3 bg-brand-bg/50 px-4 py-2 rounded-xl border border-brand-ink/5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-brand-ink/60 uppercase tracking-widest">En curso</span>
              </div>
            )}
        </header>

        {view === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              <StatCard 
                title="Saldo Disponible" 
                amount={totals.balance} 
                icon={Wallet} 
                colorClass="bg-brand-primary" 
              />
              <StatCard 
                title="Ingresos del Mes" 
                amount={totals.income} 
                icon={TrendingUp} 
                colorClass="bg-emerald-600" 
              />
              <StatCard 
                title="Gastos de Negocio" 
                amount={totals.businessExpenses} 
                icon={Briefcase} 
                colorClass="bg-brand-secondary" 
              />
              <StatCard 
                title="Gastos del Hogar" 
                amount={totals.homeExpenses} 
                icon={Home} 
                colorClass="bg-brand-accent" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Charts */}
              <div className="lg:col-span-2 space-y-10">
                <div className="organic-card p-5 md:p-10 text-brand-ink">
                  <h3 className="text-2xl font-accent mb-8 italic text-brand-ink">Balance Mensual</h3>
                  <div className="h-[280px] md:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }} 
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip 
                          cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                          contentStyle={{ 
                            borderRadius: '24px', 
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                            background: theme === 'dark' ? 'rgba(11, 13, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            padding: '16px'
                          }}
                          itemStyle={{ color: 'var(--color-brand-ink)' }}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Bar dataKey="Ingresos" stackId="a" fill="#9D4EDD" radius={[10, 10, 0, 0]} barSize={60} />
                        <Bar dataKey="Gastos Comunes" stackId="b" fill="#FF007F" barSize={60} />
                        <Bar dataKey="Costos Negocio" stackId="b" fill="#00F5FF" radius={[10, 10, 0, 0]} barSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="organic-card p-5 md:p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl md:text-2xl font-accent italic text-brand-ink">Actividad Reciente</h3>
                    <button onClick={() => setView('add')} className="text-sm text-brand-secondary font-bold hover:text-brand-primary transition-colors uppercase tracking-widest">Registrar nueva</button>
                  </div>
                  <div className="divide-y divide-brand-ink/5">
                    {transactions.slice(0, 6).map((t) => (
                       <div key={t.id} className="flex items-center justify-between py-5 group transition-all">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                            t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-brand-ink/5 text-brand-ink/40 border-brand-ink/10"
                          )}>
                            {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-ink">{t.subcategory}</p>
                            <p className="text-xs text-brand-ink/40 font-medium">
                              {format(parseISO(t.date), "d 'de' MMM", { locale: es })} • {t.category === 'business' ? 'Negocio' : 'Hogar'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-bold text-lg", t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-brand-ink")}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CO')}
                          </p>
                          {t.description && <p className="text-[10px] text-brand-ink/30 truncate max-w-[150px]">{t.description}</p>}
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-brand-ink/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-ink/10">
                          <Wallet className="text-brand-ink/20 w-8 h-8" />
                        </div>
                        <p className="text-brand-ink/30 italic">No hay movimientos registrados este mes.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-10">
                <HealthThermometer current={totals.income} goal={settings.fixedExpensesGoal} />
                
                <div className="bg-brand-primary/20 backdrop-blur-xl p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-white border border-white/10 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-accent mb-6 italic text-brand-ink">Distribución de Gastos</h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseDistribution}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {expenseDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#00F5FF' : index === 1 ? '#FF007F' : `rgba(255,255,255,${0.5 - (index * 0.1)})`} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '20px', 
                              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                              background: theme === 'dark' ? 'rgba(11, 13, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(12px)',
                              padding: '12px' 
                            }}
                            itemStyle={{ color: 'var(--color-brand-ink)' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-6 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {expenseDistribution.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs items-center">
                          <span className="text-brand-ink/60 truncate mr-3 font-medium">{item.name}</span>
                          <span className="font-bold bg-brand-ink/10 px-2 py-1 rounded-lg text-brand-secondary">${Math.round(item.value).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -top-20 -left-20 w-60 h-60 bg-brand-secondary/10 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="max-w-3xl mx-auto">
            <div className="organic-card p-5 md:p-12">
              <form onSubmit={handleAddTransaction} className="space-y-8 md:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 p-2 bg-brand-ink/5 rounded-[24px] border border-brand-ink/10">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: 'business', subcategory: '' })}
                    className={cn(
                      "py-4 md:py-5 rounded-[20px] font-accent text-lg md:text-xl transition-all duration-300",
                      formData.type === 'expense' ? "bg-brand-primary text-white shadow-lg" : "text-white/40"
                    )}
                  >
                    Egreso
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: 'business', subcategory: '' })}
                    className={cn(
                      "py-4 md:py-5 rounded-[20px] font-accent text-lg md:text-xl transition-all duration-300",
                      formData.type === 'income' ? "bg-brand-secondary text-brand-bg shadow-lg" : "text-white/40"
                    )}
                  >
                    Ingreso
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-brand-secondary px-2">Monto del Registro</label>
                  <div className="relative">
                    <span className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-2xl md:text-4xl font-display text-brand-secondary">$</span>
                    <input 
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 bg-brand-bg rounded-[24px] border border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 text-3xl md:text-5xl font-display placeholder:text-brand-secondary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                {formData.type === 'expense' && (
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-brand-secondary px-2">Ámbito del Gasto</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, category: 'business', subcategory: '' })}
                        className={cn(
                          "py-4 md:py-6 rounded-[24px] border-2 transition-all flex items-center justify-center gap-4 font-medium",
                          formData.category === 'business' ? "border-brand-primary bg-brand-primary/5 text-brand-primary shadow-lg shadow-brand-primary/5" : "border-brand-bg text-brand-secondary hover:border-brand-primary/20"
                        )}
                      >
                        <Briefcase className="w-5 h-5 md:w-6 md:h-6" /> Negocio
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, category: 'home', subcategory: '' })}
                        className={cn(
                          "py-4 md:py-6 rounded-[24px] border-2 transition-all flex items-center justify-center gap-4 font-medium",
                          formData.category === 'home' ? "border-brand-accent bg-brand-accent/5 text-brand-accent shadow-lg shadow-brand-accent/5" : "border-brand-bg text-brand-secondary hover:border-brand-accent/20"
                        )}
                      >
                        <Home className="w-5 h-5 md:w-6 md:h-6" /> Hogar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-brand-secondary px-2">Subcategoría</label>
                    <select 
                      required
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value, supplierId: '' })}
                      className="organic-input font-semibold text-brand-ink appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      {categories
                        .filter(c => c.type === formData.type && (formData.type === 'income' || c.category === formData.category))
                        .map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                      }
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-brand-secondary px-2">Fecha y Hora</label>
                    <input 
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="organic-input font-semibold text-brand-ink"
                    />
                  </div>
                </div>

                {/* Supplier Selection (Only for Facturas proveedores) */}
                {formData.subcategory === 'Facturas proveedores' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 p-6 md:p-8 bg-brand-bg/50 rounded-[32px] border border-brand-primary/10"
                  >
                    <p className="text-xs font-bold text-brand-secondary uppercase tracking-widest ml-2">Seleccionar Proveedor</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {suppliers.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, supplierId: s.id || '' })}
                          className={cn(
                            "p-3 md:p-4 rounded-2xl text-sm font-bold transition-all border-2 text-center",
                            formData.supplierId === s.id
                              ? "bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-accent/20"
                              : "bg-white text-brand-ink border-black/5 hover:border-brand-accent/20"
                          )}
                        >
                          {s.name}
                        </button>
                      ))}
                      {suppliers.length === 0 && (
                        <p className="col-span-full text-center py-6 text-brand-secondary italic text-sm">
                          No hay proveedores registrados. Ve a Categorías para agregarlos.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-brand-secondary px-2">
                    Observaciones {(formData.category === 'home' && (formData.subcategory === 'Gastos diarios' || formData.subcategory === 'Otros Hogar')) && <span className="text-brand-accent">*</span>}
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Escribe aquí cualquier detalle adicional..."
                    className="organic-input min-h-[140px] font-medium text-brand-ink leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full organic-btn bg-brand-primary text-white hover:bg-brand-primary/90 text-lg md:text-xl py-5 md:py-7 shadow-2xl shadow-brand-primary/20"
                >
                  Confirmar Registro
                </button>
              </form>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {closures.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => handleViewClosure(c)}
                  className="organic-card p-6 md:p-10 cursor-pointer group hover:bg-brand-bg transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-display text-brand-ink italic leading-none">
                        {format(parseISO(`${c.monthYear}-01`), "MMMM", { locale: es })}
                      </h3>
                      <p className="text-sm font-medium text-brand-secondary mt-2">{format(parseISO(`${c.monthYear}-01`), "yyyy")}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-brand-bg flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-brand-secondary">Ingresos Totales</span>
                      <span className="text-emerald-500 font-bold">${Math.round(c.totalIncome).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-ink/40">Gastos Negocio</span>
                      <span className="text-brand-ink/60 font-medium">${Math.round(c.totalBusinessExpenses).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-ink/40">Gastos Hogar</span>
                      <span className="text-brand-ink/60 font-medium">${Math.round(c.totalHomeExpenses).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="pt-6 border-t border-brand-ink/5 flex justify-between items-end">
                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Balance Neto</span>
                      <span className="text-3xl font-display text-brand-primary italic">${Math.round(c.balance).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {closures.length === 0 && (
                <div className="col-span-full py-32 text-center organic-card">
                  <History className="w-16 h-16 text-brand-secondary/20 mx-auto mb-6" />
                  <p className="text-brand-secondary italic text-lg">Aún no se han realizado cierres mensuales.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'closure-detail' && selectedClosure && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <button 
                onClick={() => setView('history')}
                className="flex items-center gap-3 text-brand-secondary hover:text-brand-primary transition-colors font-medium group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver al Historial
              </button>

              <button 
                onClick={handleExportExcel}
                className="organic-btn bg-emerald-600 text-white flex items-center gap-3 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20"
              >
                <Download className="w-5 h-5" /> Exportar a Excel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                title="Ingresos" 
                amount={selectedClosure.totalIncome} 
                icon={TrendingUp} 
                colorClass="bg-emerald-600" 
              />
              <StatCard 
                title="Gastos Negocio" 
                amount={selectedClosure.totalBusinessExpenses} 
                icon={Briefcase} 
                colorClass="bg-brand-secondary" 
              />
              <StatCard 
                title="Gastos Hogar" 
                amount={selectedClosure.totalHomeExpenses} 
                icon={Home} 
                colorClass="bg-brand-accent" 
              />
              <StatCard 
                title="Balance Final" 
                amount={selectedClosure.balance} 
                icon={Wallet} 
                colorClass="bg-brand-primary" 
              />
            </div>

            <div className="organic-card p-5 md:p-10">
              <h3 className="text-2xl md:text-3xl font-display mb-6 md:mb-10 italic">Detalle Diario</h3>
              
              {loadingClosure ? (
                <div className="py-32 flex justify-center">
                  <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-12">
                  {groupedClosureTransactions.map(([day, dayTransactions]) => {
                    const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
                    const dayExpenses = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
                    const dayBalance = dayIncome - dayExpenses;

                    return (
                      <div key={day} className="space-y-6">
                        <div className="flex items-center justify-between px-6 py-4 bg-brand-bg rounded-2xl">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-brand-primary" />
                            <span className="font-display text-xl md:text-2xl italic">
                              {format(parseISO(day), "EEEE, d 'de' MMMM", { locale: es })}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-display text-2xl italic", dayBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                              {dayBalance >= 0 ? '+' : ''}${Math.round(dayBalance).toLocaleString('es-CO')}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {dayTransactions.map((t) => (
                            <div key={t.id} className="p-6 rounded-3xl bg-brand-bg/30 border border-transparent hover:border-brand-primary/10 transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-brand-paper text-brand-secondary shadow-sm"
                                  )}>
                                    {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-brand-ink">{t.subcategory}</p>
                                    <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                                      {t.category === 'business' ? 'Negocio' : 'Hogar'}
                                    </p>
                                  </div>
                                </div>
                                <p className={cn("font-bold text-lg", t.type === 'income' ? "text-emerald-600" : "text-brand-ink")}>
                                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CO')}
                                </p>
                              </div>
                              {t.description && (
                                <div className="mt-4 pt-4 border-t border-black/5">
                                  <p className="text-xs text-brand-secondary italic leading-relaxed">"{t.description}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'suppliers-report' && (
          <SuppliersReport transactions={allTransactions} suppliers={suppliers} />
        )}

        {view === 'categories' && user && (
          <CategoriesManager categories={categories} suppliers={suppliers} user={user} />
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
}
