'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CashIcon } from '@/components/icons/cash-icon';
import { MobileMoneyIcon } from '@/components/icons/mobile-money-icon';
import type { Expenditure, ExpenditureCategory } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.enum(['Cash', 'Mobile Money']),
  description: z.string().optional(),
  date: z.date(),
});

type ExpenditureFormValues = z.infer<typeof formSchema>;

interface ExpenditureFormProps {
  onSubmit: (data: Omit<Expenditure, 'id'>) => void;
  defaultValues?: Partial<ExpenditureFormValues>;
  submitButtonText?: string;
}

export function ExpenditureForm({ onSubmit, defaultValues, submitButtonText = 'Add Expenditure' }: ExpenditureFormProps) {
  const form = useForm<ExpenditureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: defaultValues?.amount ?? 0,
      category: defaultValues?.category ?? 'Cash',
      description: defaultValues?.description ?? '',
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(), // Ensure date is a Date object
    },
  });

  function handleFormSubmit(data: ExpenditureFormValues) {
    onSubmit({
        ...data,
        date: data.date.toISOString().split('T')[0] // Convert date back to string
    });
    form.reset({ // Reset form after submission
        amount: 0,
        category: 'Cash',
        description: '',
        date: new Date()
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cash">
                    <div className="flex items-center gap-2">
                      <CashIcon className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="Mobile Money">
                    <div className="flex items-center gap-2">
                      <MobileMoneyIcon className="h-4 w-4" />
                      Mobile Money
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Lunch, Groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{submitButtonText}</Button>
      </form>
    </Form>
  );
}
