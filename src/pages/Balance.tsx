import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Balance = () => {
  const navigate = useNavigate();
  const [balance] = useState({
    current: 15420.50,
    income: 28350.00,
    expenses: 12929.50
  });

  const transactions = [
    { id: 1, type: 'income', description: 'Patient Payment - John Doe', amount: 250, date: '2025-11-08' },
    { id: 2, type: 'expense', description: 'Medical Supplies', amount: 180, date: '2025-11-07' },
    { id: 3, type: 'income', description: 'Patient Payment - Jane Smith', amount: 320, date: '2025-11-07' },
    { id: 4, type: 'expense', description: 'Equipment Maintenance', amount: 450, date: '2025-11-06' },
    { id: 5, type: 'income', description: 'Patient Payment - Mike Johnson', amount: 280, date: '2025-11-06' },
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
    </div>
  );
};

export default Balance;
