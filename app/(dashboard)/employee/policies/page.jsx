'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/apiClient';
import Card from '@/components/ui/Card';
import { 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Receipt,
  FileText,
  Building2,
  User,
  Calendar
} from 'lucide-react';

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching policies...');
      const response = await apiClient.get('/api/policies');
      console.log('📋 Policies API response:', response.data);
      console.log('📋 Response data type:', typeof response.data);
      console.log('📋 Response data policies type:', typeof response.data.policies);
      console.log('📋 Is policies array?:', Array.isArray(response.data.policies));
      
      if (response.data.success) {
        // Ensure policies is always an array
        const policiesData = Array.isArray(response.data.policies) ? response.data.policies : [];
        setPolicies(policiesData);
        console.log('✅ Policies set:', policiesData);
      } else {
        console.error('❌ API returned success: false');
        setPolicies([]);
        setError('Failed to fetch policies');
      }
    } catch (error) {
      console.error('❌ Fetch policies error:', error);
      console.error('Error details:', error.response?.data || error.message);
      setPolicies([]); // Ensure policies is always an array
      setError('Error fetching policies. Please try again.');
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Policies</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchPolicies}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'travel': return Building2;
      case 'meals': return Receipt;
      case 'office': return FileText;
      default: return FileText;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'travel': return { text: 'text-blue-600', bg: 'bg-blue-50' };
      case 'meals': return { text: 'text-orange-600', bg: 'bg-orange-50' };
      case 'office': return { text: 'text-green-600', bg: 'bg-green-50' };
      default: return { text: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Policies</h1>
        <p className="text-gray-600 mt-1">
          Review expense policies created by your finance team
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Welcome, {user?.name}
            </h3>
            <p className="text-sm text-blue-800">
              Here are the expense policies for your company. Make sure to follow these guidelines when submitting expenses.
            </p>
          </div>
        </div>
      </Card>

      {/* Policies List */}
      {!Array.isArray(policies) || policies.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Available</h3>
          <p className="text-gray-600">
            {!Array.isArray(policies) 
              ? 'Error loading policies data.' 
              : 'Your finance team hasn\'t created any expense policies yet.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Policies</h2>
          <div className="grid gap-6">
            {policies.map((policy) => {
              const Icon = getCategoryIcon(policy.category);
              const colors = getCategoryColor(policy.category);
              
              return (
                <Card key={policy._id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`${colors.bg} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {policy.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
                          {policy.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {policy.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            Max Amount: <strong>${policy.maxAmount}</strong>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${policy.requiresApproval ? 'text-orange-600' : 'text-green-600'}`} />
                          <span className="text-sm text-gray-700">
                            {policy.requiresApproval ? 'Requires Approval' : 'Auto-Approved'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Receipt className={`w-4 h-4 ${policy.requiresReceipt ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="text-sm text-gray-700">
                            Receipt {policy.requiresReceipt ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Created {new Date(policy.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Policy ID: {policy._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Help Section */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>For policy questions:</strong> Contact your finance team
          </p>
          <p>
            <strong>To submit expenses:</strong> Go to Submit Expense page
          </p>
          <p>
            <strong>For technical issues:</strong> Contact IT support
          </p>
        </div>
      </Card>
    </div>
  );
}