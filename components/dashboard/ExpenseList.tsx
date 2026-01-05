import React, { memo, useState } from "react";
import { Trash2, Filter, AlertCircle } from "lucide-react";
import { Expense } from "@/types";
import { CATEGORIES } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface ExpenseListProps {
    expenses: Expense[];
    onDelete: (id: string) => Promise<boolean>;
    title: string;
    view: "daily" | "monthly" | "annual";
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = memo(({
    expenses,
    onDelete,
    title,
    view,
    selectedCategory,
    onCategoryChange
}) => {
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; expenseId?: string }>({
        isOpen: false,
    });
    const toast = useToast();

    const confirmDelete = (id: string) => {
        setDeleteConfirmation({ isOpen: true, expenseId: id });
    };

    const handleDelete = async () => {
        if (deleteConfirmation.expenseId) {
            const success = await onDelete(deleteConfirmation.expenseId);
            if (success) {
                toast.success("Expense deleted successfully");
            } else {
                toast.error("Failed to delete expense");
            }
            setDeleteConfirmation({ isOpen: false });
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map((category) => (
                            <option key={category.name} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <Filter className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="space-y-3 max-h-[40vh] sm:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {expenses.map((expense) => {
                    const category = CATEGORIES.find((cat) => cat.name === expense.category);
                    const expenseId = expense.id || expense._id || "";

                    return (
                        <div
                            key={expenseId}
                            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`${category?.color || "bg-gray-500"} w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm`}
                                >
                                    {category?.icon || "📦"}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 line-clamp-1">{expense.description}</div>
                                    <div className="text-xs text-gray-500">
                                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                    -₹{(Number(expense.amount) || 0).toFixed(2)}
                                </span>
                                {view === "daily" && (
                                    <button
                                        onClick={() => confirmDelete(expenseId)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        aria-label={`Delete ${expense.description}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {expenses.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">No expenses found</p>
                        <p className="text-sm opacity-75">
                            {selectedCategory === "all"
                                ? "No transactions for this period"
                                : `No expenses in ${selectedCategory}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

ExpenseList.displayName = "ExpenseList";
