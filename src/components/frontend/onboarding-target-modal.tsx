'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OnboardingTargetModalProps = {
  openByDefault?: boolean
}

export function OnboardingTargetModal({ openByDefault = false }: OnboardingTargetModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(openByDefault)
  const [ageRange, setAgeRange] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [city, setCity] = useState('')

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const saveOnboarding = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'eventbro-onboarding',
        JSON.stringify({ ageRange, interests, city, completedAt: new Date().toISOString() }),
      )
    }
    setOpen(false)
    router.replace('/organizer/dashboard')
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-xl p-0" showCloseButton={false}>
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#121a3d]">Audience targeting setup</DialogTitle>
            <DialogDescription>
              Sebelum publish event, isi profil audiens agar rekomendasi event dan promosi lebih tepat sasaran.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-800">Target age</p>
              <Select onValueChange={setAgeRange} value={ageRange}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Pilih rentang umur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="13-17">13-17</SelectItem>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45+">45+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-800">Interest</p>
              <div className="grid grid-cols-2 gap-3">
                {['Music', 'Business', 'Technology', 'Wellness', 'Sports', 'Community'].map((interest) => (
                  <label className="flex items-center gap-2 text-sm text-zinc-700" key={interest}>
                    <Checkbox checked={interests.includes(interest)} onCheckedChange={() => toggleInterest(interest)} />
                    {interest}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-800">Primary city</p>
              <Input onChange={(e) => setCity(e.target.value)} placeholder="Contoh: Jakarta" value={city} />
            </div>
          </div>
        </div>

        <DialogFooter className="bg-zinc-50">
          <Button onClick={saveOnboarding}>Save and continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

