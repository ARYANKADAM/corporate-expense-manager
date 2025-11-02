'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExecutiveReportsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    reportType: 'comprehensive',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: 'all',
    format: 'pdf'
  });

  useEffect(() => {
    fetchReportData();
  }, [filters.startDate, filters.endDate, filters.department]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await apiClient.get(`/api/analytics/dashboard?${params.toString()}`);
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Report data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Report',
      description: 'Complete overview of all expenses, trends, and analytics',
      icon: FileText,
      color: 'blue',
      includes: ['Executive Summary', 'Spending Trends', 'Category Breakdown', 'Department Analysis', 'Policy Compliance', 'Recommendations']
    },
    {
      id: 'financial',
      title: 'Financial Summary',
      description: 'Focus on financial metrics, budgets, and cost analysis',
      icon: DollarSign,
      color: 'green',
      includes: ['Total Spending', 'Budget vs Actual', 'Cost Trends', 'ROI Analysis', 'Forecast']
    },
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Policy violations, approvals, and audit trail',
      icon: CheckCircle,
      color: 'purple',
      includes: ['Policy Violations', 'Approval Status', 'Audit Trail', 'Risk Assessment']
    },
    {
      id: 'departmental',
      title: 'Department Analysis',
      description: 'Breakdown by department with comparative analysis',
      icon: Building,
      color: 'orange',
      includes: ['Department Spending', 'Team Performance', 'Budget Utilization', 'Comparisons']
    }
  ];

  const generatePDFReport = async () => {
    try {
      setGenerating(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      // Helper function to add new page if needed
      const checkAddPage = (neededSpace = 20) => {
        if (yPos + neededSpace > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          return true;
        }
        return false;
      };

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Executive Expense Report', pageWidth / 2, 25, { align: 'center' });
      yPos = 50;

      // Report Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
      yPos += 6;
      doc.text(`Period: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`, 14, yPos);
      yPos += 6;
      doc.text(`Report Type: ${reportTypes.find(r => r.id === filters.reportType)?.title}`, 14, yPos);
      yPos += 15;

      // Executive Summary
      checkAddPage(60);
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Executive Summary', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Expenses', `${analytics?.total.expenses || 0} transactions`],
        ['Total Amount', formatCurrency(analytics?.total.amount || 0)],
        ['Average per Expense', formatCurrency((analytics?.total.amount || 0) / (analytics?.total.expenses || 1))],
        ['Current Month', formatCurrency(analytics?.currentMonth.amount || 0)],
        ['Policy Violations', `${analytics?.violations || 0} flagged`],
        ['Approval Rate', `${((analytics?.statusBreakdown?.find(s => s._id === 'approved')?.count || 0) / (analytics?.total.expenses || 1) * 100).toFixed(1)}%`]
      ];

      // USE autoTable FUNCTION DIRECTLY
      autoTable(doc, {
        startY: yPos,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 15;

      // Category Breakdown
      checkAddPage(60);
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Spending by Category', 14, yPos);
      yPos += 10;

      const categoryData = [
        ['Category', 'Amount', 'Count', 'Percentage']
      ];

      const totalAmount = analytics?.total.amount || 0;
      analytics?.categoryBreakdown?.forEach(cat => {
        categoryData.push([
          cat._id,
          formatCurrency(cat.amount),
          cat.count.toString(),
          `${((cat.amount / totalAmount) * 100).toFixed(1)}%`
        ]);
      });

      autoTable(doc, {
        startY: yPos,
        head: [categoryData[0]],
        body: categoryData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 15;

      // Monthly Trend
      checkAddPage(60);
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Monthly Spending Trend', 14, yPos);
      yPos += 10;

      const trendData = [
        ['Month', 'Amount', 'Transactions']
      ];

      analytics?.monthlyTrend?.forEach(trend => {
        trendData.push([
          `${trend._id.month}/${trend._id.year}`,
          formatCurrency(trend.amount),
          trend.count.toString()
        ]);
      });

      autoTable(doc, {
        startY: yPos,
        head: [trendData[0]],
        body: trendData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 15;

      // Status Distribution
      checkAddPage(60);
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Expense Status', 14, yPos);
      yPos += 10;

      const statusData = [
        ['Status', 'Count', 'Amount']
      ];

      analytics?.statusBreakdown?.forEach(status => {
        statusData.push([
          status._id.toUpperCase(),
          status.count.toString(),
          formatCurrency(status.amount)
        ]);
      });

      autoTable(doc, {
        startY: yPos,
        head: [statusData[0]],
        body: statusData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 15;

      // Key Insights
      checkAddPage(80);
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text('Key Insights & Recommendations', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const insights = [
        `Total company spending: ${formatCurrency(analytics?.total.amount || 0)} across ${analytics?.total.expenses || 0} transactions`,
        `Average expense: ${formatCurrency((analytics?.total.amount || 0) / (analytics?.total.expenses || 1))}`,
        `Top category: ${analytics?.categoryBreakdown?.[0]?._id || 'N/A'} (${((analytics?.categoryBreakdown?.[0]?.amount || 0) / (analytics?.total.amount || 1) * 100).toFixed(1)}%)`,
        `Policy compliance: ${100 - ((analytics?.violations || 0) / (analytics?.total.expenses || 1) * 100).toFixed(1)}%`,
        `Pending approvals: ${analytics?.statusBreakdown?.find(s => s._id === 'pending')?.count || 0}`,
      ];

      insights.forEach(insight => {
        checkAddPage(10);
        doc.text(`• ${insight}`, 14, yPos);
        yPos += 8;
      });

      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text('Recommendations:', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const recommendations = [
        `Review spending in ${analytics?.categoryBreakdown?.[0]?._id || 'top'} category for optimization opportunities`,
        `Address ${analytics?.violations || 0} policy violations to improve compliance`,
        `Consider budget adjustments based on current spending trends`,
        `Monitor pending approvals to maintain workflow efficiency`
      ];

      recommendations.forEach(rec => {
        checkAddPage(10);
        doc.text(`• ${rec}`, 14, yPos);
        yPos += 8;
      });

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'Confidential - For Internal Use Only',
          pageWidth - 14,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Save
      const filename = `executive-report-${filters.startDate}-to-${filters.endDate}.pdf`;
      doc.save(filename);
      
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Generate PDF error:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generateCSVReport = async () => {
    try {
      setGenerating(true);
      
      let csv = 'Executive Expense Report\n\n';
      csv += `Generated: ${new Date().toLocaleString()}\n`;
      csv += `Period: ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}\n\n`;

      // Summary
      csv += 'EXECUTIVE SUMMARY\n';
      csv += 'Metric,Value\n';
      csv += `Total Expenses,${analytics?.total.expenses || 0}\n`;
      csv += `Total Amount,${analytics?.total.amount || 0}\n`;
      csv += `Average per Expense,${(analytics?.total.amount || 0) / (analytics?.total.expenses || 1)}\n`;
      csv += `Current Month,${analytics?.currentMonth.amount || 0}\n`;
      csv += `Policy Violations,${analytics?.violations || 0}\n\n`;

      // Category Breakdown
      csv += 'CATEGORY BREAKDOWN\n';
      csv += 'Category,Amount,Count,Percentage\n';
      const totalAmount = analytics?.total.amount || 0;
      analytics?.categoryBreakdown?.forEach(cat => {
        csv += `${cat._id},${cat.amount},${cat.count},${((cat.amount / totalAmount) * 100).toFixed(1)}%\n`;
      });
      csv += '\n';

      // Monthly Trend
      csv += 'MONTHLY TREND\n';
      csv += 'Month,Amount,Count\n';
      analytics?.monthlyTrend?.forEach(trend => {
        csv += `${trend._id.month}/${trend._id.year},${trend.amount},${trend.count}\n`;
      });
      csv += '\n';

      // Status
      csv += 'STATUS BREAKDOWN\n';
      csv += 'Status,Count,Amount\n';
      analytics?.statusBreakdown?.forEach(status => {
        csv += `${status._id},${status.count},${status.amount}\n`;
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executive-report-${filters.startDate}-to-${filters.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      alert('CSV report generated successfully!');
    } catch (error) {
      console.error('Generate CSV error:', error);
      alert('Failed to generate CSV');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (filters.format === 'pdf') {
      generatePDFReport();
    } else {
      generateCSVReport();
    }
  };

  const quickReports = [
    {
      title: 'This Month',
      period: 'Current month to date',
      action: () => {
        setFilters({
          ...filters,
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });
      },
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Last Month',
      period: 'Previous complete month',
      action: () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        setFilters({
          ...filters,
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0]
        });
      },
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Quarter',
      period: 'Last 3 months',
      action: () => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        setFilters({
          ...filters,
          startDate: threeMonthsAgo.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });
      },
      icon: BarChart3,
      color: 'purple'
    },
    {
      title: 'Year to Date',
      period: 'Since January 1st',
      action: () => {
        setFilters({
          ...filters,
          startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });
      },
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Reports</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive expense reports and analytics</p>
      </div>

      {/* Quick Report Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={report.action}>
              <div className="flex items-center gap-3">
                <div className={`bg-${report.color}-100 p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.period}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Report</h3>
        
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => setFilters({ ...filters, reportType: type.id })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      filters.reportType === type.id
                        ? `border-${type.color}-600 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 text-${type.color}-600`} />
                      <h4 className="font-semibold text-gray-900">{type.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{type.description}</p>
                    <div className="text-xs text-gray-500">
                      <p className="font-medium mb-1">Includes:</p>
                      <ul className="space-y-0.5">
                        {type.includes.slice(0, 3).map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                        {type.includes.length > 3 && <li>• +{type.includes.length - 3} more</li>}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Document</option>
                <option value="csv">CSV Spreadsheet</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={generating}
              className="flex-"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-4 h-5 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={fetchReportData}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Preview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
        
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{analytics?.total.expenses || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(analytics?.total.amount || 0)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Average Expense</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatCurrency((analytics?.total.amount || 0) / (analytics?.total.expenses || 1))}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Policy Violations</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{analytics?.violations || 0}</p>
            </div>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Top Spending Categories</h4>
            <div className="space-y-2">
              {analytics?.categoryBreakdown?.slice(0, 5).map((cat, idx) => (
                <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium">#{idx + 1}</span>
                    <span className="text-gray-900">{cat._id}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(cat.amount)}</p>
                    <p className="text-xs text-gray-500">{cat.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Expense Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analytics?.statusBreakdown?.map((status) => (
                <div key={status._id} className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 capitalize mb-1">{status._id}</p>
                  <p className="text-xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(status.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Scheduled Reports (Future Feature) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
            <p className="text-sm text-gray-500 mt-1">Automated report delivery (Coming Soon)</p>
          </div>
          <Button variant="outline" disabled>
            <Mail className="w-4 h-4 mr-2" />
            Setup Schedule
          </Button>
        </div>
        
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Schedule weekly or monthly reports</p>
          <p className="text-sm text-gray-500">Reports will be automatically generated and emailed to you</p>
        </div>
      </Card>
    </div>
  );
}