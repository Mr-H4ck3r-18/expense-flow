"use client";

import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login"); // or root
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return <Dashboard onLogout={handleLogout} />;
}
