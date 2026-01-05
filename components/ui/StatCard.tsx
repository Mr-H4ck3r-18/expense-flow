import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon }) => {
    return (
        <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{title}</span>
                {icon}
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{subtext}</div>
        </div>
    );
};
