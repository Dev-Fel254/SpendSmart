'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react'; // Removed unused icons
import type { Targets, Expenditure } from '@/lib/types';
import { calculateExpenditures } from '@/lib/expenditure-calculations';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

interface ExpenditureSummaryProps {
  expenditures: Expenditure[];
  targets: Targets;
}

const SummaryCard = ({
  title,
  dateRange,
  total,
  cash,
  mobileMoney,
  target,
  warning,
}: {
  title: string;
  dateRange: string;
  total: number;
  cash: number;
  mobileMoney: number;
  target: number | null;
  warning: boolean;
}) => {
  const progress = target !== null && target > 0 ? Math.min((total / target) * 100, 100) : 0;
  const targetExceeded = target !== null && total > target;

  return (
    <Card className={cn("transition-all duration-300", warning ? 'border-accent ring-2 ring-accent shadow-lg' : 'shadow-sm')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
           {/* Keep icon inside card for individual warnings */}
           {warning && <AlertTriangle className="h-5 w-5 text-accent animate-pulse" />}
        </div>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {total.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
          {target !== null && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              / {target.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })} Target
            </span>
          )}
        </div>
        {target !== null && target > 0 && ( // Only show progress if target is set and > 0
          <Progress value={progress} className={cn("h-2 mb-3", targetExceeded ? '[&>div]:bg-accent' : '')} />
        )}
         {target !== null && target <= 0 && ( // Indicate if target is 0 or negative
             <p className="text-xs text-muted-foreground mb-3">Target is zero or less.</p>
         )}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Cash: {cash.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}</span>
          <span>Mobile: {mobileMoney.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export function ExpenditureSummary({ expenditures, targets }: ExpenditureSummaryProps) {
  const calculated = calculateExpenditures(expenditures, targets);

  const warnings = [];
  if (calculated.dailyWarning) warnings.push('daily');
  if (calculated.weeklyWarning) warnings.push('weekly');
  if (calculated.monthlyWarning) warnings.push('monthly');

  const warningMessage = warnings.length > 0
    ? `You've exceeded your ${warnings.join(' and ')} spending target${warnings.length > 1 ? 's' : ''}!`
    : '';

  return (
    <div className="space-y-4">
      {/* Display overall warning message if any target is exceeded */}
      {warnings.length > 0 && (
          <Alert variant="destructive" className="border-accent text-accent [&>svg]:text-accent bg-accent/10">
             <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Spending Alert!</AlertTitle>
            <AlertDescription>
              {warningMessage} Be mindful of your budget.
            </AlertDescription>
          </Alert>
      )}

      {/* Summary Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Today's Spending"
          dateRange={format(calculated.todayDate, 'PPP')}
          total={calculated.daily.total}
          cash={calculated.daily.cash}
          mobileMoney={calculated.daily.mobileMoney}
          target={targets.daily}
          warning={calculated.dailyWarning}
        />
        <SummaryCard
          title="This Week's Spending"
          dateRange={`${format(calculated.startOfWeekDate, 'MMM d')} - ${format(calculated.endOfWeekDate, 'MMM d, yyyy')}`}
          total={calculated.weekly.total}
          cash={calculated.weekly.cash}
          mobileMoney={calculated.weekly.mobileMoney}
          target={targets.weekly}
          warning={calculated.weeklyWarning}
        />
        <SummaryCard
          title="This Month's Spending"
          dateRange={format(calculated.startOfMonthDate, 'MMMM yyyy')}
          total={calculated.monthly.total}
          cash={calculated.monthly.cash}
          mobileMoney={calculated.monthly.mobileMoney}
          target={targets.monthly}
          warning={calculated.monthlyWarning}
        />
      </div>
    </div>
  );
}
