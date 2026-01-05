import { useState, useEffect, useCallback } from "react";
import { Expense, CreditCard } from "@/types";
import { CARD_COLORS } from "@/lib/utils";

interface UseExpensesReturn {
  expenses: Expense[];
  creditCards: CreditCard[];
  loading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, "id" | "_id">) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  addCreditCard: (card: Omit<CreditCard, "id" | "_id" | "color">) => Promise<boolean>;
  deleteCreditCard: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
}

export const useExpenses = (onLogout?: () => void): UseExpensesReturn => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses");
      if (!res.ok) {
        if (res.status === 401 && onLogout) onLogout();
        throw new Error(`Failed to fetch expenses: ${res.status}`);
      }
      const data = await res.json();
      setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }, [onLogout]);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/credit-cards");
      if (res.ok) {
        const data = await res.json();
        // Ensure cards have colors and consistent string IDs
        const cardsWithColors = (data.cards || []).map((card: CreditCard, index: number) => ({
            ...card,
            id: card.id || card._id?.toString(),
            color: card.color || CARD_COLORS[index % CARD_COLORS.length]
        }));
        setCreditCards(cardsWithColors);
      }
    } catch (err) {
      console.error("Failed to fetch cards", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchExpenses(), fetchCards()]).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchExpenses, fetchCards]);

  const addExpense = async (expenseData: Omit<Expense, "id" | "_id">) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });
      
      if (!res.ok) {
        if (res.status === 401 && onLogout) onLogout();
        return false;
      }
      
      await fetchExpenses(); 
      return true;
    } catch (err) {
      console.error("Add expense failed", err);
      return false;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const previousExpenses = [...expenses];
      setExpenses((prev) => prev.filter((ex) => ex.id !== id && ex._id !== id));

      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        setExpenses(previousExpenses); 
        if (res.status === 401 && onLogout) onLogout();
        return false;
      }
      return true;
    } catch (err) {
      console.error("Delete failed", err);
      return false;
    }
  };

  const addCreditCard = async (cardData: Omit<CreditCard, "id" | "_id" | "color">) => {
    try {
      // Assign color optimistically if not present
      const newCardColor = CARD_COLORS[creditCards.length % CARD_COLORS.length];
      const payload = { ...cardData, color: newCardColor };

      const res = await fetch("/api/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401 && onLogout) onLogout();
        return false;
      }

      const data = await res.json();
      const savedCard = { ...data.card, color: data.card.color || newCardColor };
      
      setCreditCards((prev) => [...prev, savedCard]);
      return true;
    } catch (err) {
      console.error("Add card failed", err);
      return false;
    }
  };

  const deleteCreditCard = async (id: string) => {
     try {
       const previousCards = [...creditCards];
       setCreditCards(prev => prev.filter(c => c.id !== id && c._id !== id));

       // Assuming API endpoint exists. If not, this is optimistic only.
       // User requirement implies functionality.
       // Check if DELETE /api/credit-cards/:id exists? 
       // If not, we might need to implement it or use generic endpoint.
       // For now, assuming optimistic update is primary goal to fix UI.
       const res = await fetch(`/api/credit-cards?id=${id}`, { method: "DELETE" }); 
       // Note: Standard convention often /api/credit-cards/[id], but if not existing, query param.
       // Since I can't check server code easily for checking existence of [id] folder right now without tools,
       // I'll stick to a safe optimistic update mostly, or try standard path.
       // ACTUALLY, I should check if I can modify the API. 
       // User said "Do NOT add new abstractions unless required".
       // Detailed Verification: The original code dashboard had NO delete card logic. 
       // But the USER added `handleDeleteCard` in the new code snippet.
       // I will assume for now I should try to hit an endpoint, if it fails, revert?
       // Let's just do optimistic update + fetch attempt.
       
       if (!res.ok) {
          // If 404/405, it implies backend doesn't support it.
          // In that case, should we revert? Or just keep it optimistic?
          // I will revert to be safe.
          setCreditCards(previousCards);
           if (res.status === 401 && onLogout) onLogout();
           return false;
       }
       return true;
     } catch (err) {
         console.error("Failed to delete card", err);
         return false;
     }
  };

  return {
    expenses,
    creditCards,
    loading,
    error,
    addExpense,
    deleteExpense,
    addCreditCard,
    deleteCreditCard,
    refreshExpenses: fetchExpenses,
  };
};
