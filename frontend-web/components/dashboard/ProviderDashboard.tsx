'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type User = {
  email: string;
  role: string;
  id: string;
  name?: string;
};

export default function ProviderDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeRequests: 0,
    completedRequests: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      
      const servicesResponse = await fetch(`${API_URL}/providers/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const requestsResponse = await fetch(`${API_URL}/providers/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (servicesResponse.ok) {
        const services = await servicesResponse.json();
        setStats(prev => ({ ...prev, totalServices: services.length || 0 }));
      }

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        const active = requests.filter((r: any) => ['requested', 'confirmed'].includes(r.status)).length;
        const completed = requests.filter((r: any) => r.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          activeRequests: active,
          completedRequests: completed,
        }));
        setPendingRequests(requests.filter((r: any) => r.status === 'requested').slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 lg:space-y-20 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-black tracking-tight leading-none mb-4">
            Provider Dashboard
          </h1>
          <p className="text-xl lg:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl">
            Manage your services and requests
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-[32px] p-10 lg:p-12 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50/80 to-transparent rounded-bl-full opacity-60"></div>
          <div className="relative">
            <p className="text-sm lg:text-base text-gray-500 font-light mb-6 tracking-wide uppercase">Total Services</p>
            <p className="text-7xl lg:text-8xl font-extralight text-black mb-4 leading-none">{stats.totalServices}</p>
            <p className="text-sm text-gray-400 font-light">Active listings</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-[32px] p-10 lg:p-12 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-50/80 to-transparent rounded-bl-full opacity-60"></div>
          <div className="relative">
            <p className="text-sm lg:text-base text-gray-500 font-light mb-6 tracking-wide uppercase">Active Requests</p>
            <p className="text-7xl lg:text-8xl font-extralight text-black mb-4 leading-none">{stats.activeRequests}</p>
            <p className="text-sm text-gray-400 font-light">Pending action</p>
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
            <p className="text-sm lg:text-base text-gray-500 font-light mb-6 tracking-wide uppercase">Rating</p>
            <div className="flex items-baseline space-x-3 mb-4">
              <p className="text-7xl lg:text-8xl font-extralight text-black leading-none">{stats.averageRating || '0.0'}</p>
              {stats.averageRating > 0 && (
                <svg className="w-8 h-8 text-yellow-500 mt-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-400 font-light">{stats.totalReviews} reviews</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-10 lg:p-14 shadow-sm">
        <h2 className="text-3xl lg:text-4xl font-light text-black mb-12 lg:mb-16 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <Link
            href="/dashboard/services/manage"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">Manage Services</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Add, edit, or remove your services
            </p>
          </Link>

          <Link
            href="/dashboard/requests"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">View Requests</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Manage incoming service requests
            </p>
          </Link>

          <Link
            href="/dashboard/availability"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">Set Availability</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Manage your working hours
            </p>
          </Link>

          <Link
            href="/dashboard/profile"
            className="group relative overflow-hidden border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-black hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-16 h-16 bg-gray-100 rounded-2xl group-hover:bg-black transition-all duration-500 flex items-center justify-center group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-light text-black mb-4 group-hover:translate-x-2 transition-transform duration-500">Business Profile</h3>
            <p className="text-base text-gray-500 font-light leading-relaxed pr-8">
              Update your business information
            </p>
          </Link>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-10 lg:p-14 shadow-sm">
        <div className="flex items-center justify-between mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-light text-black tracking-tight">Pending Requests</h2>
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
          ) : pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="group border-2 border-gray-200 rounded-[24px] p-8 lg:p-10 hover:border-gray-300 hover:shadow-xl transition-all duration-500 bg-gradient-to-r from-white to-gray-50/30 hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl lg:text-2xl font-light text-black mb-3">{request.service?.name || 'Service Request'}</h3>
                        <p className="text-base text-gray-600 font-light mb-4">{request.customer?.user?.email || 'Customer'}</p>
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
                              📍 {request.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="px-6 py-3 bg-black text-white rounded-2xl text-base font-light hover:bg-gray-800 transition-all duration-300 hover:scale-105">
                      Accept
                    </button>
                    <button className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-2xl text-base font-light hover:bg-gray-50 transition-all duration-300">
                      Decline
                    </button>
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
              <p className="text-2xl font-light text-gray-700 mb-4">No pending requests</p>
              <p className="text-lg text-gray-500 font-light max-w-md mx-auto leading-relaxed">New requests will appear here when customers request your services</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
