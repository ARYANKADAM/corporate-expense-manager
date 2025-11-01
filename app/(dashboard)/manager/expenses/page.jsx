import ExpenseList from '@/components/expenses/ExpenseList';

export default function ManagerExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
        <p className="text-gray-600 mt-1">
          View and manage your personal expenses
        </p>
      </div>

      <ExpenseList userRole="manager" />
    </div>
  );
}