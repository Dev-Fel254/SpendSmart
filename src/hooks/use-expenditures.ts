import { useCallback } from 'react';
import type { Expenditure } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const EXPENDITURES_KEY = 'spendSmartExpenditures';

function useExpenditures() {
  const [expenditures, setExpenditures] = useLocalStorage<Expenditure[]>(EXPENDITURES_KEY, []);

  const addExpenditure = useCallback(
    (newExpenditure: Omit<Expenditure, 'id' | 'date'> & { date?: string }) => {
      const expenditureWithDefaults: Expenditure = {
        id: crypto.randomUUID(),
        date: newExpenditure.date || new Date().toISOString().split('T')[0], // Default to today if no date provided
        ...newExpenditure,
      };
      setExpenditures((prev) => [...prev, expenditureWithDefaults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by date descending
    },
    [setExpenditures]
  );

  const deleteExpenditure = useCallback(
    (id: string) => {
      setExpenditures((prev) => prev.filter((exp) => exp.id !== id));
    },
    [setExpenditures]
  );

  const updateExpenditure = useCallback(
    (updatedExpenditure: Expenditure) => {
       setExpenditures((prev) =>
         prev.map((exp) => (exp.id === updatedExpenditure.id ? updatedExpenditure : exp))
           .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Re-sort after update
       );
    },
    [setExpenditures]
  );

  return { expenditures, addExpenditure, deleteExpenditure, updateExpenditure };
}

export default useExpenditures;
