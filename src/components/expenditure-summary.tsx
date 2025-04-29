'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CalendarDays, CalendarRange } from 'lucide-react';
import type { Targets, Expenditure } from '@/lib/types';
import { calculateExpenditures } from '@/lib/expenditure-calculations';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

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
          {warning && <AlertTriangle className="h-5 w-5 text-accent" />}
        </div>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          {target !== null && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              / {target.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} Target
            </span>
          )}
        </div>
        {target !== null && (
          <Progress value={progress} className={cn("h-2 mb-3", targetExceeded ? '[&>div]:bg-accent' : '')} />
        )}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Cash: {cash.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>
          <span>Mobile: {mobileMoney.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export function ExpenditureSummary({ expenditures, targets }: ExpenditureSummaryProps) {
  const calculated = calculateExpenditures(expenditures, targets);

  return (
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
  );
}
