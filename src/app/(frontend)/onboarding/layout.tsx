// src/app/(frontend)/onboarding/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const steps = [
  { path: '/onboarding', label: 'Choose Role', step: 1 },
  { path: '/onboarding/locations', label: 'Location', step: 2 },
  { path: '/onboarding/tags', label: 'Interests', step: 3 },
  { path: '/onboarding/confirm', label: 'Confirm', step: 4 },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = steps.find(step => step.path === pathname)?.step || 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header dengan progress bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-2xl font-bold text-gray-900">eventbrite</Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">Exit</Link>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div style={{ width: `${(currentStep / steps.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}