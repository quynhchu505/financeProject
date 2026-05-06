export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  account_type: string;
  balance: number;
  currency: string;
  icon: string;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  icon: string;
  color: string;
  parent_id: number | null;
  is_system: boolean;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  amount: number;
  transaction_type: TransactionType;
  description: string | null;
  date: string;
  is_ai_categorized: boolean;
  ai_confidence?: number | null;
  created_at: string;
  category?: Category;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  period: BudgetPeriod;
  category: Category;
}

export interface DashboardStats {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  savings_rate: number;
  top_categories: { name: string; color: string; amount: number }[];
  recent_transactions: Transaction[];
  budget_alerts: BudgetProgress[];
  anomaly_alerts: AlertItem[];
}

export interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  net: number;
  categories: CategorySummary[];
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ChatMessageItem {
  id: number;
  user_id: number;
  session_id: number | null;
  message: string;
  response: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessageItem[];
}

export interface CashFlowPrediction {
  month: string;
  predicted_income: number;
  predicted_expense: number;
  confidence: number;
  lower_bound_income?: number;
  upper_bound_income?: number;
  lower_bound_expense?: number;
  upper_bound_expense?: number;
}

export interface AlertItem {
  id: number;
  user_id: number;
  transaction_id: number | null;
  budget_id: number | null;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  anomaly_score: number | null;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
