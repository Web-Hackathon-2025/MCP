'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch user data
    // For now, just show a welcome message
    setUser({ email: 'user@example.com' });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex justify-center mb-12">
          <Image
            src="/assets/logo.jpeg"
            alt="Karigar"
            width={100}
            height={100}
            className="rounded-3xl object-cover"
          />
        </div>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-light text-black">
            Welcome to Karigar
          </h1>
          <p className="text-gray-600 font-light">
            Your account has been created successfully
          </p>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-light text-black mb-4">
              Account Information
            </h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Your account is ready. You can now start using Karigar to connect
              with local service providers.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors text-black font-light"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

