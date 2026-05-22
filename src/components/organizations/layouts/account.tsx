'use client'

import Link from 'next/link'
import { ChevronDown, CircleHelp, LogOut, Settings } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AccountPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-lg font-medium transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="#" alt="Jhon Doe" />
            <AvatarFallback className="">JD</AvatarFallback>
          </Avatar>
          <span>Jhon Doe</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-82.5 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl"
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
            href="/account/settings"
            className="flex items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:border hover:border-blue-500 hover:bg-blue-50"
          >
            <Settings size={22} className="text-black" />

            <span className="text-[17px] font-semibold text-gray-800">Account Settings</span>
          </Link>

          <button className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition-colors hover:border hover:border-blue-500 hover:bg-blue-50 cursor-pointer">
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
