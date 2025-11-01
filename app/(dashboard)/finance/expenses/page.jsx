import ExpenseList from '@/components/expenses/ExpenseList';

export default function FinanceExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Expenses</h1>
        <p className="text-gray-600 mt-1">
          View and manage all company expenses
        </p>
      </div>

      <ExpenseList userRole="finance" />
    </div>
  );
}