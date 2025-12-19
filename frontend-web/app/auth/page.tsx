'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AuthChoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/logo.jpeg"
            alt="Karigar"
            width={110}
            height={110}
            className="rounded-[28px] object-cover shadow-lg"
            priority
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-light text-black tracking-tight">
            Choose how to continue
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Select your preferred sign in method
          </p>
        </div>

        {/* Auth Options */}
        <div className="space-y-4 pt-6">
          <button
            onClick={() => router.push('/auth/email')}
            className="btn-primary"
          >
            Continue with Email
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-light">OR</span>
            </div>
          </div>

          <button
            onClick={() => {
              // Google OAuth - to be implemented
              console.log('Google OAuth');
            }}
            className="btn-secondary"
          >
            Continue with Google
          </button>

          <button
            onClick={() => {
              // LinkedIn OAuth - to be implemented
              console.log('LinkedIn OAuth');
            }}
            className="btn-secondary"
          >
            Continue with LinkedIn
          </button>
        </div>

        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="w-full text-center text-base text-gray-500 font-light hover:text-black transition-colors py-2"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
