import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  paid_at: string;
  notes: string | null;
  payment_method: string;
  patient_id: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  expense_date: string;
}

const Balance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState({
    current: 0,
    income: 0,
    expenses: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'general',
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load payments (income from treatments)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id, amount, paid_at, notes, payment_method, patient_id,
          patients!inner(user_id)
        `)
        .eq('patients.user_id', user?.id)
        .order('paid_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      setPayments(paymentsData || []);
      setExpenses(expensesData || []);
      calculateBalance(paymentsData || [], expensesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load balance data');
    }
  };

  const calculateBalance = (paymentsData: Payment[], expensesData: Expense[]) => {
    const income = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
    const expensesTotal = expensesData.reduce((sum, e) => sum + Number(e.amount), 0);
    const current = income - expensesTotal;

    setBalance({
      current,
      income,
      expenses: expensesTotal
    });
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          user_id: user?.id,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          expense_date: newExpense.date
        }]);

      if (error) throw error;

      toast.success('Expense added successfully');
      setNewExpense({ description: '', amount: '', category: 'general', date: new Date().toISOString().split('T')[0] });
      setIsDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error adding expense:', err);
      toast.error('Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Expense deleted');
      loadData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Failed to delete expense');
    }
  };

  const expenseCategories = [
    { value: 'general', label: 'General' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'supplies', label: 'Medical Supplies' },
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'salaries', label: 'Salaries' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-semibold">Your Balance</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Overview */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6">
          <div className="space-y-2">
            <p className="text-sm opacity-90">Current Balance</p>
            <h2 className="text-4xl font-bold">${balance.current.toLocaleString()}</h2>
          </div>
        </Card>

        {/* Income & Expenses */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-semibold text-green-600">
                  ${balance.income.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-semibold text-red-600">
                  ${balance.expenses.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pulse Add Expense Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white relative overflow-hidden animate-pulse shadow-lg shadow-red-500/30"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Transactions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-2 mt-4">
              {/* Income transactions */}
              {payments.map(payment => (
                <Card key={payment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.paid_at), 'dd-MM-yyyy')} • {payment.payment_method}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">+${Number(payment.amount).toLocaleString()}</p>
                  </div>
                </Card>
              ))}
              {/* Expense transactions */}
              {expenses.map(expense => (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(expense.expense_date), 'dd-MM-yyyy')} • {expense.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-red-600">-${Number(expense.amount).toLocaleString()}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {payments.length === 0 && expenses.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No transactions yet</p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="income" className="space-y-2 mt-4">
              {payments.map(payment => (
                <Card key={payment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.paid_at), 'dd-MM-yyyy')} • {payment.payment_method}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">+${Number(payment.amount).toLocaleString()}</p>
                  </div>
                </Card>
              ))}
              {payments.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No income received yet</p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="expense" className="space-y-2 mt-4">
              {expenses.map(expense => (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(expense.expense_date), 'dd-MM-yyyy')} • {expense.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-red-600">-${Number(expense.amount).toLocaleString()}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {expenses.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No expenses added yet</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Medical Supplies, Equipment Maintenance"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddExpense}
                disabled={isLoading}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Balance;