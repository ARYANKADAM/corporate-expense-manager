'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  CheckCircle,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'employee':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/employee' },
          { icon: Receipt, label: 'My Expenses', href: '/employee/expenses' },
          { icon: FileText, label: 'Submit Expense', href: '/employee/submit' },
          { icon: AlertCircle, label: 'Policy Guidelines', href: '/employee/policies' },
        ];
      case 'manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/manager' },
          { icon: CheckCircle, label: 'Approvals', href: '/manager/approvals' },
          { icon: Users, label: 'Team Expenses', href: '/manager/team' },
          { icon: BarChart3, label: 'Reports', href: '/manager/reports' },
          { icon: Receipt, label: 'My Expenses', href: '/manager/expenses' },
        ];
      case 'finance':
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/finance' },
          { icon: Receipt, label: 'All Expenses', href: '/finance/expenses' },
          { icon: CheckCircle, label: 'Approvals', href: '/finance/approvals' },
          { icon: BarChart3, label: 'Analytics', href: '/finance/analytics' },
          { icon: Users, label: 'Vendors', href: '/finance/vendors' },
          { icon: TrendingUp, label: 'Budgets', href: '/finance/budgets' },
          { icon: Settings, label: 'Policies', href: '/finance/policies' },
        ];
      case 'executive':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/executive' },
          { icon: BarChart3, label: 'Analytics', href: '/executive/analytics' },
          { icon: TrendingUp, label: 'Trends', href: '/executive/trends' },
          { icon: FileText, label: 'Reports', href: '/executive/reports' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}