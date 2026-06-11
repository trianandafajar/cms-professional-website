// src/components/onboarding/Step2Preferences.tsx
'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';

interface Location {
  id: string;
  name: string;
  code?: string;
}

interface Category {
  id: string;
  name: string;
  group: string;
}

export default function Step2Preferences({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { locationId, locationName, categoryIds, setLocation, addCategory, removeCategory } = useOnboardingStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locationsRes, categoriesRes] = await Promise.all([
          apiClient.get<{ docs: Location[] }>('/api/locations?limit=100'),
          apiClient.get<{ docs: Category[] }>('/api/categories?limit=200'),
        ]);
        setLocations(locationsRes.docs);
        setCategories(categoriesRes.docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleCategory = (id: string) => {
    if (categoryIds.includes(id)) {
      removeCategory(id);
    } else {
      addCategory(id);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Set your location</label>
        <select
          value={locationId || ''}
          onChange={(e) => {
            const selected = locations.find(l => l.id === e.target.value);
            if (selected) setLocation(selected.id, selected.name);
          }}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Select your location</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
        {locationName && <p className="text-sm text-gray-500 mt-1">Looking for events in {locationName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tell us what you love</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`text-left px-3 py-2 rounded-full text-sm transition ${
                categoryIds.includes(cat.id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onPrev} className="px-4 py-2 border rounded-md hover:bg-gray-50">Previous</button>
        <button
          onClick={onNext}
          disabled={!locationId || categoryIds.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
