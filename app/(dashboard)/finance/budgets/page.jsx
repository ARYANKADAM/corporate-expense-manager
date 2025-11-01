'use client';

import { useState } from 'react';
import BudgetList from '@/components/budgets/BudgetList';
import BudgetForm from '@/components/budgets/BudgetForm';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    // The BudgetList component will automatically refresh
    window.location.reload();
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowForm(false)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Budgets
        </Button>
        <BudgetForm
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600 mt-1">
          Track and manage department budgets
        </p>
      </div>

      <BudgetList onCreateClick={() => setShowForm(true)} />
    </div>
  );
}