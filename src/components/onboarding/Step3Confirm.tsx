// src/components/onboarding/Step3Confirm.tsx
'use client';

import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step3Confirm({ onPrev, onComplete, loading }: { onPrev: () => void; onComplete: () => void; loading: boolean }) {
  const { role, locationName, categoryIds } = useOnboardingStore();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Confirm your preferences</h3>
      <div className="space-y-3 mb-6">
        <p><span className="font-medium">Role:</span> {role === 'visitor' ? 'Visitor (Find events)' : 'Event Organizer'}</p>
        <p><span className="font-medium">Location:</span> {locationName || 'Not set'}</p>
        <p><span className="font-medium">Categories selected:</span> {categoryIds.length} categories</p>
      </div>
      <div className="flex justify-between">
        <button onClick={onPrev} className="px-4 py-2 border rounded-md hover:bg-gray-50">Previous</button>
        <button
          onClick={onComplete}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}