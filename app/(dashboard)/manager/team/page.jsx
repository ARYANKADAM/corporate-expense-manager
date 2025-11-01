import ExpenseList from '@/components/expenses/ExpenseList';

export default function ManagerTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Expenses</h1>
        <p className="text-gray-600 mt-1">
          View all expenses from your team members
        </p>
      </div>

      <ExpenseList userRole="manager" />
    </div>
  );
}