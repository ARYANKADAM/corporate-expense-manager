'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Skeleton from '@/components/ui/Skeleton';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <div className="animate-pulse">
          {/* Navbar skeleton */}
          <div className="h-16 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center space-x-3">
                <Skeleton variant="rectangle" width="40px" height="40px" />
                <div>
                  <Skeleton width="150px" height="20px" />
                  <Skeleton width="120px" height="14px" className="mt-1" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton variant="circle" width="40px" height="40px" />
                <Skeleton width="80px" height="36px" />
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar skeleton */}
            <div className="hidden lg:block w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
              <div className="p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-xl">
                    <Skeleton variant="rectangle" width="20px" height="20px" />
                    <div className="flex-1">
                      <Skeleton width="120px" height="16px" />
                      <Skeleton width="80px" height="12px" className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton.Card key={i} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton variant="card" height="300px" />
                <Skeleton variant="card" height="300px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30">
      <Navbar 
        onMenuClick={() => setSidebarOpen(true)}
        isMobile={isMobile}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        
        <main className="flex-1 min-h-[calc(100vh-64px)] w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
            <div className="animate-[fadeInUp_0.5s_ease-out]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
