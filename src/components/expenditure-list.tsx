'use client';

import type { Expenditure, ExpenditureCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CashIcon } from '@/components/icons/cash-icon';
import { MobileMoneyIcon } from '@/components/icons/mobile-money-icon';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExpenditureForm } from './expenditure-form';
import { useState } from 'react';

interface ExpenditureListProps {
  expenditures: Expenditure[];
  onDelete: (id: string) => void;
  onUpdate: (expenditure: Expenditure) => void;
}

const CategoryIcon = ({ category }: { category: ExpenditureCategory }) => {
  if (category === 'Cash') {
    return <CashIcon className="h-5 w-5 text-gray-500" />;
  }
  return <MobileMoneyIcon className="h-5 w-5 text-blue-500" />;
};

export function ExpenditureList({ expenditures, onDelete, onUpdate }: ExpenditureListProps) {
    const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleEditClick = (expenditure: Expenditure) => {
        setEditingExpenditure(expenditure);
        setIsEditDialogOpen(true);
    };

    const handleUpdateSubmit = (updatedData: Omit<Expenditure, 'id'>) => {
        if (editingExpenditure) {
            onUpdate({ ...updatedData, id: editingExpenditure.id });
            setIsEditDialogOpen(false); // Close dialog on successful update
            setEditingExpenditure(null);
        }
    };

    const handleDialogClose = () => {
         setIsEditDialogOpen(false);
         setEditingExpenditure(null);
    }


  if (expenditures.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No expenditures recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {expenditures.map((exp) => (
        <Card key={exp.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
                <CategoryIcon category={exp.category} />
                <CardTitle className="text-lg font-semibold">
                {exp.category}
                </CardTitle>
                 <span className="text-sm text-muted-foreground ml-2">
                  {format(new Date(exp.date + 'T00:00:00'), 'PPP')} {/* Add time to avoid timezone issues */}
                </span>
            </div>
            <span className="text-lg font-bold text-primary">
              {exp.amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} {/* Adjust currency as needed */}
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            {exp.description && (
              <CardDescription>{exp.description}</CardDescription>
            )}
            <div className="flex justify-end gap-2 mt-2">
               <Dialog open={isEditDialogOpen && editingExpenditure?.id === exp.id} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(exp)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Edit Expenditure</DialogTitle>
                    </DialogHeader>
                    {editingExpenditure && (
                         <ExpenditureForm
                            onSubmit={handleUpdateSubmit}
                            defaultValues={{
                                amount: editingExpenditure.amount,
                                category: editingExpenditure.category,
                                description: editingExpenditure.description,
                                date: new Date(editingExpenditure.date + 'T00:00:00'), // Pass Date object
                            }}
                            submitButtonText="Update Expenditure"
                        />
                    )}
                </DialogContent>
                </Dialog>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this expenditure record.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(exp.id)} className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
