"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  IndianRupee,
  TrendingUp,
  PieChart,
  Calendar,
  Menu,
  X,
  ArrowLeft,
  CreditCard as CreditCardIcon,
  LogOut,
  Trash2
} from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseStats } from "@/hooks/useExpenseStats";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { ExpenseList } from "@/components/dashboard/ExpenseList";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { CATEGORIES as CATEGORY_OPTIONS, getCardIcon } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // --- Global State ---
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"daily" | "monthly" | "annual">("daily");

  // --- Filter State ---
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCreditCard, setSelectedCreditCard] = useState<string>("all");

  // --- Modal State ---
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);

  // --- Form State ---
  const [expenseFormData, setExpenseFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
    creditCardId: "",
  });

  const [cardFormData, setCardFormData] = useState({
    name: "",
    lastFourDigits: "",
    type: "visa",
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; cardId?: string }>({
    isOpen: false,
  });

  // --- Hooks ---
  const toast = useToast();
  const {
    expenses,
    creditCards,
    addExpense,
    deleteExpense,
    addCreditCard,
    deleteCreditCard
  } = useExpenses(onLogout);

  const {
    totalExpenses,
    todayExpenses,
    weeklyExpenses,
    categoryTotals,
    filteredExpenses,
    monthlyData,
    maxMonthlyExpense
  } = useExpenseStats(expenses, currentView, selectedCategory, selectedMonth, selectedCreditCard);

  // --- Derived State: Card Stats ---
  // Single source of truth: Aggregated from 'expenses'
  const cardStats = React.useMemo(() => {
    const stats: Record<string, { total: number; thisMonth: number; count: number }> = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    expenses.forEach(expense => {
      if (!expense.creditCardId) return;

      if (!stats[expense.creditCardId]) {
        stats[expense.creditCardId] = { total: 0, thisMonth: 0, count: 0 };
      }

      const amount = Number(expense.amount) || 0;
      stats[expense.creditCardId].total += amount;
      stats[expense.creditCardId].count += 1;

      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        stats[expense.creditCardId].thisMonth += amount;
      }
    });
    return stats;
  }, [expenses]);

  // --- Effects (Hydration Fix) ---
  useEffect(() => {
    // Set default date responsibly on client-side only
    setExpenseFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split("T")[0]
    }));
  }, []);

  // --- Handlers ---
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFormData.amount || !expenseFormData.category || !expenseFormData.description) return;

    const success = await addExpense({
      amount: Number(expenseFormData.amount),
      category: expenseFormData.category,
      description: expenseFormData.description,
      date: expenseFormData.date,
      timestamp: Date.now(),
      creditCardId: expenseFormData.creditCardId || undefined,
    });

    if (success) {
      setExpenseFormData(prev => ({
        amount: "",
        category: "",
        description: "",
        creditCardId: "",
        date: new Date().toISOString().split("T")[0] // reset to today
      }));
      setShowExpenseModal(false);
      setIsMenuOpen(false);
      toast.success("Expense added successfully");
    } else {
      toast.error("Failed to add expense");
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormData.name || !cardFormData.lastFourDigits) return;

    const success = await addCreditCard(cardFormData);
    if (success) {
      setCardFormData({ name: "", lastFourDigits: "", type: "visa" });
      setCardFormData({ name: "", lastFourDigits: "", type: "visa" });
      setShowCardModal(false);
      toast.success("Card added successfully");
    } else {
      toast.error("Failed to add card");
    }
  };

  const confirmDeleteCard = (id: string) => {
    setDeleteConfirmation({ isOpen: true, cardId: id });
  };

  const handleDeleteCard = async () => {
    if (!deleteConfirmation.cardId) return;

    await deleteCreditCard(deleteConfirmation.cardId);

    if (selectedCreditCard === deleteConfirmation.cardId) {
      setSelectedCreditCard("all");
    }

    toast.success("Card deleted successfully");
    setDeleteConfirmation({ isOpen: false });
  };

  const handleMonthClick = useCallback((monthKey: string) => {
    setSelectedMonth(monthKey);
    setCurrentView("monthly");
    setSelectedCategory("all");
  }, []);

  const handleBackToDaily = useCallback(() => {
    setCurrentView("daily");
    setSelectedMonth(undefined);
    setSelectedCategory("all");
  }, []);

  // --- Derived View Titles ---
  const viewTitle = (() => {
    if (currentView === "daily") return "Daily Expenses";
    if (currentView === "monthly" && selectedMonth) {
      const m = monthlyData.find(d => d.monthKey === selectedMonth);
      return m ? `${m.month} Expenses` : "Monthly Expenses";
    }
    return "Annual Expenses";
  })();

  const chartTitle = (() => {
    if (currentView === "daily") return "Daily Expenses by Category";
    if (currentView === "monthly" && selectedMonth) {
      const m = monthlyData.find(d => d.monthKey === selectedMonth);
      return m ? `${m.month} by Category` : "Category Breakdown";
    }
    return "Category Breakdown";
  })();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                ExpenseFlow
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                onClick={() => setShowCardModal(true)}
                className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
              <button
                onClick={onLogout}
                className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentView !== "daily" && (
              <button
                onClick={handleBackToDaily}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-full transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{viewTitle}</h2>
          </div>

          <div className="flex bg-gray-200 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setCurrentView("daily")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Daily
            </button>
            <button
              onClick={() => setCurrentView("annual")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === "annual" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Credit Card Filter Buttons */}
        {creditCards.length > 0 && (
          <div className="overflow-x-auto pb-2 -mx-2 px-2 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCreditCard("all")}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors border ${selectedCreditCard === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
              >
                All Expenses
              </button>
              {creditCards.map((card) => {
                const cardId = card.id || "";
                const isSelected = selectedCreditCard === cardId;
                return (
                  <button
                    key={cardId}
                    onClick={() => setSelectedCreditCard(cardId)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors border flex items-center gap-2 ${isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span>{getCardIcon(card.type)}</span>
                    <span>{card.name}</span>
                    <span className="opacity-75 text-xs">••{card.lastFourDigits}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Stats Row (Only Daily) */}
        {currentView === "daily" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Expenses"
              value={`₹${totalExpenses.toFixed(2)}`}
              subtext={`${expenses.length} transactions`}
              icon={<IndianRupee className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              title="Today"
              value={`₹${todayExpenses.toFixed(2)}`}
              subtext="Today's spending"
              icon={<Calendar className="w-5 h-5 text-green-500" />}
            />
            <StatCard
              title="This Week"
              value={`₹${weeklyExpenses.toFixed(2)}`}
              subtext="Last 7 days"
              icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            />
            <StatCard
              title="Active Categories"
              value={categoryTotals.filter(c => c.total > 0).length.toString()}
              subtext="In use"
              icon={<PieChart className="w-5 h-5 text-orange-500" />}
            />
          </div>
        )}

        {/* Monthly Breakdown List (Shown in Daily/Annual) */}
        {(currentView === "daily" || currentView === "annual") && monthlyData.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Monthly Overview</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {monthlyData.map((month) => (
                <button
                  key={month.monthKey}
                  onClick={() => handleMonthClick(month.monthKey)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {month.shortMonth}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{month.month}</div>
                      <div className="text-sm text-gray-500">{month.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₹{month.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                      View Details →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Credit Cards Section */}
        {creditCards.length > 0 && currentView === 'daily' && (
          <div className="lg:col-span-3 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Credit Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {creditCards.map((card, index) => {
                  const cardId = card.id || "";
                  const stats = cardStats[cardId] || { total: 0, thisMonth: 0, count: 0 };
                  const isSelected = selectedCreditCard === cardId;

                  return (
                    <div
                      key={cardId}
                      className={`${card.color} rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedCreditCard(cardId)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCardIcon(card.type)}</span>
                          <span className="font-medium text-sm truncate">{card.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteCard(cardId);
                          }}
                          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs opacity-75 mb-2">••••{card.lastFourDigits}</div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs opacity-75">Total Spent</span>
                          <span className="text-sm font-semibold">₹{stats.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs opacity-75">This Month</span>
                          <span className="text-sm font-semibold">₹{stats.thisMonth.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs opacity-75">Transactions</span>
                          <span className="text-sm font-semibold">{stats.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Chart + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CategoryBreakdown
              categories={categoryTotals}
              title={chartTitle}
            />
          </div>

          <div className="lg:col-span-2">
            <ExpenseList
              expenses={filteredExpenses}
              onDelete={deleteExpense}
              title={currentView === "daily" ? "Recent Transactions" : "Expense History"}
              view={currentView}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>
      </main>

      {/* --- Modals --- */}


      {/* Add Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add New Expense"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="0.00"
              value={expenseFormData.amount}
              onChange={e => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              required
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
              value={expenseFormData.category}
              onChange={e => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {Object.values(CATEGORY_OPTIONS).flat().map((cat) => (
                // Note: Assuming 'categories' import is simple string array or object. 
                // Falling back to hardcoded check from utils if needed, or keeping it strict.
                // The original code passed strings.
                null
              ))}
              {/* Reusing CATEGORIES from utils for consistency if imported */}
              {["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Education", "Travel", "Other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {creditCards.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay With (Optional)</label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
                value={expenseFormData.creditCardId}
                onChange={e => setExpenseFormData({ ...expenseFormData, creditCardId: e.target.value })}
              >
                <option value="">Cash / Default</option>
                {creditCards.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} (••{c.lastFourDigits})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              required
              type="text"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="e.g. Lunch at McD"
              value={expenseFormData.description}
              onChange={e => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              required
              type="date"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              value={expenseFormData.date}
              onChange={e => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm active:scale-[0.98]"
          >
            Add Expense
          </button>
        </form>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        title="Add Credit Card"
      >
        <form onSubmit={handleCardSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Name</label>
            <input
              required
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="My HDFC Card"
              value={cardFormData.name}
              onChange={e => setCardFormData({ ...cardFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
            <input
              required
              maxLength={4}
              pattern="\d{4}"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="1234"
              value={cardFormData.lastFourDigits}
              onChange={e => setCardFormData({ ...cardFormData, lastFourDigits: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
            <select
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border bg-white"
              value={cardFormData.type}
              onChange={e => setCardFormData({ ...cardFormData, type: e.target.value })}
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">Amex</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm active:scale-[0.98]"
          >
            Save Card
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={handleDeleteCard}
        title="Delete Credit Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        variant="danger"
        confirmText="Delete Card"
      />

      {/* Mobile Menu Overlay */}
      {
        isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMenuOpen(false)}>
            <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-6 transform transition-transform" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => { setShowExpenseModal(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium"
                >
                  <Plus className="w-5 h-5" /> Add Expense
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium border border-gray-100"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;
