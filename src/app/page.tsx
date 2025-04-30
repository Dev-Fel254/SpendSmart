'use client';

import { useState } from 'react';
import { ExpenditureForm } from '@/components/expenditure-form';
import { TargetsForm } from '@/components/targets-form';
import { ExpenditureList } from '@/components/expenditure-list';
import { ExpenditureSummary } from '@/components/expenditure-summary';
import { ReportGenerator } from '@/components/report-generator';
import useExpenditures from '@/hooks/use-expenditures';
import useTargets from '@/hooks/use-targets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle, AreaChart, List } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


export default function Home() {
  const { expenditures, addExpenditure, deleteExpenditure, updateExpenditure } = useExpenditures();
  const { targets, updateTargets } = useTargets();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const handleAddExpenditure = (data: Omit<Expenditure, 'id'>) => {
    addExpenditure(data);
     toast({
      title: "Expenditure Added",
      description: `Successfully added ${data.amount.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}.`, // Updated currency
    });
     setIsAddFormOpen(false); // Close sheet after adding
  };

  const handleUpdateExpenditure = (data: Expenditure) => {
    updateExpenditure(data);
    toast({
        title: "Expenditure Updated",
        description: "Expenditure details saved successfully.",
    });
  }

  const handleDeleteExpenditure = (id: string) => {
     const expenditureToDelete = expenditures.find(exp => exp.id === id);
     deleteExpenditure(id);
      toast({
      title: "Expenditure Deleted",
      description: `Removed expenditure of ${expenditureToDelete?.amount.toLocaleString(undefined, { style: 'currency', currency: 'KES' })}.`, // Updated currency
      variant: "destructive"
    });
  }

  const handleSetTargets = (data: Targets) => {
    updateTargets(data);
     toast({
      title: "Targets Updated",
      description: "Your spending targets have been saved.",
    });
     setIsSettingsOpen(false); // Close sheet after setting targets
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
         <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
             </svg>
            SpendSmart
        </h1>
        <div className="flex items-center gap-2">
           <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
                <SheetTrigger asChild>
                    <Button size="sm" className="relative">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Add Spending
                    </Button>
                </SheetTrigger>
                 <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Add New Expenditure</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                         <ExpenditureForm onSubmit={handleAddExpenditure} />
                    </div>
                </SheetContent>
            </Sheet>
           <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                     <div className="py-4">
                        <h3 className="text-lg font-medium mb-4">Set Spending Targets</h3>
                        <TargetsForm onSubmit={handleSetTargets} defaultValues={targets} />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Summary Section */}
        <ExpenditureSummary expenditures={expenditures} targets={targets} />

        {/* Tabs for List and Reports */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list"><List className="mr-2 h-4 w-4"/>Spending List</TabsTrigger>
            <TabsTrigger value="reports"><AreaChart className="mr-2 h-4 w-4"/>Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
             <Card>
                <CardHeader>
                    <CardTitle>Recent Expenditures</CardTitle>
                    <CardDescription>View and manage your recorded spending.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpenditureList expenditures={expenditures} onDelete={handleDeleteExpenditure} onUpdate={handleUpdateExpenditure}/>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
             <ReportGenerator allExpenditures={expenditures} />
          </TabsContent>
        </Tabs>

      </main>
      <Toaster />
    </div>
  );
}

// Define type Expenditure and Targets if not already defined globally or imported
import type { Expenditure, Targets } from '@/lib/types';
