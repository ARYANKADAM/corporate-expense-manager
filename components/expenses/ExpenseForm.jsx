'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { AlertCircle, Upload, CheckCircle, X, FileText } from 'lucide-react';

export default function ExpenseForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    subcategory: '',
    vendor: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Meals',
    'Travel',
    'Office Supplies',
    'Entertainment',
    'Accommodation',
    'Transportation',
    'Other',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Only JPG, PNG, and PDF allowed');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setError('File too large. Maximum size is 5MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const uploadFile = async () => {
    if (!file) return null;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.file.url;
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'File upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Upload file first if present
      let receiptUrl = formData.receiptUrl;
      if (file) {
        receiptUrl = await uploadFile();
        if (!receiptUrl) {
          setLoading(false);
          return;
        }
      }

      const response = await axios.post('/api/expenses', {
        ...formData,
        receiptUrl,
      });

      if (response.data.success) {
        setSuccess('Expense submitted successfully!');
        
        // Reset form
        setFormData({
          amount: '',
          category: '',
          subcategory: '',
          vendor: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          receiptUrl: '',
        });
        setFile(null);
        setFilePreview(null);

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/employee/expenses');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Expense</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Amount ($)"
              type="number"
              name="amount"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
<option value="">Select Category</option>
{categories.map((cat) => (
<option key={cat} value={cat}>
{cat}
</option>
))}
</select>
</div>
      <div>
        <Input
          label="Vendor"
          type="text"
          name="vendor"
          placeholder="e.g., Starbucks, Delta Airlines"
          value={formData.vendor}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
    </div>

    <div>
      <Input
        label="Subcategory (Optional)"
        type="text"
        name="subcategory"
        placeholder="e.g., Client Meeting, Conference"
        value={formData.subcategory}
        onChange={handleChange}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Description *
      </label>
      <textarea
        name="description"
        rows="4"
        placeholder="Provide details about this expense..."
        value={formData.description}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* File Upload Section */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Receipt Upload {formData.amount > 25 && <span className="text-red-500">*</span>}
      </label>
      
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload receipt
            </span>
            <span className="text-xs text-gray-500 mt-1">
              JPG, PNG, or PDF (max 5MB)
            </span>
          </label>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Receipt preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {formData.amount > 25 && !file && (
        <p className="text-xs text-orange-600 mt-1">
          Receipt required for expenses over $25
        </p>
      )}
    </div>

    <div className="flex gap-4">
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading || uploading}
        className="flex-1"
      >
        {uploading
          ? 'Uploading...'
          : loading
          ? 'Submitting...'
          : 'Submit Expense'}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => router.push('/employee/expenses')}
      >
        Cancel
      </Button>
    </div>
  </form>
</Card>
);
}
