// src/app/(frontend)/onboarding/confirm/page.tsx (Step 4: Konfirmasi & Submit)
'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';
import { useState } from 'react';

export default function OnboardingConfirmPage() {
  const router = useRouter();
  const { role, locationId, locationName, categoryIds, clear } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!role || !locationId) {
      setError('Missing data, please go back');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update user profile with onboarding data
      await apiClient.patch('/api/users/me', {
        defaultLocation: locationId,
        preferredCategories: categoryIds,
        isOnboarded: true,
        // role sudah diatur sebelumnya (default visitor, tapi jika user pilih organizer, kita update role)
        ...(role === 'organizer' ? { roleName: 'event organizer (eo)' } : {})
      });

      // Clear onboarding storage
      clear();

      // Redirect based on role
      if (role === 'organizer') {
        router.push('/dashboard');
      } else {
        router.push('/events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">Confirm your preferences</h2>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">Role:</span>
          <span>{role === 'organizer' ? 'Event Organizer' : 'Visitor'}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">Default Location:</span>
          <span>{locationName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Interests:</span>
          <span>{categoryIds.length} categories selected</span>
        </div>
      </div>
      
      {error && <div className="text-red-600 text-sm text-center mt-4">{error}</div>}
      
      <div className="flex justify-between mt-12">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Complete'}
        </button>
      </div>
    </div>
  );
}