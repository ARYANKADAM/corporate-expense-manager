'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  BarChart3, 
  Shield, 
  Zap,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users based on role
      switch (user.role) {
        case 'employee':
          router.push('/employee');
          break;
        case 'manager':
          router.push('/manager');
          break;
        case 'finance':
        case 'admin':
          router.push('/finance');
          break;
        case 'executive':
          router.push('/executive');
          break;
        default:
          router.push('/employee');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full p-6 lg:p-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ExpenseFlow
              </span>
            </div>
            
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Main Hero Content */}
        <main className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
                <Zap className="w-4 h-4 mr-2" />
                Smart Expense Management Platform
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Expense Management
                </span>
                <br />
                <span className="text-gray-900">Made Simple</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform your organization's expense workflow with intelligent automation, 
                policy compliance, and powerful analytics—all in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/register"
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center w-full sm:w-auto justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Sign In
                </Link>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description: "Submit expenses in seconds"
                  },
                  {
                    icon: Shield,
                    title: "Policy Compliant",
                    description: "Automatic validation"
                  },
                  {
                    icon: BarChart3,
                    title: "Smart Analytics",
                    description: "Real-time insights"
                  },
                  {
                    icon: Users,
                    title: "Team Friendly",
                    description: "Built for collaboration"
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center">
              <p className="text-gray-500 mb-6">Trusted by 500+ companies worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-3xl font-bold text-gray-900">99%</div>
                <div className="text-3xl font-bold text-gray-900">60%</div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-3xl font-bold text-gray-900">4.9★</div>
              </div>
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 mt-2">
                <span>Accuracy</span>
                <span>Time Saved</span>
                <span>Companies</span>
                <span>Rating</span>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile CTA */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Link
              href="/login"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}