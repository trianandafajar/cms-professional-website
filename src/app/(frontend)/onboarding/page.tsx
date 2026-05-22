// src/app/(frontend)/onboarding/page.tsx (Step 1: Pilih Role)
'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function OnboardingRolePage() {
  const router = useRouter();
  const setRole = useOnboardingStore((state) => state.setRole);

  const handleSelectRole = (role: 'visitor' | 'organizer') => {
    setRole(role);
    router.push('/onboarding/locations');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome to Eventbrite!</h1>
      <p className="text-center text-gray-600 mb-12">Thanks for being here. What can we help you with first?</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => handleSelectRole('visitor')}
          className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition border-2 border-transparent hover:border-blue-500"
        >
          <div className="text-5xl mb-4">🎟️</div>
          <h2 className="text-xl font-semibold mb-2">Find an experience</h2>
          <p className="text-gray-600">Discover events, concerts, and things to do</p>
        </button>
        
        <button
          onClick={() => handleSelectRole('organizer')}
          className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition border-2 border-transparent hover:border-blue-500"
        >
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">Organize an event</h2>
          <p className="text-gray-600">Create, promote, and sell tickets for your events</p>
        </button>
      </div>
    </div>
  );
}