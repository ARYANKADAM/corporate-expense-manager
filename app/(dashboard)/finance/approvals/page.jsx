import ApprovalQueue from '@/components/expenses/ApprovalQueue';

export default function FinanceApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and process pending expense approvals
        </p>
      </div>

      <ApprovalQueue />
    </div>
  );
}