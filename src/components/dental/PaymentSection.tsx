import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { Payment } from '@/types/dental';

interface PaymentSectionProps {
  payments: Payment[];
  onChange: (payments: Payment[]) => void;
}

export function PaymentSection({ payments, onChange }: PaymentSectionProps) {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<Payment['method']>('cash');
  const [paidAt, setPaidAt] = useState<string>(toLocalDateTimeInput(new Date()));
  const [notes, setNotes] = useState<string>('');

  const total = useMemo(() => payments.reduce((sum, p) => sum + (p.amount || 0), 0), [payments]);

  const addPayment = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    const id = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payment: Payment = {
      id,
      amount: value,
      method,
      paidAt: new Date(paidAt).toISOString(),
      notes: notes?.trim() || undefined,
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

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Payments & Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Payment */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2"
            />
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
            <Input
              type="datetime-local"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={1}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={addPayment} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Add Payment
          </Button>
        </div>

        {/* Payments List */}
        {(payments && payments.length > 0) ? (
          <div className="overflow-x-auto">
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
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{formatDate(p.paidAt)}</td>
                    <td className="py-2 capitalize">{p.method}</td>
                    <td className="py-2">₹{p.amount.toFixed(2)}</td>
                    <td className="py-2 text-muted-foreground">{p.notes || '-'}</td>
                    <td className="py-2 text-right">
                      <Button size="icon" variant="ghost" onClick={() => removePayment(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-3 text-sm font-medium">
              Total: ₹{total.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No payments added.</div>
        )}
      </CardContent>
    </Card>
  );
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
