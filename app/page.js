"use client";
import { useState } from "react";
import AuthPage from "../components/AuthPage";
import Dashboard from "../components/Dashboard";
import {
  TrendingUp,
  PieChart,
  Calendar,
  IndianRupee,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
} from "lucide-react";

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (showAuth) {
    return (
      <AuthPage
        onBack={() => setShowAuth(false)}
        onLogin={() => {
          setIsLoggedIn(true);
          setShowAuth(false);
        }}
      />
    );
  }
  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  const features = [
    {
      icon: <IndianRupee className="w-8 h-8" />,
      title: "Daily Expense Tracking",
      description:
        "Effortlessly log your daily expenses with our intuitive interface. Categorize spending and never miss a transaction.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Monthly & Yearly Analytics",
      description:
        "Comprehensive dashboard with detailed insights into your spending patterns and financial trends over time.",
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Smart Categories",
      description:
        "Automatically categorize expenses and visualize spending distribution with beautiful charts and graphs.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Budget Goals",
      description:
        "Set monthly budgets and track progress with real-time alerts when approaching spending limits.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description:
        "Bank-level security ensures your financial data is protected with end-to-end encryption.",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Multi-Platform",
      description:
        "Access your expense data anywhere with seamless sync across web, mobile, and tablet devices.",
    },
  ];

  const benefits = [
    "Real-time expense notifications",
    "Export financial reports",
    "Multi-currency support",
    "Receipt photo capture",
    "Advanced filtering options",
    "Custom spending categories",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 md:backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                ExpenseFlow
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => setShowAuth(true)}
              >
                Get Started
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                className="block text-gray-600 hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#dashboard"
                className="block text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
              <a
                href="#pricing"
                className="block text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Take Control of Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                {" "}
                Expenses
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track daily expenses, analyze spending patterns, and achieve your
              financial goals with our powerful expense tracking platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="text-gray-700 px-8 py-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                ₹2M+
              </div>
              <div className="text-gray-600">Expenses Tracked</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-500 mb-2">98%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Expenses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make expense tracking effortless and
              insightful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-500">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section
        id="dashboard"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Analytics Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get deep insights into your spending with beautiful charts and
              comprehensive reports.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Monthly Overview
                </h3>
                <p className="text-gray-600">August 2025</p>
              </div>
              <div className="flex gap-4 mt-4 lg:mt-0">
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100">Total Spent</span>
                  <IndianRupee className="w-5 h-5 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">₹39,639</div>
                <div className="text-blue-100 text-sm">
                  +12% from last month
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100">Budget Left</span>
                  <TrendingUp className="w-5 h-5 text-green-200" />
                </div>
                <div className="text-2xl font-bold">₹30,361</div>
                <div className="text-green-100 text-sm">43% remaining</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100">Transactions</span>
                  <Calendar className="w-5 h-5 text-purple-200" />
                </div>
                <div className="text-2xl font-bold">342</div>
                <div className="text-purple-100 text-sm">
                  +8% from last month
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-100">Avg Daily</span>
                  <BarChart3 className="w-5 h-5 text-orange-200" />
                </div>
                <div className="text-2xl font-bold">₹1,321</div>
                <div className="text-orange-100 text-sm">
                  -5% from last month
                </div>
              </div>
            </div>

            {/* Charts Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Spending by Category
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700">Food & Dining</span>
                    </div>
                    <span className="font-semibold text-gray-900">₹12430</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700">Transportation</span>
                    </div>
                    <span className="font-semibold text-gray-900">₹4386</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-gray-700">Entertainment</span>
                    </div>
                    <span className="font-semibold text-gray-900">₹14654</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-gray-700">Shopping</span>
                    </div>
                    <span className="font-semibold text-gray-900">₹8,169</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Transactions
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Grocery Store
                        </div>
                        <div className="text-sm text-gray-500">
                          Aug 15, 2025
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">-₹1,067</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Fuel Station
                        </div>
                        <div className="text-sm text-gray-500">
                          Aug 14, 2025
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">-₹1500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Movie Theater
                        </div>
                        <div className="text-sm text-gray-500">
                          Aug 14, 2025
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      -₹628.50
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose ExpenseFlow?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of users who have transformed their financial
                management with our comprehensive expense tracking solution.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <button className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2">
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(4.9/5 rating)</span>
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "ExpenseFlow has completely transformed how I manage my
                  finances. The insights are incredible and have helped me save
                  over ₹5000 a month!"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    SJ
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Sarah Johnson
                    </div>
                    <div className="text-sm text-gray-500">
                      Marketing Manager
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Expenses?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and discover how easy expense tracking
            can be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Start Free Trial
            </button>
            <button className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ExpenseFlow</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The most comprehensive expense tracking platform for individuals
                and businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 ExpenseFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
