'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import { 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Receipt,
  Hotel,
  Utensils,
  Plane,
  Ban
} from 'lucide-react';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/policies');
      if (response.data.success) {
        setPolicies(response.data.policies[0]);
      }
    } catch (error) {
      console.error('Fetch policies error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const guidelines = [
    {
      title: 'Meal Expenses',
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      limit: `$${policies?.rules?.mealLimitPerDay || 75} per day`,
      rules: [
        'Business meals only',
        'Receipt required',
        'Client/team members must be listed',
        'Alcohol limited to 2 drinks per person'
      ]
    },
    {
      title: 'Hotel Accommodation',
      icon: Hotel,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      limit: `$${policies?.rules?.hotelLimitPerNight || 250} per night`,
      rules: [
        'Book approved hotel chains',
        'Choose standard/business rooms',
        'Corporate rates when available',
        'Itemized receipt required'
      ]
    },
    {
      title: 'Air Travel',
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      limit: 'Economy class required',
      rules: [
        `Approved airlines: ${policies?.rules?.approvedAirlines?.join(', ') || 'United, Delta, American'}`,
        'Book 14+ days in advance',
        'Use corporate booking tool',
        'Business class requires VP approval'
      ]
    },
    {
      title: 'Receipt Requirements',
      icon: Receipt,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      limit: `Required over $${policies?.rules?.requiresReceiptOver || 25}`,
      rules: [
        'Original receipts required',
        'Digital copies accepted',
        'Must show itemized details',
        'Missing receipts require explanation'
      ]
    }
  ];

  const approvalLimits = [
    {
      range: `$0 - $${policies?.rules?.autoApproveLimit || 50}`,
      approver: 'Auto-Approved',
      timeframe: 'Immediate',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      range: `$${policies?.rules?.autoApproveLimit || 50} - $${policies?.rules?.managerApprovalLimit || 500}`,
      approver: 'Manager',
      timeframe: '1-2 business days',
      icon: AlertCircle,
      color: 'text-yellow-600'
    },
    {
      range: `$${policies?.rules?.managerApprovalLimit || 500} - $${policies?.rules?.directorApprovalLimit || 5000}`,
      approver: 'Director',
      timeframe: '3-5 business days',
      icon: AlertCircle,
      color: 'text-orange-600'
    },
    {
      range: `$${policies?.rules?.directorApprovalLimit || 5000}+`,
      approver: 'CFO',
      timeframe: '5-7 business days',
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expense Policy Guidelines</h1>
        <p className="text-gray-600 mt-1">
          Review company expense policies and approval limits
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Important Guidelines</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• All expenses must be business-related</li>
              <li>• Submit expenses within 30 days</li>
              <li>• Policy violations may delay approval</li>
              <li>• Contact finance@company.com for questions</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Category Guidelines */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guidelines.map((guide) => {
            const Icon = guide.icon;
            return (
              <Card key={guide.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${guide.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${guide.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                    <p className="text-sm text-gray-600">{guide.limit}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {guide.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Approval Limits */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Approval Limits</h2>
        <div className="space-y-3">
          {approvalLimits.map((limit) => {
            const Icon = limit.icon;
            return (
              <div
                key={limit.range}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${limit.color}`} />
                  <div>
                    <p className="font-semibold text-gray-900">{limit.range}</p>
                    <p className="text-sm text-gray-600">
                      Approver: {limit.approver}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{limit.timeframe}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Blacklisted Vendors */}
      {policies?.rules?.blacklistedVendors?.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Blacklisted Vendors</h3>
              <p className="text-sm text-red-800 mb-2">
                Expenses from these vendors will be automatically rejected:
              </p>
              <ul className="space-y-1">
                {policies.rules.blacklistedVendors.map((vendor) => (
                  <li key={vendor} className="text-sm text-red-800">
                    • {vendor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>For policy questions:</strong> Contact finance@company.com
          </p>
          <p>
            <strong>For technical issues:</strong> Contact support@company.com
          </p>
          <p>
            <strong>Emergency approvals:</strong> Call +1 (555) 123-4567
          </p>
        </div>
      </Card>
    </div>
  );
}