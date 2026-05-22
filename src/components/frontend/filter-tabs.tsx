'use client'

import { useState } from 'react'

const tabs = [
  'All',
  'For you',
  'Today',
  'This weekend',
  'Free',
  'Music',
  'Food & Drink',
  'Business',
]

export function FilterTabs() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition ${
            activeTab === tab
              ? 'border-[#5151eb] text-[#5151eb]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
