import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Balance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState({
    current: 0,
    income: 0,
    expenses: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      calculateBalance(data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const calculateBalance = (txns: any[]) => {
    const income = txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const current = income - expenses;

    setBalance({
      current,
      income,
      expenses
    });
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user?.id,
          type: 'expense',
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          date: newExpense.date,
          source: 'manual'
        }]);

      if (error) throw error;

      setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setIsDialogOpen(false);
      loadTransactions();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Add Expense Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
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
              {transactions.map(transaction => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </p>
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="income" className="space-y-2 mt-4">
              {transactions.filter(t => t.type === 'income').map(transaction => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">+${transaction.amount}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="expense" className="space-y-2 mt-4">
              {transactions.filter(t => t.type === 'expense').map(transaction => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-600">-${transaction.amount}</p>
                  </div>
                </Card>
              ))}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
