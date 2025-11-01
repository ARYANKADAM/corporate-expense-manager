'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import  Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function FinancePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
      const res = await axios.get('/api/policies');
      setPolicies(res.data);
    } catch (err) {
      console.error('Error fetching policies:', err);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert comma-separated strings to arrays
      const policyData = {
        ...form,
        rules: {
          ...form.rules,
          approvedAirlines: form.rules.approvedAirlines.split(',').map(a => a.trim()),
          blacklistedVendors: form.rules.blacklistedVendors.split(',').map(v => v.trim()),
        },
      };

      await axios.post('/api/policies', policyData);
      setShowForm(false);
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
      fetchPolicies();
    } catch (err) {
      console.error('Error creating policy:', err);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Finance Policies</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add Policy'}
        </Button>
      </div>

      {/* Policy Creation Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl p-6 mb-10 border space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Policy Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Department</label>
              <Input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              />
            </div>
          </div>

          <h2 className="text-md font-semibold mt-4">Expense Rules</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputField label="Meal Limit (₹/day)" value={form.rules.mealLimitPerDay} onChange={(val) => setForm({ ...form, rules: { ...form.rules, mealLimitPerDay: val } })} />
            <InputField label="Hotel Limit (₹/night)" value={form.rules.hotelLimitPerNight} onChange={(val) => setForm({ ...form, rules: { ...form.rules, hotelLimitPerNight: val } })} />
            <InputField label="Receipt Required Over (₹)" value={form.rules.requiresReceiptOver} onChange={(val) => setForm({ ...form, rules: { ...form.rules, requiresReceiptOver: val } })} />
            <InputField label="Auto-Approve Limit (₹)" value={form.rules.autoApproveLimit} onChange={(val) => setForm({ ...form, rules: { ...form.rules, autoApproveLimit: val } })} />
            <InputField label="Manager Approval Limit (₹)" value={form.rules.managerApprovalLimit} onChange={(val) => setForm({ ...form, rules: { ...form.rules, managerApprovalLimit: val } })} />
            <InputField label="Director Approval Limit (₹)" value={form.rules.directorApprovalLimit} onChange={(val) => setForm({ ...form, rules: { ...form.rules, directorApprovalLimit: val } })} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <InputField label="Approved Airlines (comma-separated)" value={form.rules.approvedAirlines} onChange={(val) => setForm({ ...form, rules: { ...form.rules, approvedAirlines: val } })} />
            <InputField label="Blacklisted Vendors (comma-separated)" value={form.rules.blacklistedVendors} onChange={(val) => setForm({ ...form, rules: { ...form.rules, blacklistedVendors: val } })} />
          </div>

          <Button type="submit" className="mt-4">Save Policy</Button>
        </form>
      )}

      {/* Existing Policies List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <Card key={policy._id} className="p-6 bg-white shadow-md border">
            <h2 className="text-lg font-semibold">{policy.name}</h2>
            <p className="text-gray-600 text-sm mb-2">{policy.department}</p>

            <div className="space-y-1 text-sm text-gray-700">
              <p>Meal Limit: ₹{policy.rules.mealLimitPerDay}</p>
              <p>Hotel Limit: ₹{policy.rules.hotelLimitPerNight}</p>
              <p>Receipt Over: ₹{policy.rules.requiresReceiptOver}</p>
              <p>Auto Approve ≤ ₹{policy.rules.autoApproveLimit}</p>
              <p>Manager Approval ≤ ₹{policy.rules.managerApprovalLimit}</p>
              <p>Director Approval ≤ ₹{policy.rules.directorApprovalLimit}</p>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              <p><strong>Airlines:</strong> {policy.rules.approvedAirlines.join(', ') || 'None'}</p>
              <p><strong>Blacklisted:</strong> {policy.rules.blacklistedVendors.join(', ') || 'None'}</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm"><Edit size={16} /></Button>
              <Button variant="destructive" size="sm"><Trash2 size={16} /></Button>
            </div>
          </Card>
        ))}
      </div>

      {policies.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No policies found. Create one to get started!</p>
      )}
    </div>
  );
}

// Reusable input component
function InputField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
