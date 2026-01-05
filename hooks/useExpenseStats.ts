import { useMemo } from "react";
import { Expense } from "@/types";
import { calculateMonthlyData, calculateCategoryTotals, MonthlyStats, CategoryTotal } from "@/lib/utils";

interface UseExpenseStatsReturn {
  totalExpenses: number;
  todayExpenses: number;
  weeklyExpenses: number;
  monthlyData: MonthlyStats[];
  categoryTotals: CategoryTotal[];
  maxMonthlyExpense: number;
  filteredExpenses: Expense[];
}

export const useExpenseStats = (
  expenses: Expense[],
  currentView: "daily" | "monthly" | "annual",
  selectedCategory: string,
  selectedMonth?: string,
  selectedCreditCard?: string
): UseExpenseStatsReturn => {
  
  const now = useMemo(() => new Date(), []);

  // Base aggregation always on ALL expenses or view-limited?
  // Usually 'totalExpenses' is strictly "based on view".
  
  // 1. First, apply Credit Card filter globally if selected? 
  // Or should stats reflect "All" but list reflect "Card"?
  // Usually, if I select a card, I want to see stats for that card.
  
  const statsBaseExpenses = useMemo(() => {
     let filtered = expenses;
     if (selectedCreditCard && selectedCreditCard !== "all") {
         filtered = filtered.filter(e => e.creditCardId === selectedCreditCard);
     }
     return filtered;
  }, [expenses, selectedCreditCard]);

  const totalExpenses = useMemo(() => {
    return statsBaseExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [statsBaseExpenses]);

  const todayExpenses = useMemo(() => {
    const todayStr = now.toDateString();
    return statsBaseExpenses
      .filter((e) => new Date(e.date).toDateString() === todayStr)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [statsBaseExpenses, now]);

  const weeklyExpenses = useMemo(() => {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return statsBaseExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= weekAgo && d <= now;
      })
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [statsBaseExpenses, now]);

  const monthlyData = useMemo(() => calculateMonthlyData(statsBaseExpenses), [statsBaseExpenses]);

  const maxMonthlyExpense = useMemo(() => {
    return Math.max(...monthlyData.map((m) => m.total), 0);
  }, [monthlyData]);

  // Derived based on view
  const baseExpenses = useMemo(() => {
    if (currentView === "daily") return statsBaseExpenses;
    if (selectedMonth) {
      const monthData = monthlyData.find(m => m.monthKey === selectedMonth);
      return monthData ? monthData.expenses : [];
    }
    return statsBaseExpenses; 
  }, [statsBaseExpenses, currentView, selectedMonth, monthlyData]);

  const filteredExpenses = useMemo(() => {
    return selectedCategory === "all"
      ? baseExpenses
      : baseExpenses.filter((e) => e.category === selectedCategory);
  }, [baseExpenses, selectedCategory]);

  const categoryTotals = useMemo(() => {
    const totalForCalc = currentView === "daily" 
      ? totalExpenses 
      : (selectedMonth ? (monthlyData.find(m => m.monthKey === selectedMonth)?.total || 0) : 0);
      
    return calculateCategoryTotals(baseExpenses, totalForCalc);
  }, [baseExpenses, totalExpenses, currentView, selectedMonth, monthlyData]);

  return {
    totalExpenses,
    todayExpenses,
    weeklyExpenses,
    monthlyData,
    maxMonthlyExpense,
    filteredExpenses,
    categoryTotals,
  };
};
