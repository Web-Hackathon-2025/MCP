'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type User = {
  email: string;
  role: string;
  id: string;
  name?: string;
};

export default function CustomerDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedRequests: 0,
    favoriteProviders: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      
      // Fetch customer requests
      const requestsResponse = await fetch(`${API_URL}/customers/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        const active = requests.filter((r: any) => ['requested', 'confirmed'].includes(r.status)).length;
        const completed = requests.filter((r: any) => r.status === 'completed').length;
        
        setStats({
          activeRequests: active,
          completedRequests: completed,
          favoriteProviders: 0,
        });
        setRecentRequests(requests.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-16 lg:space-y-20 animate-fade-in">
      {/* Welcome Section - More Spacious */}
      <div className="space-y-6">
        <div>
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-black tracking-tight leading-none mb-4">
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl">
            Find trusted local service providers in your neighborhood
          </p>
        </div>
      </div>

      {/* Stats Grid - Much More Spacious */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-[32px] p-10 lg:p-12 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-50/80 to-transparent rounded-bl-full opacity-60"></div>
          <div className="relative">
            <p className="text-sm lg:text-base text-gray-500 font-light mb-6 tracking-wide uppercase">Active Requests</p>
            <p className="text-7xl lg:text-8xl font-extralight text-black mb-4 leading-none">{stats.activeRequests}</p>
            <p className="text-sm text-gray-400 font-light">In progress</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-[32px] p-10 lg:p-12 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-50/80 to-transparent rounded-bl-full opacity-60"></div>
          <div className="relative">
            <p className="text-sm lg:text-base text-gray-500 font-light mb-6 tracking-wide uppercase">Completed</p>
            <p className="text-7xl lg:text-8xl font-extralight text-black mb-4 leading-none">{stats.completedRequests}</p>
            <p className="text-sm text-gray-400 font-light">All time</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-[32px] p-10 lg:p-12 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-50/80 to-transparent rounded-bl-full opacity-60"></div>
          <div className="relative">
            <p className="text-sm lg:text-base text-gray-500 font-light mb-6 tracking-wide uppercase">Favorites</p>
            <p className="text-7xl lg:text-8xl font-extralight text-black mb-4 leading-none">{stats.favoriteProviders}</p>
            <p className="text-sm text-gray-400 font-light">Saved providers</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Much More Spacious */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-10 lg:p-14 shadow-sm">
        <h2 className="text-3xl lg:text-4xl font-light text-black mb-12 lg:mb-16 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <Link
            href="/dashboard/services"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">Browse Services</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Find service providers near you
            </p>
          </Link>

          <Link
            href="/dashboard/requests/new"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">New Request</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Request a service from providers
            </p>
          </Link>

          <Link
            href="/dashboard/requests"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">My Requests</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              View and manage your requests
            </p>
          </Link>

          <Link
            href="/dashboard/profile"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">Profile</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Update your profile information
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Requests - Much More Spacious */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-10 lg:p-14 shadow-sm">
        <div className="flex items-center justify-between mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-light text-black tracking-tight">Recent Requests</h2>
          <Link
            href="/dashboard/requests"
            className="text-base text-gray-600 font-light hover:text-black transition-colors flex items-center space-x-2 group"
          >
            <span>View all</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : recentRequests.length > 0 ? (
            recentRequests.map((request) => (
              <div
                key={request.id}
                className="group border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-gray-300 hover:shadow-xl transition-all duration-500 bg-gradient-to-r from-white to-gray-50/30 hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl lg:text-2xl font-light text-black mb-3 truncate">{request.service?.name || 'Service Request'}</h3>
                        <p className="text-base text-gray-600 font-light mb-4">{request.provider?.business_name || 'Provider'}</p>
                        <div className="flex flex-wrap items-center gap-4">
                          <p className="text-sm text-gray-500 font-light">
                            {new Date(request.requested_date || request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {request.address && (
                            <p className="text-sm text-gray-500 font-light truncate max-w-md">
                              {request.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-5 py-2.5 rounded-2xl text-sm font-light border-2 ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <Link
                      href={`/dashboard/requests/${request.id}`}
                      className="px-6 py-2.5 text-base font-light text-gray-700 hover:text-black border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 lg:py-32">
              <div className="w-24 h-24 bg-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-2xl font-light text-gray-700 mb-4">No recent requests</p>
              <p className="text-lg text-gray-500 font-light mb-10 max-w-md mx-auto leading-relaxed">Start by browsing services or creating a new request to get started</p>
              <Link
                href="/dashboard/services"
                className="inline-block px-8 py-4 bg-black text-white rounded-2xl font-light hover:bg-gray-800 transition-all duration-300 text-lg hover:scale-105"
              >
                Browse Services
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
