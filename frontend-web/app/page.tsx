import Image from 'next/image';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-16">
        {/* Logo */}
        <div className="flex justify-center animate-fade-in">
          <Image
            src="/assets/logo.jpeg"
            alt="Karigar"
            width={140}
            height={140}
            className="rounded-[28px] object-cover shadow-lg"
            priority
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <h1 className="text-6xl font-light text-black tracking-tight leading-tight">
            Welcome to Karigar
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed max-w-md mx-auto">
            Connect with trusted local service providers in your neighborhood
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-6 animate-fade-in-up">
          <Link
            href="/auth"
            className="btn-primary block text-center"
          >
            Get Started
          </Link>
          <p className="text-center text-base text-gray-500 font-light">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
