'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { 
  X, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';

export default function ExpenseDetailModal({ expense, onClose }) {
  if (!expense) return null;
const getStatusIcon = () => {
switch (expense.status) {
case 'approved':
return <CheckCircle className="w-6 h-6 text-green-600" />;
case 'pending':
return <Clock className="w-6 h-6 text-yellow-600" />;
case 'rejected':
return <XCircle className="w-6 h-6 text-red-600" />;
case 'flagged':
return <AlertCircle className="w-6 h-6 text-orange-600" />;
default:
return null;
}
};
const getStatusColor = () => {
switch (expense.status) {
case 'approved':
return 'bg-green-100 text-green-800';
case 'pending':
return 'bg-yellow-100 text-yellow-800';
case 'rejected':
return 'bg-red-100 text-red-800';
case 'flagged':
return 'bg-orange-100 text-orange-800';
default:
return 'bg-gray-100 text-gray-800';
}
};
return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
<div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
<h2 className="text-2xl font-bold text-gray-900">Expense Details</h2>
<button
         onClick={onClose}
         className="text-gray-400 hover:text-gray-600 transition-colors"
       >
<X className="w-6 h-6" />
</button>
</div>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor()}`}>
            {expense.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Vendor</label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{expense.vendor}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Category</label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{expense.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Date</label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(expense.date)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Submitted</label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(expense.createdAt)}</p>
        </div>
      </div>

      {expense.subcategory && (
        <div>
          <label className="text-sm font-medium text-gray-500">Subcategory</label>
          <p className="text-gray-900 mt-1">{expense.subcategory}</p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-500">Description</label>
        <p className="text-gray-900 mt-1">{expense.description}</p>
      </div>

      {expense.employeeId && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="text-sm font-medium text-gray-500">Employee Information</label>
          <div className="mt-2 space-y-1">
            <p className="text-gray-900"><strong>Name:</strong> {expense.employeeId.name}</p>
            <p className="text-gray-900"><strong>Email:</strong> {expense.employeeId.email}</p>
            <p className="text-gray-900"><strong>Department:</strong> {expense.employeeId.department}</p>
            <p className="text-gray-900"><strong>Employee ID:</strong> {expense.employeeId.employeeId}</p>
          </div>
        </div>
      )}

      {expense.policyViolations && expense.policyViolations.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Policy Violations
          </h4>
          <ul className="space-y-2">
            {expense.policyViolations.map((violation, idx) => (
              <li key={idx} className="text-sm text-orange-800">
                <span className="font-medium">[{violation.severity.toUpperCase()}]</span> {violation.rule}: {violation.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {expense.approvedBy && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <label className="text-sm font-medium text-green-900">Approval Information</label>
          <div className="mt-2 space-y-1">
            <p className="text-green-800"><strong>Approved by:</strong> {expense.approvedBy.name}</p>
            <p className="text-green-800"><strong>Approved on:</strong> {formatDate(expense.approvedAt)}</p>
          </div>
        </div>
      )}

      {expense.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <label className="text-sm font-medium text-red-900">Rejection Reason</label>
          <p className="text-red-800 mt-1">{expense.rejectionReason}</p>
        </div>
      )}

      {expense.receiptUrl && (
        <div>
          <label className="text-sm font-medium text-gray-500 mb-2 block">Receipt</label>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(expense.receiptUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = expense.receiptUrl;
                link.download = `receipt-${expense._id}`;
                link.click();
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>

    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
      <Button variant="outline" onClick={onClose} className="w-full">
        Close
      </Button>
    </div>
  </div>
</div>
);
}