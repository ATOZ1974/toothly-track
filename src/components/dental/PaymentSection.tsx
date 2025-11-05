import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Payment } from '@/types/dental';
interface PaymentSectionProps {
  payments: Payment[];
  onChange: (payments: Payment[]) => void;
}
export function PaymentSection({
  payments,
  onChange
}: PaymentSectionProps) {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<Payment['method']>('cash');
  const [paidAt, setPaidAt] = useState<string>(toLocalDateTimeInput(new Date()));
  const [notes, setNotes] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + (p.amount || 0), 0), [payments]);
  const totalAmountNum = parseFloat(totalAmount) || 0;
  const balance = totalAmountNum - totalPaid;
  const addPayment = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;
    const id = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payment: Payment = {
      id,
      amount: value,
      method,
      paidAt: new Date(paidAt).toISOString(),
      notes: notes?.trim() || undefined
    };
    onChange([...(payments || []), payment]);
    // reset form
    setAmount('');
    setMethod('cash');
    setPaidAt(toLocalDateTimeInput(new Date()));
    setNotes('');
  };
  const removePayment = (id: string) => {
    onChange((payments || []).filter(p => p.id !== id));
  };
  return <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-foreground text-3xl">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <label className="text-sm font-medium">Total Treatment Cost</label>
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="mt-2" />
          </div>
          <div className="text-center">
            <label className="text-sm font-medium">Amount Paid</label>
            <div className="text-2xl font-bold text-green-600 mt-2">₹{totalPaid.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <label className="text-sm font-medium">Balance</label>
            <div className={`text-2xl font-bold mt-2 ${balance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Add Payment */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Method</label>
            <Select value={method} onValueChange={(v: Payment['method']) => setMethod(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Date & Time</label>
            <Input type="datetime-local" value={paidAt} onChange={e => setPaidAt(e.target.value)} className="mt-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} className="mt-2" rows={1} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={addPayment} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <motion.div
              whileHover={{ rotate: 90, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
            </motion.div>
            Add Payment
          </Button>
        </div>

        {/* Payments List */}
        {payments && payments.length > 0 ? <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Date & Time</th>
                  <th className="text-left py-2">Method</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Notes</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{formatDate(p.paidAt)}</td>
                    <td className="py-2 capitalize">{p.method}</td>
                    <td className="py-2">₹{p.amount.toFixed(2)}</td>
                    <td className="py-2 text-muted-foreground">{p.notes || '-'}</td>
                    <td className="py-2 text-right">
                      <Button size="icon" variant="ghost" onClick={() => removePayment(p.id)}>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.div>
                      </Button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
            <div className="flex justify-between mt-3 text-sm font-medium">
              <span>Total Paid: ₹{totalPaid.toFixed(2)}</span>
              <span className={balance <= 0 ? 'text-green-600' : 'text-red-600'}>
                Balance: ₹{balance.toFixed(2)}
              </span>
            </div>
          </div> : <div className="text-sm text-muted-foreground">No payments added.</div>}
      </CardContent>
    </Card>;
}
function toLocalDateTimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}