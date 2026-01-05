import React, { memo } from "react";
import { AlertCircle } from "lucide-react";
import { CategoryTotal } from "@/lib/utils";

interface CategoryBreakdownProps {
    categories: CategoryTotal[];
    title: string;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = memo(({ categories, title }) => {
    const activeCategories = categories.filter((c) => c.total > 0);

    return (
        <div className="bg-white rounded-xl p-4 shadow h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

            <div className="space-y-4">
                {activeCategories.map((category) => (
                    <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg" role="img" aria-label={category.name}>
                                    {category.icon}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    {category.name}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                ₹{category.total.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full ${category.color} transition-all duration-500 ease-out`}
                                style={{ width: `${category.percentage}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>{category.percentage.toFixed(1)}%</span>
                            <span>{category.count} transactions</span>
                        </div>
                    </div>
                ))}

                {activeCategories.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No category data available</p>
                    </div>
                )}
            </div>
        </div>
    );
});

CategoryBreakdown.displayName = "CategoryBreakdown";
