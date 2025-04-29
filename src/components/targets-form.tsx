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
import type { Targets } from '@/lib/types';

const formSchema = z.object({
  daily: z.coerce.number().nonnegative('Target must be non-negative').nullable(),
  weekly: z.coerce.number().nonnegative('Target must be non-negative').nullable(),
  monthly: z.coerce.number().nonnegative('Target must be non-negative').nullable(),
});

type TargetsFormValues = z.infer<typeof formSchema>;

interface TargetsFormProps {
  onSubmit: (data: Targets) => void;
  defaultValues?: Targets;
}

export function TargetsForm({ onSubmit, defaultValues }: TargetsFormProps) {
  const form = useForm<TargetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daily: defaultValues?.daily ?? null,
      weekly: defaultValues?.weekly ?? null,
      monthly: defaultValues?.monthly ?? null,
    },
  });

   function handleFormSubmit(data: TargetsFormValues) {
        // Convert empty strings or invalid numbers to null before submitting
        const formattedData: Targets = {
            daily: data.daily === null || isNaN(Number(data.daily)) ? null : Number(data.daily),
            weekly: data.weekly === null || isNaN(Number(data.weekly)) ? null : Number(data.weekly),
            monthly: data.monthly === null || isNaN(Number(data.monthly)) ? null : Number(data.monthly),
        };
        onSubmit(formattedData);
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="daily"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Target</FormLabel>
              <FormControl>
                {/* Render the field value as empty string if null for the input */}
                <Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weekly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekly Target</FormLabel>
              <FormControl>
                 <Input type="number" step="0.01" placeholder="e.g., 300" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Target</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 1200" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Set Targets</Button>
      </form>
    </Form>
  );
}
