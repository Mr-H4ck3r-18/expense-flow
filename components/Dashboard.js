"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  IndianRupee,
  TrendingUp,
  PieChart,
  Calendar,
  Filter,
  X,
  Save,
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const Dashboard = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentView, setCurrentView] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // only access localStorage in browser
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("expenseflow_token")
      : null;

  const categories = [
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

  useEffect(() => {
    // if no token -> logout
    if (!token) {
      if (typeof onLogout === "function") onLogout();
      return;
    }

    let cancelled = false;
    const fetchExpenses = async () => {
      try {
        const res = await fetch("/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401 && typeof onLogout === "function") onLogout();
          else console.error("Failed to fetch expenses", res.status);
          return;
        }
        const data = await res.json();
        if (!cancelled)
          setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      }
    };
    fetchExpenses();
    return () => {
      cancelled = true;
    };
  }, [token, onLogout]);

  // totals
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0
  );
  const todayExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const currentDate = new Date();
      return expenseDate.toDateString() === currentDate.toDateString();
    })
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const weeklyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const currentDate = new Date();
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expenseDate >= weekAgo && expenseDate <= currentDate;
    })
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  // monthly & annual helpers
  const getMonthlyData = () => {
    const monthlyData = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (isNaN(date)) return;
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthlyData[monthKey])
        monthlyData[monthKey] = { total: 0, count: 0, expenses: [] };
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

  const getAnnualData = () => {
    const annualData = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (isNaN(date)) return;
      const year = date.getFullYear();
      if (!annualData[year])
        annualData[year] = { total: 0, count: 0, expenses: [] };
      annualData[year].total += Number(expense.amount) || 0;
      annualData[year].count += 1;
      annualData[year].expenses.push(expense);
    });
    return Object.entries(annualData)
      .map(([year, data]) => ({ year: parseInt(year, 10), ...data }))
      .sort((a, b) => b.year - a.year);
  };

  const monthlyData = getMonthlyData();
  const annualData = getAnnualData();
  const maxMonthlyExpense = Math.max(...monthlyData.map((m) => m.total), 0);
  const maxAnnualExpense = Math.max(...annualData.map((a) => a.total), 0);

  const selectedMonthData = selectedMonth
    ? monthlyData.find((m) => m.monthKey === selectedMonth)
    : null;
  const selectedMonthExpenses = selectedMonthData
    ? selectedMonthData.expenses
    : [];
  const selectedMonthCategories = selectedMonthData
    ? categories
        .map((category) => {
          const categoryExpenses = selectedMonthData.expenses.filter(
            (expense) => expense.category === category.name
          );
          const total = categoryExpenses.reduce(
            (sum, expense) => sum + (Number(expense.amount) || 0),
            0
          );
          return {
            ...category,
            total,
            count: categoryExpenses.length,
            percentage:
              selectedMonthData.total > 0
                ? (total / selectedMonthData.total) * 100
                : 0,
          };
        })
        .sort((a, b) => b.total - a.total)
    : [];

  const categoryTotals = categories
    .map((category) => {
      const categoryExpenses =
        currentView === "daily"
          ? expenses.filter((expense) => expense.category === category.name)
          : selectedMonthExpenses.filter(
              (expense) => expense.category === category.name
            );
      const total = categoryExpenses.reduce(
        (sum, expense) => sum + (Number(expense.amount) || 0),
        0
      );
      const totalForPercentage =
        currentView === "daily" ? totalExpenses : selectedMonthData?.total || 0;
      return {
        ...category,
        total,
        count: categoryExpenses.length,
        percentage:
          totalForPercentage > 0 ? (total / totalForPercentage) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const baseExpenses =
    currentView === "daily" ? expenses : selectedMonthExpenses;
  const filteredExpenses =
    selectedCategory === "all"
      ? baseExpenses
      : baseExpenses.filter((expense) => expense.category === selectedCategory);

  // add expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) return;
    if (!token) {
      if (typeof onLogout === "function") onLogout();
      return;
    }

    const newExpense = {
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      timestamp: Date.now(),
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });
      if (!res.ok) {
        console.error("Failed to add expense", res.status);
        return;
      }
      // refresh list
      const expensesData = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (expensesData.ok) {
        const { expenses: updatedExpenses } = await expensesData.json();
        setExpenses(Array.isArray(updatedExpenses) ? updatedExpenses : []);
      }
      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowModal(false);
      setIsMenuOpen(false); // close mobile menu if open
    } catch (err) {
      console.error("Add expense failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !token) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("Failed to delete expense", res.status);
      } else {
        // optimistic update
        setExpenses((prev) => prev.filter((ex) => (ex.id || ex._id) !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleMonthClick = (monthKey) => {
    setSelectedMonth(monthKey);
    setCurrentView("monthly");
    setSelectedCategory("all");
  };

  const handleBackToDaily = () => {
    setCurrentView("daily");
    setSelectedMonth(null);
    setSelectedCategory("all");
  };

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                ExpenseFlow Dashboard
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Expense</span>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>

            {/* mobile menu button */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className="p-2 rounded-md border border-gray-200 bg-white"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* mobile menu popover */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="flex flex-col p-3">
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r text-white  from-blue-500 to-purple-600  hover:shadow transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Expense
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (typeof onLogout === "function") onLogout();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentView !== "daily" && (
              <button
                onClick={handleBackToDaily}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Daily</span>
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {currentView === "daily" && "Daily Expenses"}
              {currentView === "monthly" &&
                selectedMonthData &&
                `${selectedMonthData.month} Expenses`}
              {currentView === "annual" && `${selectedYear} Annual Expenses`}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView("daily")}
              className={`px-3 py-1 rounded-lg text-sm ${
                currentView === "daily"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setCurrentView("annual")}
              className={`px-3 py-1 rounded-lg text-sm ${
                currentView === "annual"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Stats */}
        {currentView === "daily" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <IndianRupee className="w-5 h-5 text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                ₹{totalExpenses.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {expenses.length} transactions
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today</span>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                ₹{todayExpenses.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Today's expenses</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                ₹{weeklyExpenses.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Categories</span>
                <PieChart className="w-5 h-5 text-orange-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {categoryTotals.filter((c) => c.total > 0).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Active categories
              </div>
            </div>
          </div>
        )}

        {/* Monthly list */}
        {(currentView === "daily" || currentView === "annual") &&
          monthlyData.length > 0 && (
            <section className="bg-white rounded-xl p-4 shadow mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentView === "daily"
                  ? "Monthly Expenses Overview"
                  : "Monthly Breakdown"}
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {monthlyData.slice(0, 12).map((month, index) => (
                  <button
                    key={month.monthKey}
                    onClick={() => handleMonthClick(month.monthKey)}
                    className="w-full text-left flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-blue-500 to-purple-600">
                        {month.shortMonth}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {month.month}
                        </div>
                        <div className="text-xs text-gray-500">
                          {month.count} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right w-36 sm:w-48">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{month.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {maxMonthlyExpense > 0
                          ? ((month.total / maxMonthlyExpense) * 100).toFixed(1)
                          : 0}
                        % of highest
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{
                            width: `${
                              maxMonthlyExpense > 0
                                ? (month.total / maxMonthlyExpense) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

        {/* Grid: categories + list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* categories */}
          <div className="lg:col-span-1 bg-white rounded-xl p-4 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentView === "daily"
                ? "Daily Expenses by Category"
                : currentView === "monthly" && selectedMonthData
                ? `${selectedMonthData.month} by Category`
                : `${selectedYear} by Category`}
            </h3>
            <div className="space-y-3">
              {categoryTotals
                .filter((cat) => cat.total > 0)
                .map((category) => (
                  <div
                    key={category.name}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{category.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}% • {category.count}{" "}
                      transactions
                    </div>
                  </div>
                ))}
              {categoryTotals.filter((cat) => cat.total > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No expenses found</p>
                  <p className="text-sm">
                    {currentView === "daily"
                      ? "Add your first daily expense to see the breakdown"
                      : "No expenses in this period"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* expenses list */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentView === "daily"
                  ? "Recent Expenses"
                  : currentView === "monthly" && selectedMonthData
                  ? `${selectedMonthData.month} Expenses`
                  : `${selectedYear} Expenses`}
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-3 max-h-[40vh] sm:max-h-[60vh] overflow-y-auto">
              {filteredExpenses.map((expense) => {
                const category = categories.find(
                  (cat) => cat.name === expense.category
                );
                const expenseId = expense.id || expense._id;
                return (
                  <div
                    key={expenseId}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          category?.color || "bg-gray-500"
                        } w-10 h-10 rounded-full flex items-center justify-center text-white text-lg`}
                      >
                        {category?.icon || "📦"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {expense.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {expense.category} •{" "}
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        -₹{(Number(expense.amount) || 0).toFixed(2)}
                      </span>
                      {currentView === "daily" && (
                        <button
                          onClick={() => handleDelete(expenseId)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                          aria-label={`Delete expense ${expense.description}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredExpenses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No expenses found</p>
                  <p className="text-sm">
                    {selectedCategory === "all"
                      ? currentView === "daily"
                        ? "Add your first expense to get started"
                        : "No expenses in this period"
                      : `No expenses in ${selectedCategory} category`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Expense Modal (responsive) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md md:max-w-lg overflow-auto h-[90vh] md:h-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Daily Expense</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
