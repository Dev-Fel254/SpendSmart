import type { Expenditure, Targets } from './types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, formatISO, getWeek, getMonth, getYear } from 'date-fns';

interface PeriodTotals {
  cash: number;
  mobileMoney: number;
  total: number;
}

interface CalculatedExpenditures {
  daily: PeriodTotals;
  weekly: PeriodTotals;
  monthly: PeriodTotals;
  dailyWarning: boolean;
  weeklyWarning: boolean;
  monthlyWarning: boolean;
  todayDate: Date;
  startOfWeekDate: Date;
  endOfWeekDate: Date;
  startOfMonthDate: Date;
  endOfMonthDate: Date;
}

export function calculateExpenditures(expenditures: Expenditure[], targets: Targets): CalculatedExpenditures {
  const today = new Date();
  const todayISO = formatISO(today, { representation: 'date' });
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Assuming week starts on Monday
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const initialTotals: PeriodTotals = { cash: 0, mobileMoney: 0, total: 0 };

  const totals = expenditures.reduce(
    (acc, exp) => {
      try {
        const expDate = parseISO(exp.date); // Parse date string

        // Daily
        if (formatISO(expDate, { representation: 'date' }) === todayISO) {
          if (exp.category === 'Cash') acc.daily.cash += exp.amount;
          else acc.daily.mobileMoney += exp.amount;
          acc.daily.total += exp.amount;
        }

        // Weekly
        if (isWithinInterval(expDate, { start: startOfCurrentWeek, end: endOfCurrentWeek })) {
          if (exp.category === 'Cash') acc.weekly.cash += exp.amount;
          else acc.weekly.mobileMoney += exp.amount;
          acc.weekly.total += exp.amount;
        }

        // Monthly
        if (isWithinInterval(expDate, { start: startOfCurrentMonth, end: endOfCurrentMonth })) {
          if (exp.category === 'Cash') acc.monthly.cash += exp.amount;
          else acc.monthly.mobileMoney += exp.amount;
          acc.monthly.total += exp.amount;
        }
      } catch (error) {
        console.error(`Error processing expenditure date: ${exp.date}`, error);
      }
      return acc;
    },
    {
      daily: { ...initialTotals },
      weekly: { ...initialTotals },
      monthly: { ...initialTotals },
    }
  );

  const dailyWarning = targets.daily !== null && totals.daily.total > targets.daily;
  const weeklyWarning = targets.weekly !== null && totals.weekly.total > targets.weekly;
  const monthlyWarning = targets.monthly !== null && totals.monthly.total > targets.monthly;


  return {
      daily: totals.daily,
      weekly: totals.weekly,
      monthly: totals.monthly,
      dailyWarning,
      weeklyWarning,
      monthlyWarning,
      todayDate: today,
      startOfWeekDate: startOfCurrentWeek,
      endOfWeekDate: endOfCurrentWeek,
      startOfMonthDate: startOfCurrentMonth,
      endOfMonthDate: endOfCurrentMonth,
  };
}


// Helper function to get expenditures for a specific period
export function getExpendituresForPeriod(
  expenditures: Expenditure[],
  period: 'day' | 'week' | 'month',
  date: Date = new Date() // Default to today
): Expenditure[] {
  const targetDate = date; // Use provided date or default to today

  if (period === 'day') {
    const targetDateISO = formatISO(targetDate, { representation: 'date' });
    return expenditures.filter(exp => formatISO(parseISO(exp.date), { representation: 'date' }) === targetDateISO);
  } else if (period === 'week') {
    const start = startOfWeek(targetDate, { weekStartsOn: 1 });
    const end = endOfWeek(targetDate, { weekStartsOn: 1 });
    return expenditures.filter(exp => {
        try {
            const expDate = parseISO(exp.date);
            return isWithinInterval(expDate, { start, end });
        } catch { return false; }
    });
  } else if (period === 'month') {
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);
    return expenditures.filter(exp => {
        try {
            const expDate = parseISO(exp.date);
            return isWithinInterval(expDate, { start, end });
        } catch { return false; }
    });
  }
  return [];
}

// Function to calculate totals for a given set of expenditures
export function calculatePeriodTotals(expenditures: Expenditure[]): PeriodTotals {
    return expenditures.reduce((acc, exp) => {
        if (exp.category === 'Cash') acc.cash += exp.amount;
        else acc.mobileMoney += exp.amount;
        acc.total += exp.amount;
        return acc;
    }, { cash: 0, mobileMoney: 0, total: 0 });
}
