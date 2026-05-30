// src/components/onboarding/Step1Role.tsx
'use client';

import { useOnboardingStore } from '@/stores/onboardingStore';

interface Step1RoleProps {
  onNext: () => void;
}

export default function Step1Role({ onNext }: Step1RoleProps) {
  const { role, setRole } = useOnboardingStore();

  const handleSelect = (selectedRole: 'visitor' | 'organizer') => {
    setRole(selectedRole);
    onNext();
  };

  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Eventbrite!</h2>
      <p className="text-gray-600 mb-8">Thanks for being here. What can we help you with first?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleSelect('visitor')}
          className="flex flex-col items-center p-6 border rounded-lg hover:border-blue-500 hover:shadow transition"
        >
          <span className="text-4xl mb-3">🎟️</span>
          <span className="font-medium">Find an experience</span>
          <span className="text-sm text-gray-500">Discover events near you</span>
        </button>
        <button
          onClick={() => handleSelect('organizer')}
          className="flex flex-col items-center p-6 border rounded-lg hover:border-blue-500 hover:shadow transition"
        >
          <span className="text-4xl mb-3">📅</span>
          <span className="font-medium">Organize an event</span>
          <span className="text-sm text-gray-500">Create and manage events</span>
        </button>
        <button
          onClick={() => handleSelect('visitor')}
          className="flex flex-col items-center p-6 border rounded-lg hover:border-blue-500 hover:shadow transition"
        >
          <span className="text-4xl mb-3">🔍</span>
          <span className="font-medium">Find my tickets</span>
          <span className="text-sm text-gray-500">Access your tickets</span>
        </button>
      </div>
    </div>
  );
}
