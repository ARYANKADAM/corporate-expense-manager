import VendorList from '@/components/vendors/VendorList';

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600 mt-1">
          Analyze spending patterns and vendor relationships
        </p>
      </div>

      <VendorList />
    </div>
  );
}