// src/app/(frontend)/organizations/dashboard/page.tsx
'use client';

import React from 'react';
import { Edit3, Sparkles, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-12">Hi there, Jhon Doe</h1>
        
      </div>

      {/* Right Sidebar (Get discovered) */}
      <aside className="w-80 flex-shrink-0 sticky top-[73px] h-fit">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Get discovered</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Set up your organizer profile
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            A complete profile can increase discovery of your event on search engines, highlight your brand and build trust with attendees
          </p>
          <button className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
            Set up your profile →
          </button>
        </div>
      </aside>
    </div>
  );
}