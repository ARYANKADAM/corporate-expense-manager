'use client';

import { useState } from 'react';
import axios from 'axios';
import Button from '@/components/ui/Button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportButton({ filters = {} }) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportCSV = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({ ...filters, format: 'csv' });
      
      const response = await axios.get(`/api/expenses/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowMenu(false);
    } catch (error) {
      console.error('Export CSV error:', error);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({ ...filters, format: 'json' });
      
      const response = await axios.get(`/api/expenses/export?${params.toString()}`);

      if (response.data.success) {
        const expenses = response.data.expenses;

        // Create PDF
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Expense Report', 14, 22);
        
        // Add date
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Add table
        doc.autoTable({
          startY: 35,
          head: [['Date', 'Employee', 'Category', 'Vendor', 'Amount', 'Status']],
          body: expenses.map((exp) => [
            exp.date,
            exp.employee,
            exp.category,
            exp.vendor,
            `$${exp.amount}`,
            exp.status,
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] },
        });

        // Save PDF
        doc.save(`expenses-${Date.now()}.pdf`);

        setShowMenu(false);
      }
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
      >
        <Download className="w-4 h-4 mr-2" />
        {exporting ? 'Exporting...' : 'Export'}
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={exportCSV}
            disabled={exporting}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 rounded-t-lg"
          >
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-sm">Export CSV</div>
              <div className="text-xs text-gray-500">Excel compatible</div>RetryAD</div>
          </button>
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 rounded-b-lg border-t border-gray-200"
          >
            <FileText className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-sm">Export PDF</div>
              <div className="text-xs text-gray-500">Print ready</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}