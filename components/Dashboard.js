"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  PieChart,
  Calendar,
  Filter,
  Download,
  X,
  Save,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

const Dashboard = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentView, setCurrentView] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

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

  // Calculate totals and statistics
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const todayExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const currentDate = new Date();
      return expenseDate.toDateString() === currentDate.toDateString();
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const weeklyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const currentDate = new Date();
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expenseDate >= weekAgo && expenseDate <= currentDate;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Monthly data calculations
  const getMonthlyData = () => {
    const monthlyData = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, expenses: [] };
      }

      monthlyData[monthKey].total += expense.amount;
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
        year: parseInt(monthKey.split("-")[0]),
        ...data,
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  };

  // Annual data calculations
  const getAnnualData = () => {
    const annualData = {};

    expenses.forEach((expense) => {
      const year = new Date(expense.date).getFullYear();

      if (!annualData[year]) {
        annualData[year] = { total: 0, count: 0, expenses: [] };
      }

      annualData[year].total += expense.amount;
      annualData[year].count += 1;
      annualData[year].expenses.push(expense);
    });

    return Object.entries(annualData)
      .map(([year, data]) => ({
        year: parseInt(year),
        ...data,
      }))
      .sort((a, b) => b.year - a.year);
  };

  const monthlyData = getMonthlyData();
  const annualData = getAnnualData();
  const maxMonthlyExpense = Math.max(...monthlyData.map((m) => m.total), 0);
  const maxAnnualExpense = Math.max(...annualData.map((a) => a.total), 0);

  // Get selected month data
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
            (sum, expense) => sum + expense.amount,
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
        (sum, expense) => sum + expense.amount,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) {
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      timestamp: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setFormData({
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                ExpenseFlow Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {currentView !== "daily" && (
                <button
                  onClick={handleBackToDaily}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Daily View
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
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
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === "daily"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setCurrentView("annual")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === "annual"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {currentView === "daily" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Expenses</span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${totalExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {expenses.length} transactions
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Today</span>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${todayExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Today's expenses</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">This Week</span>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${weeklyExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Last 7 days</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Categories</span>
                <PieChart className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {categoryTotals.filter((cat) => cat.total > 0).length}
              </div>
              <div className="text-sm text-gray-500">Active categories</div>
            </div>
          </div>
        )}

        {/* Monthly View Stats */}
        {currentView === "monthly" && selectedMonthData && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  ${selectedMonthData.total.toFixed(2)}
                </div>
                <div className="text-gray-600">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {selectedMonthData.count}
                </div>
                <div className="text-gray-600">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">
                  $
                  {(selectedMonthData.total / selectedMonthData.count).toFixed(
                    2
                  )}
                </div>
                <div className="text-gray-600">Avg per Transaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {
                    selectedMonthCategories.filter((cat) => cat.total > 0)
                      .length
                  }
                </div>
                <div className="text-gray-600">Active Categories</div>
              </div>
            </div>
          </div>
        )}

        {/* Annual View Stats */}
        {currentView === "annual" && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Annual Overview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold text-gray-900 min-w-[80px] text-center">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {annualData
                .filter((data) => data.year === selectedYear)
                .map((yearData) => (
                  <div
                    key={yearData.year}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      ${yearData.total.toFixed(2)}
                    </div>
                    <div className="text-gray-600">Total Spent</div>
                  </div>
                ))}
              {annualData
                .filter((data) => data.year === selectedYear)
                .map((yearData) => (
                  <div
                    key={`${yearData.year}-count`}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {yearData.count}
                    </div>
                    <div className="text-gray-600">Total Transactions</div>
                  </div>
                ))}
              {annualData
                .filter((data) => data.year === selectedYear)
                .map((yearData) => (
                  <div
                    key={`${yearData.year}-avg`}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      ${(yearData.total / 12).toFixed(2)}
                    </div>
                    <div className="text-gray-600">Monthly Average</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Monthly Chart */}
        {(currentView === "daily" || currentView === "annual") &&
          monthlyData.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {currentView === "daily"
                  ? "Monthly Expenses Overview"
                  : "Monthly Breakdown"}
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {monthlyData.slice(0, 12).map((month, index) => (
                  <div
                    key={month.monthKey}
                    onClick={() => handleMonthClick(month.monthKey)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {month.shortMonth}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {month.month}
                        </div>
                        <div className="text-sm text-gray-500">
                          {month.count} transactions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${month.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {maxMonthlyExpense > 0
                            ? ((month.total / maxMonthlyExpense) * 100).toFixed(
                                1
                              )
                            : 0}
                          % of highest
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out"
                            style={{
                              width: `${
                                maxMonthlyExpense > 0
                                  ? (month.total / maxMonthlyExpense) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Annual Chart */}
        {currentView === "annual" && annualData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Annual Expenses Comparison
            </h3>
            <div className="space-y-4">
              {annualData.map((year, index) => (
                <div
                  key={year.year}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {year.year.toString().slice(-2)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {year.year}
                      </div>
                      <div className="text-sm text-gray-500">
                        {year.count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${year.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${(year.total / 12).toFixed(2)} per month
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-1000 ease-out"
                          style={{
                            width: `${
                              maxAnnualExpense > 0
                                ? (year.total / maxAnnualExpense) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {currentView === "daily" && "Daily Expenses by Category"}
                {currentView === "monthly" &&
                  selectedMonthData &&
                  `${selectedMonthData.month} by Category`}
                {currentView === "annual" && `${selectedYear} by Category`}
              </h3>
              <div className="space-y-4">
                {categoryTotals
                  .filter((cat) => cat.total > 0)
                  .map((category, index) => (
                    <div
                      key={category.name}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ${category.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {category.percentage.toFixed(1)}% • {category.count}{" "}
                        transactions
                      </div>
                    </div>
                  ))}
                {categoryTotals.filter((cat) => cat.total > 0).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No expenses found</p>
                    <p className="text-sm">
                      {currentView === "daily" &&
                        "Add your first daily expense to see the breakdown"}
                      {currentView === "monthly" && "No expenses in this month"}
                      {currentView === "annual" && "No expenses in this year"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentView === "daily" && "Recent Expenses"}
                  {currentView === "monthly" &&
                    selectedMonthData &&
                    `${selectedMonthData.month} Expenses`}
                  {currentView === "annual" && `${selectedYear} Expenses`}
                </h3>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredExpenses.map((expense, index) => {
                  const category = categories.find(
                    (cat) => cat.name === expense.category
                  );
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 ${
                            category?.color || "bg-gray-500"
                          } rounded-full flex items-center justify-center text-white text-lg`}
                        >
                          {category?.icon || "📦"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {expense.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expense.category} •{" "}
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900">
                          -${expense.amount.toFixed(2)}
                        </span>
                        {currentView === "daily" && (
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
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
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add Daily Expense
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What did you spend on today?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Add Expense
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
