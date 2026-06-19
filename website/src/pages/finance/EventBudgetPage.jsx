import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { fetchEventBudgetData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function EventBudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchEventBudgetData();
        setBudgets(response.data?.budgets || response.data || []);
      } catch (err) {
        const apiMsg = err?.response?.data?.error || err?.message || 'Failed to load budget data';
        setError(apiMsg);
        toast({ title: 'Error', description: apiMsg, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadBudgets();
  }, [location.pathname, toast]);

  const loadBudgetDetails = async (budgetId) => {
    try {
      const budget = budgets.find((b) => b.id === budgetId);
      setSelectedBudget(budget);
      const expensesRes = await fetchEventBudgetData(budgetId, 'expenses');
      const revenuesRes = await fetchEventBudgetData(budgetId, 'revenues');
      setExpenses(expensesRes.data || []);
      setRevenues(revenuesRes.data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load budget details',
        variant: 'destructive',
      });
    }
  };

  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const getTotalRevenues = () => revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
  const getUtilization = () => {
    if (!selectedBudget?.totalAmount || selectedBudget.totalAmount === 0) return 0;
    return Math.round((getTotalExpenses() / selectedBudget.totalAmount) * 100);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white text-lg">Loading budgets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Budgets</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-white text-black hover:bg-gray-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Event Budget Management</h1>
            <p className="text-gray-400 mt-1">
              Manage budgets, track expenses, and monitor financial performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#2A2A2A] text-white hover:bg-[#1A1A1A]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${selectedBudget?.totalAmount?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${getTotalExpenses().toLocaleString()}
              </div>
              <div className="mt-1">
                <Progress value={getUtilization()} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">{getUtilization()}% utilized</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${getTotalRevenues().toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getTotalRevenues() - getTotalExpenses() >= 0 ? (
                  <span className="text-green-400 flex items-center text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +${(getTotalRevenues() - getTotalExpenses()).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center text-xs">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -${Math.abs(getTotalRevenues() - getTotalExpenses()).toLocaleString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Budgets</CardTitle>
              <Select onValueChange={loadBudgetDetails} value={selectedBudget?.id || ''}>
                <SelectTrigger className="w-[240px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {budgets.map((budget) => (
                    <SelectItem
                      key={budget.id}
                      value={budget.id}
                      className="text-white focus:bg-[#2A2A2A]"
                    >
                      {budget.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No budgets found</p>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedBudget?.id === budget.id
                        ? 'bg-[#2A2A2A] border-[#3A3A3A]'
                        : 'bg-[#0A0A0A] border-[#2A2A2A] hover:border-[#3A3A3A]'
                    }`}
                    onClick={() => loadBudgetDetails(budget.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{budget.name}</h3>
                        <p className="text-sm text-gray-400">
                          {budget.startDate
                            ? format(new Date(budget.startDate), 'MMM dd, yyyy')
                            : 'No start date'}{' '}
                          -{' '}
                          {budget.endDate
                            ? format(new Date(budget.endDate), 'MMM dd, yyyy')
                            : 'No end date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${budget.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Budget</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedBudget && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No expenses recorded</p>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div
                        key={expense.id}
                        className="p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{expense.name}</div>
                            <div className="text-xs text-gray-400">{expense.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              ${expense.amount.toLocaleString()}
                            </div>
                            <Badge className={`text-xs ${getStatusColor(expense.status)}`}>
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white">Recent Revenues</CardTitle>
              </CardHeader>
              <CardContent>
                {revenues.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No revenue recorded</p>
                ) : (
                  <div className="space-y-3">
                    {revenues.slice(0, 5).map((revenue) => (
                      <div
                        key={revenue.id}
                        className="p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{revenue.source}</div>
                            <div className="text-xs text-gray-400">
                              {revenue.description || 'No description'}
                            </div>
                          </div>
                          <div className="text-white font-semibold">
                            ${revenue.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
