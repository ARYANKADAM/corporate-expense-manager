'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'employee',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState(null);
  const [emailValidated, setEmailValidated] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);

  const departments = [
    'Sales',
    'Marketing',
    'Engineering',
    'Finance',
    'HR',
    'Operations',
    'Customer Support',
    'Product',
    'Legal',
  ];

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'finance', label: 'Finance' },
    { value: 'executive', label: 'Executive' },
  ];

  const validateCompanyDomain = async (email) => {
    if (!email || !email.includes('@')) return;
    
    setValidatingEmail(true);
    try {
      const response = await axios.post('/api/companies/validate', { email });
      
      if (response.data.success) {
        setCompany(response.data.company);
        setEmailValidated(true);
        setError('');
        
        // Show success message if it's a new company
        if (response.data.isNewCompany) {
          console.log('✅ Demo company created:', response.data.message);
        }
      } else {
        setCompany(null);
        setEmailValidated(false);
        
        // Show different messages based on email type
        if (response.data.isPersonalEmail) {
          setError(`${response.data.message} Would you like to create a demo company for testing?`);
        } else {
          setError(response.data.message);
        }
      }
    } catch (err) {
      setCompany(null);
      setEmailValidated(false);
      setError('Failed to validate company domain');
    } finally {
      setValidatingEmail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    
    // Validate company domain when email is entered
    if (name === 'email' && value.includes('@')) {
      validateCompanyDomain(value);
    } else if (name === 'email') {
      setEmailValidated(false);
      setCompany(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!emailValidated || !company) {
      setError('Please enter a valid company email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: formData.role,
        companyId: company.id,
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Account created successfully!</p>
            <p className="text-sm">Redirecting you to the login page...</p>
          </div>
        </div>
      )}

      <div>
        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="john.doe@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validatingEmail && (
          <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Validating company...
          </div>
        )}
        {emailValidated && company && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">Company verified!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Registering for: <strong>{company.name}</strong> ({company.domain})
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Minimum 6 characters"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading || success}
      >
        {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
      </Button>
    </form>
  );
}