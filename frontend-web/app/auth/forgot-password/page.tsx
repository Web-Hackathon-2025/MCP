'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-12 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/assets/logo.jpeg"
              alt="Karigar"
              width={100}
              height={100}
              className="rounded-[24px] object-cover shadow-lg"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-light text-black tracking-tight">
              Check your email
            </h1>
            <p className="text-base text-gray-600 font-light leading-relaxed">
              If an account exists with {email}, we've sent password reset
              instructions.
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="btn-primary"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-12">
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/logo.jpeg"
            alt="Karigar"
            width={100}
            height={100}
            className="rounded-[24px] object-cover shadow-lg"
            priority
          />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light text-black tracking-tight">
            Reset password
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="pb-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              disabled={isLoading}
              autoFocus
            />
            {error && <div className="pt-2"><p className="text-sm text-red-600 font-light">{error}</p></div>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-2"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full text-center text-base text-gray-500 font-light hover:text-black transition-colors py-2"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

