'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile, setIsOpen]);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'employee':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/employee', description: 'Overview & Stats' },
          { icon: Receipt, label: 'My Expenses', href: '/employee/expenses', description: 'View submitted expenses' },
          { icon: FileText, label: 'Submit Expense', href: '/employee/submit', description: 'Add new expense' },
          { icon: AlertCircle, label: 'Policies', href: '/employee/policies', description: 'Company guidelines' },
        ];
      case 'manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/manager', description: 'Team overview' },
          { icon: CheckCircle, label: 'Approvals', href: '/manager/approvals', description: 'Pending approvals' },
          { icon: Users, label: 'Team Expenses', href: '/manager/team', description: 'Team spending' },
          { icon: BarChart3, label: 'Reports', href: '/manager/reports', description: 'Expense reports' },
          { icon: Receipt, label: 'My Expenses', href: '/manager/expenses', description: 'Personal expenses' },
        ];
      case 'finance':
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/finance', description: 'Financial overview' },
          { icon: Receipt, label: 'All Expenses', href: '/finance/expenses', description: 'Company expenses' },
          { icon: CheckCircle, label: 'Approvals', href: '/finance/approvals', description: 'Review expenses' },
          { icon: BarChart3, label: 'Analytics', href: '/finance/analytics', description: 'Spending insights' },
          { icon: Users, label: 'Vendors', href: '/finance/vendors', description: 'Vendor management' },
          { icon: TrendingUp, label: 'Budgets', href: '/finance/budgets', description: 'Budget planning' },
          { icon: Settings, label: 'Policies', href: '/finance/policies', description: 'Policy settings' },
        ];
      case 'executive':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/executive', description: 'Executive view' },
          { icon: BarChart3, label: 'Analytics', href: '/executive/analytics', description: 'Business insights' },
          { icon: TrendingUp, label: 'Trends', href: '/executive/trends', description: 'Spending trends' },
          { icon: FileText, label: 'Reports', href: '/executive/reports', description: 'Executive reports' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">ExpenseTrack</h2>
              <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        )}
        
        {/* Desktop collapse button */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center rounded-xl transition-all duration-200 relative',
                isCollapsed ? 'p-3 justify-center' : 'px-3 py-2.5 space-x-3',
                isActive
                  ? 'bg-linear-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-linear-to-b from-blue-600 to-indigo-600 rounded-r-full" />
              )}
              
              <div className={cn(
                'flex items-center justify-center rounded-lg transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700',
                isCollapsed ? 'w-6 h-6' : 'w-5 h-5 shrink-0'
              )}>
                <Icon className="w-full h-full" />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-linear-to-r from-gray-50 to-blue-50">
            <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 lg:hidden transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SidebarContent />
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] transition-all duration-300 ease-in-out hidden lg:block',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      <SidebarContent />
    </aside>
  );
}