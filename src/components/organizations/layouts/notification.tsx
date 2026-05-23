// src/components/organizations/layouts/notification.tsx

'use client'

import { Bell, Megaphone, X } from 'lucide-react'

import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

export default function NotificationDrawer() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          className="relative rounded-xl p-2 transition-colors hover:bg-zinc-50"
          variant="ghost"
          size="sm"
        >
          <Bell size={20} className="text-zinc-600" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-full border-l border-zinc-200 p-0 sm:max-w-[440px]">
        <div className="flex h-full flex-col bg-white">
          {/* Header */}
          <div className="border-b border-zinc-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[2rem] font-bold tracking-tight text-[#12192f]">
                  Notifications
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Stay up to date on important information
                </p>
              </div>

              <DrawerClose asChild>
                <button className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-[#12192f]">
                  <X size={20} />
                </button>
              </DrawerClose>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-1 flex-col items-center justify-start px-8 pt-14 text-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-full bg-indigo-50">
              <Megaphone size={72} strokeWidth={1.5} className="text-[#12192f]" />
            </div>

            <h3 className="mt-10 text-4xl font-bold leading-tight tracking-tight text-[#12192f]">
              Nothing to see here (yet)!
            </h3>

            <p className="mt-4 max-w-[320px] text-lg leading-relaxed text-zinc-600">
              We'll be sure to let you know when we have something for you
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
