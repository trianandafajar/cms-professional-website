'use client'

import Link from 'next/link'
import { CircleHelp, LogOut, Settings, User } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function AccountPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 font-medium text-white transition-colors hover:bg-blue-700">
          <span>Jhon Doe</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[330px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl"
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              JD
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Jhon Doe</h3>

              <p className="text-sm text-gray-500">jhondoe@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="p-2">
          <Link
            href="/help"
            className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:border hover:border-blue-500 hover:bg-blue-50"
          >
            <CircleHelp size={22} className="text-gray-600" />

            <span className="text-[17px] font-medium text-gray-800">Help Center</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:border hover:border-blue-500 hover:bg-blue-50"
          >
            <Settings size={22} className="text-black" />

            <span className="text-[17px] font-semibold text-gray-800">Account Settings</span>
          </Link>

          <button className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition-colors hover:border hover:border-blue-500 hover:bg-blue-50">
            <LogOut size={22} className="text-black" />

            <div className="flex flex-col">
              <span className="text-[17px] font-medium text-gray-800">Log out</span>

              <span className="text-sm text-gray-500">reno75874@gmail.com</span>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
