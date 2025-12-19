'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';

type Step = 'email' | 'details';

export default function EmailAuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // For MVP: Simulate email verification
      // In production, this would send OTP to email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep('details');
    } catch (err) {
      setError('Failed to send verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (formData: {
    name: string;
    password: string;
    role: 'customer' | 'service_provider';
  }) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.register({
        email,
        password: formData.password,
        role: formData.role,
        name: formData.name,
      });

      console.log('Registration response:', response);

      if (response && response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        // Redirect to home page after successful registration
        router.push('/');
      } else {
        setError('Registration successful but no token received. Please try logging in.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please check your connection and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid input. Please check your information.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <Image
            src="/assets/logo.jpeg"
            alt="Karigar"
            width={100}
            height={100}
            className="rounded-[24px] object-cover shadow-lg"
            priority
          />
        </div>

        <div className="space-y-8">
          {step === 'email' ? (
            <>
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-light text-black tracking-tight">
                  Enter your email
                </h1>
                <p className="text-lg text-gray-600 font-light">
                  We'll send a verification code to this address
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6 pt-4">
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
                  {error && <p className="mt-4 text-sm text-red-600 font-light">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Sending...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <RegistrationForm
              email={email}
              onRegister={handleRegister}
              onBack={() => setStep('email')}
              isLoading={isLoading}
              error={error}
            />
          )}

          {step === 'email' && (
            <button
              onClick={() => router.push('/auth')}
              className="w-full text-center text-base text-gray-500 font-light hover:text-black transition-colors py-3"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RegistrationForm({
  email,
  onRegister,
  onBack,
  isLoading,
  error,
}: {
  email: string;
  onRegister: (data: {
    name: string;
    password: string;
    role: 'customer' | 'service_provider';
  }) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'service_provider',
  });
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || formData.name.length < 2) {
      setFormError('Please enter your name');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    onRegister({
      name: formData.name,
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-light text-black tracking-tight">
          Create your account
        </h1>
        <p className="text-lg text-gray-600 font-light">
          {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="pb-1">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full name"
            required
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="pb-1">
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="pb-1">
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Confirm password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4 pt-6">
          <p className="text-lg text-gray-700 font-light">I am a</p>
          <div className="space-y-4">
            <label className="flex items-center p-6 border border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === 'customer'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'customer' | 'service_provider',
                  })
                }
                className="mr-4 w-5 h-5 text-black focus:ring-black"
                disabled={isLoading}
              />
              <span className="text-black font-light text-lg">Customer</span>
            </label>
            <label className="flex items-center p-6 border border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all">
              <input
                type="radio"
                name="role"
                value="service_provider"
                checked={formData.role === 'service_provider'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'customer' | 'service_provider',
                  })
                }
                className="mr-4 w-5 h-5 text-black focus:ring-black"
                disabled={isLoading}
              />
              <span className="text-black font-light text-lg">Service Provider</span>
            </label>
          </div>
        </div>

        {(formError || error) && (
          <div className="pt-2">
            <p className="text-sm text-red-600 font-light">{formError || error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary mt-2"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="w-full text-center text-base text-gray-500 font-light hover:text-black transition-colors py-3 mt-4"
      >
        Back
      </button>
    </div>
  );
}

