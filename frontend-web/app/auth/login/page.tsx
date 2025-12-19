'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-12">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/assets/logo.jpeg"
            alt="Karigar"
            width={100}
            height={100}
            className="rounded-[24px] object-cover shadow-lg"
            priority
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light text-black tracking-tight">
            Welcome back
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="pb-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Username"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="pb-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="pt-2">
              <p className="text-sm text-red-600 font-light">{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => router.push('/auth/forgot-password')}
              className="text-sm text-gray-600 font-light hover:text-black transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-2"
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        {/* Links */}
        <div className="space-y-4 text-center">
          <p className="text-base text-gray-500 font-light">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/email')}
              className="text-black font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
          <button
            onClick={() => router.push('/')}
            className="block w-full text-base text-gray-500 font-light hover:text-black transition-colors py-2"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

