export type ExpenditureCategory = 'Cash' | 'Mobile Money';

export interface Expenditure {
  id: string;
  amount: number;
  category: ExpenditureCategory;
  description?: string;
  date: string; // Store date as ISO string (e.g., '2024-07-28')
}

export interface Targets {
  daily: number | null;
  weekly: number | null;
  monthly: number | null;
}
