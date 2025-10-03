import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RevenueData, PaymentMethodData, TreatmentData } from '@/hooks/useAnalytics';

interface RevenueChartsProps {
  revenueData: RevenueData[];
  paymentMethods: PaymentMethodData[];
  topTreatments: TreatmentData[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#ec4899'];

export function RevenueCharts({ revenueData, paymentMethods, topTreatments, loading }: RevenueChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: any) => [`RS ${value.toFixed(2)}`, 'Revenue']}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, amount }) => `${method}: RS ${amount.toFixed(0)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `RS ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Treatments by Revenue */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Treatments by Count</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTreatments}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
              <YAxis className="text-xs" />
              <Tooltip formatter={(value: any) => [`${value}`, 'Count']} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
