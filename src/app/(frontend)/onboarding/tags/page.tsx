// src/app/(frontend)/onboarding/tags/page.tsx (Step 3: Pilih Kategori Minat)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';

interface Category {
  id: string;
  name: string;
  group?: string;
  icon?: string;
}

export default function OnboardingTagsPage() {
  const router = useRouter();
  const { categoryIds, addCategory, removeCategory } = useOnboardingStore();
  const [categories, setFetchedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<{ docs: Category[] }>('/api/categories?limit=200');
        setFetchedCategories(data.docs);
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (id: string) => {
    if (categoryIds.includes(id)) {
      removeCategory(id);
    } else {
      addCategory(id);
    }
  };

  const handleNext = () => {
    router.push('/onboarding/confirm');
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-2">Tell us what you love</h2>
      <p className="text-center text-gray-600 mb-8">Customize your event recommendations based on your interests.</p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              categoryIds.includes(cat.id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
