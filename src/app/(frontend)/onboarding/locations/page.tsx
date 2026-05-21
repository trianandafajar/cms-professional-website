// src/app/(frontend)/onboarding/locations/page.tsx (Step 2: Pilih Lokasi)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';

interface Location {
  id: string;
  name: string;
  code: string;
}

export default function OnboardingLocationPage() {
  const router = useRouter();
  const { setLocation, locationId: savedLocationId, locationName: savedLocationName } = useOnboardingStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(savedLocationId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await apiClient.get<{ docs: Location[] }>('/api/locations?limit=100');
        setLocations(data.docs);
      } catch (error) {
        console.error('Failed to load locations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleNext = () => {
    if (selectedId) {
      const selected = locations.find(l => l.id === selectedId);
      if (selected) {
        setLocation(selected.id, selected.name);
        router.push('/onboarding/tags');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-2">Set your location</h2>
      <p className="text-center text-gray-600 mb-8">Looking for events in</p>
      
      <div className="grid gap-3 max-w-md mx-auto">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedId(loc.id)}
            className={`text-left px-4 py-3 rounded-lg border transition ${
              selectedId === loc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between mt-12">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedId}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}