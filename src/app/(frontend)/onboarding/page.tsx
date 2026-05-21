// src/app/(frontend)/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';
import Step1Role from '@/components/onboarding/Step1Role';
import Step2Preferences from '@/components/onboarding/Step2Preferences';
import Step3Confirm from '@/components/onboarding/Step3Confirm';

export default function OnboardingPage() {
  const { user } = useAuthStore();
  const { step, setStep, reset } = useOnboardingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Cek jika user sudah onboarded, redirect langsung ke /events atau /dashboard
  useEffect(() => {
    if (user?.isOnboarded) {
      if (user.roleName === 'admin' || user.roleName === 'event organizer') {
        router.replace('/dashboard');
      } else {
        router.replace('/events');
      }
    }
  }, [user, router]);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { locationId, categoryIds, role } = useOnboardingStore.getState();
      // Update user dengan data onboarding
      await apiClient.patch(`/api/users/${user.id}`, {
        defaultLocation: locationId,
        preferredCategories: categoryIds,
        isOnboarded: true,
        // Jika role yang dipilih berbeda dari yang sekarang (misal visitor upgrade ke EO)
        // Perhatikan: role diubah hanya jika user memilih 'event-organizer' dan dia belum EO
        // Namun karena role default adalah visitor, kita bisa update role jika diperlukan
        role: role === 'event-organizer' ? await getRoleId('event organizer') : undefined,
      });
      reset();
      // Redirect berdasarkan role
      if (role === 'event-organizer') {
        router.push('/dashboard');
      } else {
        router.push('/events');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleId = async (roleName: string) => {
    const res = await apiClient.get<{ docs: any[] }>(`/api/roles?where[name][equals]=${roleName}&limit=1`);
    return res.docs[0]?.id;
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header similar eventbrite */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">eventbrite</h1>
          <div className="text-sm text-gray-500">Step {step} of 3</div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-auto px-4">
          {step === 1 && <Step1Role onNext={nextStep} />}
          {step === 2 && <Step2Preferences onNext={nextStep} onPrev={prevStep} />}
          {step === 3 && <Step3Confirm onPrev={prevStep} onComplete={handleComplete} loading={loading} />}
        </div>
      </main>
    </div>
  );
}