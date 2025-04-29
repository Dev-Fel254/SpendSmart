'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, PieChart, FileDown } from 'lucide-react';
import type { Expenditure, ExpenditureCategory } from '@/lib/types';
import { calculatePeriodTotals, getExpendituresForPeriod } from '@/lib/expenditure-calculations';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, Pie, Cell, BarChart as RechartsBarChart, PieChart as RechartsPieChart } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface ReportGeneratorProps {
  allExpenditures: Expenditure[];
}

type ReportPeriod = 'today' | 'this_week' | 'this_month' | 'custom_day' | 'custom_week' | 'custom_month';
type ChartType = 'bar' | 'pie';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))']; // Teal and Gold from theme

export function ReportGenerator({ allExpenditures }: ReportGeneratorProps) {
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<Expenditure[]>([]);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [showReport, setShowReport] = useState<boolean>(false);

  const generateReport = () => {
    let data: Expenditure[] = [];
    let title = '';
    const dateToUse = customDate || new Date(); // Use custom date if available, else today

    switch (period) {
      case 'today':
        data = getExpendituresForPeriod(allExpenditures, 'day', new Date()); // Always today for 'today'
        title = `Report for Today (${format(new Date(), 'PPP')})`;
        break;
      case 'this_week':
        data = getExpendituresForPeriod(allExpenditures, 'week', new Date()); // Always current week
        title = `Report for This Week (${format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d, yyyy')})`;
        break;
      case 'this_month':
        data = getExpendituresForPeriod(allExpenditures, 'month', new Date()); // Always current month
        title = `Report for This Month (${format(new Date(), 'MMMM yyyy')})`;
        break;
      case 'custom_day':
        data = getExpendituresForPeriod(allExpenditures, 'day', dateToUse);
        title = `Report for ${format(dateToUse, 'PPP')}`;
        break;
       case 'custom_week':
        data = getExpendituresForPeriod(allExpenditures, 'week', dateToUse);
        const weekStart = startOfWeek(dateToUse, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(dateToUse, { weekStartsOn: 1 });
        title = `Report for Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        break;
      case 'custom_month':
        data = getExpendituresForPeriod(allExpenditures, 'month', dateToUse);
        title = `Report for ${format(dateToUse, 'MMMM yyyy')}`;
        break;
    }
    setReportData(data);
    setReportTitle(title);
    setShowReport(true);
  };

  const totals = calculatePeriodTotals(reportData);
  const chartData = [
    { name: 'Cash', value: totals.cash },
    { name: 'Mobile Money', value: totals.mobileMoney },
  ];

   const isCustomPeriod = period.startsWith('custom');

    // Function to download report as CSV
    const downloadCSV = () => {
        if (!reportData.length) return;

        const headers = ['Date', 'Category', 'Amount', 'Description'];
        const csvRows = [
            headers.join(','), // header row
            ...reportData.map(row => [
                format(parseISO(row.date), 'yyyy-MM-dd'),
                row.category,
                row.amount,
                `"${row.description?.replace(/"/g, '""') ?? ''}"` // Handle descriptions with quotes
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `SpendSmart_Report_${reportTitle.replace(/[^a-z0-9]/gi, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>Select a period and view your expenditure breakdown.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full sm:w-auto">
                <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this_week">This Week</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="custom_day">Custom Day</SelectItem>
                        <SelectItem value="custom_week">Custom Week</SelectItem>
                        <SelectItem value="custom_month">Custom Month</SelectItem>
                    </SelectContent>
                </Select>
           </div>

            {isCustomPeriod && (
                 <div className="flex-1 w-full sm:w-auto">
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !customDate && "text-muted-foreground"
                            )}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={customDate}
                            onSelect={setCustomDate}
                            initialFocus
                            captionLayout={period === 'custom_month' ? 'dropdown-buttons' : 'buttons'}
                             fromYear={2015} toYear={new Date().getFullYear() + 1} // Allow selecting months/years
                             components={
                                period === 'custom_week' ? {
                                    Day: ({ date, displayMonth }) => {
                                    const dayOfMonth = date.getDate();
                                    const isInDisplayMonth = date.getMonth() === displayMonth.getMonth() && date.getFullYear() === displayMonth.getFullYear();
                                    const isSelected = customDate && format(date, 'yyyy-MM-dd') === format(customDate, 'yyyy-MM-dd');
                                    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                                    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                                    const isDateInSelectedWeek = customDate && isWithinInterval(date, {start: startOfWeek(customDate, { weekStartsOn: 1 }), end: endOfWeek(customDate, { weekStartsOn: 1 })});


                                    return (
                                        <div
                                        className={cn(
                                            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                                            !isInDisplayMonth && "text-muted-foreground opacity-50",
                                            isDateInSelectedWeek && "bg-accent/50", // Highlight week
                                            isSelected && "bg-primary text-primary-foreground rounded-md", // Highlight selected day
                                            "h-9 w-9"
                                        )}
                                        >
                                        <button
                                            onClick={() => setCustomDate(date)}
                                            className={cn(
                                            "h-9 w-9 p-0 font-normal",
                                             isSelected && "opacity-100",
                                             !isSelected && isDateInSelectedWeek && "hover:bg-accent/80 rounded-none", // Hover effect for week days
                                              !isDateInSelectedWeek && !isSelected && "hover:bg-accent rounded-md" // Hover effect for non-week days
                                            )}
                                            aria-selected={isSelected}
                                        >
                                            {dayOfMonth}
                                        </button>
                                        </div>
                                    );
                                    },
                                } : undefined
                                }
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            )}
           <Button onClick={generateReport} className="w-full sm:w-auto">Generate Report</Button>
        </div>

        {showReport && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-500">
            <div className='flex justify-between items-center'>
                <h3 className="text-xl font-semibold">{reportTitle}</h3>
                <Button onClick={downloadCSV} variant="outline" size="sm" disabled={!reportData.length}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download CSV
                </Button>
            </div>

            {reportData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Card>
                     <CardHeader className='pb-2'>
                       <CardTitle className='text-base font-medium'>Total Spending</CardTitle>
                     </CardHeader>
                      <CardContent>
                         <p className="text-2xl font-bold">{totals.total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
                         <p className="text-xs text-muted-foreground">
                            Cash: {totals.cash.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} | Mobile Money: {totals.mobileMoney.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                        </p>
                      </CardContent>
                   </Card>
                   <Card>
                     <CardHeader className='pb-2'>
                       <CardTitle className='text-base font-medium'>Spending Breakdown</CardTitle>
                       <div className="flex gap-1">
                            <Button variant={chartType === 'bar' ? 'secondary' : 'ghost'} size="icon" className='h-7 w-7' onClick={() => setChartType('bar')}>
                                <BarChart className='h-4 w-4' />
                            </Button>
                             <Button variant={chartType === 'pie' ? 'secondary' : 'ghost'} size="icon" className='h-7 w-7' onClick={() => setChartType('pie')}>
                                <PieChart className='h-4 w-4' />
                            </Button>
                       </div>
                     </CardHeader>
                      <CardContent className="h-[150px] pt-0 -ml-4 -mb-4"> {/* Adjust height and margins */}
                         <ResponsiveContainer width="100%" height="100%">
                           {chartType === 'bar' ? (
                             <RechartsBarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                               <XAxis type="number" hide />
                               <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 12 }} />
                               <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                               <Legend wrapperStyle={{ fontSize: '12px' }}/>
                               <Bar dataKey="value" barSize={30} name="Amount">
                                 {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                               </Bar>
                             </RechartsBarChart>
                           ) : (
                             <RechartsPieChart>
                               <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return ( percent > 0.05 ? // Only show label if > 5%
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                                        {`${(percent * 100).toFixed(0)}%`}
                                        </text> : null
                                    );
                                    }}>
                                 {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                               </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                               <Legend wrapperStyle={{ fontSize: '12px' }} align="center" verticalAlign='bottom' />
                             </RechartsPieChart>
                           )}
                         </ResponsiveContainer>
                      </CardContent>
                   </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell>{format(parseISO(exp.date), 'PP')}</TableCell>
                        <TableCell>
                             <span className='flex items-center gap-1'>
                                {exp.category === 'Cash' ? <CashIcon className='h-4 w-4 text-gray-500'/> : <MobileMoneyIcon className='h-4 w-4 text-blue-500'/>}
                                {exp.category}
                            </span>
                        </TableCell>
                        <TableCell>{exp.description || '-'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {exp.amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                        </TableCell>
                      </TableRow>
                    ))}
                     <TableRow className='bg-secondary hover:bg-secondary'>
                            <TableCell colSpan={3} className="font-bold text-right">Total</TableCell>
                            <TableCell className="font-bold text-right">{totals.total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</TableCell>
                        </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">No expenditures found for the selected period.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// Helper to parse ISO date string safely
const parseISO = (dateString: string): Date => {
    try {
        // Add time component to avoid timezone issues during parsing
        return new Date(dateString + 'T00:00:00');
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return new Date(); // Fallback to current date on error
    }
}

// Helper function needed for week view in calendar
const isWithinInterval = (date: Date, interval: { start: Date; end: Date }): boolean => {
  return date >= interval.start && date <= interval.end;
};
