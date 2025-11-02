'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  DollarSign, 
  Plane, 
  Building, 
  AlertCircle,
  CheckCircle,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Toast from '@/components/ui/Toast';

export default function FinancePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [form, setForm] = useState({
    name: '',
    department: '',
    rules: {
      mealLimitPerDay: 75,
      hotelLimitPerNight: 250,
      requiresReceiptOver: 25,
      approvedAirlines: '',
      blacklistedVendors: '',
      autoApproveLimit: 50,
      managerApprovalLimit: 500,
      directorApprovalLimit: 5000,
    },
  });

  // Fetch all existing policies
  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      console.log('🔄 Fetching policies (Finance)...');
      const res = await apiClient.get('/api/policies');
      console.log('📋 Finance policies API response:', res.data);
      
      if (res.data.success) {
        // Ensure policies is always an array
        const policiesData = Array.isArray(res.data.policies) ? res.data.policies : [];
        setPolicies(policiesData);
        console.log('✅ Finance policies set:', policiesData);
      } else {
        console.error('❌ Finance API returned success: false');
        setPolicies([]);
        setToast({
          show: true,
          message: 'Failed to load policies. Please refresh the page.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('❌ Error fetching policies:', err);
      console.error('Error details:', err.response?.data || err.message);
      setPolicies([]); // Ensure policies is always an array
      setToast({
        show: true,
        message: 'Failed to load policies. Please refresh the page.',
        type: 'error'
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert comma-separated strings to arrays
      const policyData = {
        ...form,
        rules: {
          ...form.rules,
          approvedAirlines: form.rules.approvedAirlines 
            ? form.rules.approvedAirlines.split(',').map(a => a.trim()).filter(Boolean)
            : [],
          blacklistedVendors: form.rules.blacklistedVendors 
            ? form.rules.blacklistedVendors.split(',').map(v => v.trim()).filter(Boolean)
            : [],
        },
      };

      if (editingPolicy) {
        await apiClient.put(`/api/policies/${editingPolicy._id}`, policyData);
        setToast({
          show: true,
          message: `Policy "${form.name}" updated successfully!`,
          type: 'success'
        });
      } else {
        await apiClient.post('/api/policies', policyData);
        setToast({
          show: true,
          message: `Policy "${form.name}" created successfully!`,
          type: 'success'
        });
      }
      
      setShowForm(false);
      setEditingPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (err) {
      console.error('Error creating/updating policy:', err);
      setToast({
        show: true,
        message: err.response?.data?.message || `Failed to ${editingPolicy ? 'update' : 'create'} policy`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      department: '',
      rules: {
        mealLimitPerDay: 75,
        hotelLimitPerNight: 250,
        requiresReceiptOver: 25,
        approvedAirlines: '',
        blacklistedVendors: '',
        autoApproveLimit: 50,
        managerApprovalLimit: 500,
        directorApprovalLimit: 5000,
      },
    });
    setEditingPolicy(null);
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || policy.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const uniqueDepartments = [...new Set(policies.map(p => p.department))];

  const handleDelete = async (policyId, policyName) => {
    if (window.confirm(`Are you sure you want to delete "${policyName}"? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/api/policies/${policyId}`);
        setPolicies(policies.filter(p => p._id !== policyId));
        setToast({
          show: true,
          message: `Policy "${policyName}" deleted successfully`,
          type: 'success'
        });
      } catch (err) {
        setToast({
          show: true,
          message: 'Failed to delete policy',
          type: 'error'
        });
      }
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setForm({
      name: policy.name,
      department: policy.department,
      rules: { ...policy.rules }
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Policy Management
          </h1>
          <p className="text-gray-600 mt-1">
            Configure expense policies and approval rules for departments
          </p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }} 
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus size={18} /> 
          {showForm ? 'Cancel' : 'Create New Policy'}
        </Button>
      </div>

      {/* Search and Filter Bar */}
      {!showForm && policies.length > 0 && (
        <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search policies by name or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Policy Creation Form */}
      {showForm && (
        <Card className="bg-linear-to-br from-white to-blue-50 border-2 border-blue-200 shadow-xl">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                </h2>
                <p className="text-gray-600">
                  {editingPolicy ? 'Update policy settings and rules' : 'Configure a new expense policy with approval rules'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Policy Name *
                  </label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter policy name"
                    className="border-2 border-gray-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">🔧 Engineering</option>
                    <option value="Marketing">📈 Marketing</option>
                    <option value="Sales">💼 Sales</option>
                    <option value="HR">👥 Human Resources</option>
                    <option value="Finance">💰 Finance</option>
                  </select>
                </div>
              </div>

              {/* Expense Rules Section */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Expense Limits & Rules</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField 
                    label="Meal Limit (₹/day)" 
                    value={form.rules.mealLimitPerDay} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, mealLimitPerDay: val } })}
                    icon="🍽️"
                  />
                  <InputField 
                    label="Hotel Limit (₹/night)" 
                    value={form.rules.hotelLimitPerNight} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, hotelLimitPerNight: val } })}
                    icon="🏨"
                  />
                  <InputField 
                    label="Receipt Required Over (₹)" 
                    value={form.rules.requiresReceiptOver} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, requiresReceiptOver: val } })}
                    icon="📄"
                  />
                  <InputField 
                    label="Auto-Approve Limit (₹)" 
                    value={form.rules.autoApproveLimit} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, autoApproveLimit: val } })}
                    icon="✅"
                  />
                  <InputField 
                    label="Manager Approval Limit (₹)" 
                    value={form.rules.managerApprovalLimit} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, managerApprovalLimit: val } })}
                    icon="👔"
                  />
                  <InputField 
                    label="Director Approval Limit (₹)" 
                    value={form.rules.directorApprovalLimit} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, directorApprovalLimit: val } })}
                    icon="🎯"
                  />
                </div>
              </div>

              {/* Vendor & Travel Rules */}
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <Plane className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Travel & Vendor Rules</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField 
                    label="Approved Airlines (comma-separated)" 
                    value={form.rules.approvedAirlines} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, approvedAirlines: val } })}
                    icon="✈️"
                    placeholder="IndiGo, Air India, SpiceJet"
                  />
                  <InputField 
                    label="Blacklisted Vendors (comma-separated)" 
                    value={form.rules.blacklistedVendors} 
                    onChange={(val) => setForm({ ...form, rules: { ...form.rules, blacklistedVendors: val } })}
                    icon="🚫"
                    placeholder="Vendor1, Vendor2, Vendor3"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingPolicy ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {editingPolicy ? 'Update Policy' : 'Create Policy'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Existing Policies List */}
      {!showForm && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="w-6 h-6 text-indigo-600" />
              Active Policies ({filteredPolicies.length})
            </h2>
          </div>

          {filteredPolicies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <Card 
                  key={policy._id} 
                  className="group hover:shadow-xl transition-all duration-300 bg-white border-2 border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {policy.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {policy.department}
                          </span>
                        </div>
                      </div>
                      <Shield className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>

                    {/* Rules Grid */}
                    <div className="space-y-3 mb-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <p className="text-xs text-green-600 font-medium mb-1">Meal Daily</p>
                          <p className="text-sm font-bold text-green-800">₹{policy.rules.mealLimitPerDay}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                          <p className="text-xs text-purple-600 font-medium mb-1">Hotel/Night</p>
                          <p className="text-sm font-bold text-purple-800">₹{policy.rules.hotelLimitPerNight}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                          <p className="text-xs text-orange-600 font-medium mb-1">Auto Approve</p>
                          <p className="text-sm font-bold text-orange-800">≤ ₹{policy.rules.autoApproveLimit}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                          <p className="text-xs text-red-600 font-medium mb-1">Receipt Req.</p>
                          <p className="text-sm font-bold text-red-800">&gt; ₹{policy.rules.requiresReceiptOver}</p>
                        </div>
                      </div>

                      {/* Approval Hierarchy */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium mb-2">Approval Limits</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Manager:</span>
                            <span className="font-semibold">≤ ₹{policy.rules.managerApprovalLimit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Director:</span>
                            <span className="font-semibold">≤ ₹{policy.rules.directorApprovalLimit}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vendors & Airlines */}
                    {(policy.rules.approvedAirlines?.length > 0 || policy.rules.blacklistedVendors?.length > 0) && (
                      <div className="space-y-2 mb-4">
                        {policy.rules.approvedAirlines?.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium">✈️ Approved Airlines</p>
                            <p className="text-xs text-blue-800 truncate">{policy.rules.approvedAirlines.join(', ')}</p>
                          </div>
                        )}
                        {policy.rules.blacklistedVendors?.length > 0 && (
                          <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                            <p className="text-xs text-red-600 font-medium">🚫 Blacklisted</p>
                            <p className="text-xs text-red-800 truncate">{policy.rules.blacklistedVendors.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                        onClick={() => handleEdit(policy)}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(policy._id, policy.name)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterDepartment 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Create your first expense policy to get started!'}
              </p>
              {!searchTerm && !filterDepartment && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus size={18} className="mr-2" />
                  Create First Policy
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
}

// Reusable input component with modern styling
function InputField({ label, value, onChange, icon, placeholder }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-2 border-gray-200 focus:border-blue-500 bg-white"
      />
    </div>
  );
}
