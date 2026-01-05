import { Expense, CreditCard } from "@/types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

export const isWithinRange = (date: string | Date, startDate: Date, endDate: Date): boolean => {
  const d = new Date(date);
  return d >= startDate && d <= endDate;
};

// Types for aggregation
export interface CategoryTotal {
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  monthKey: string;
  month: string;
  shortMonth: string;
  year: number;
  total: number;
  count: number;
  expenses: Expense[];
}

export const CATEGORIES = [
  { name: "Food & Dining", color: "bg-blue-500", icon: "🍽️" },
  { name: "Transportation", color: "bg-green-500", icon: "🚗" },
  { name: "Shopping", color: "bg-purple-500", icon: "🛍️" },
  { name: "Entertainment", color: "bg-pink-500", icon: "🎬" },
  { name: "Bills & Utilities", color: "bg-orange-500", icon: "💡" },
  { name: "Healthcare", color: "bg-red-500", icon: "🏥" },
  { name: "Education", color: "bg-indigo-500", icon: "📚" },
  { name: "Travel", color: "bg-teal-500", icon: "✈️" },
  { name: "Other", color: "bg-gray-500", icon: "📦" },
];

export const CARD_COLORS = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600'
];

export const getCardIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💎';
      case 'discover': return '🔍';
      default: return '💳';
    }
};

export const calculateMonthlyData = (expenses: Expense[]): MonthlyStats[] => {
  const monthlyData: Record<string, { total: number; count: number; expenses: Expense[] }> = {};
  
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    if (isNaN(date.getTime())) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, count: 0, expenses: [] };
    }
    
    monthlyData[monthKey].total += Number(expense.amount) || 0;
    monthlyData[monthKey].count += 1;
    monthlyData[monthKey].expenses.push(expense);
  });

  return Object.entries(monthlyData)
    .map(([monthKey, data]) => ({
      monthKey,
      month: new Date(monthKey + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      shortMonth: new Date(monthKey + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      year: parseInt(monthKey.split("-")[0], 10),
      ...data,
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};

export const calculateCategoryTotals = (
  expenses: Expense[], 
  totalForPercentage: number
): CategoryTotal[] => {
  return CATEGORIES.map((category) => {
    const categoryExpenses = expenses.filter((expense) => expense.category === category.name);
    const total = categoryExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    
    return {
      ...category,
      total,
      count: categoryExpenses.length,
      percentage: totalForPercentage > 0 ? (total / totalForPercentage) * 100 : 0,
    };
  }).sort((a, b) => b.total - a.total);
};
