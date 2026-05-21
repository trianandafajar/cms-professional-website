'use client'

import Link from 'next/link'
import { Search, Menu, X, MapPin, ChevronDown, TrendingUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'

type NavbarProps = {
  userName?: string
}

const locations = [
  'New York',
  'Los Angeles',
  'Chicago',
  'San Francisco',
  'Miami',
  'Austin',
  'Seattle',
  'Atlanta',
  'Boston',
  'Denver',
  'Nashville',
  'Dallas',
  'Houston',
  'Orlando',
  'Philadelphia',
]

const trendingSearches = [
  'Music Festival',
  'Food & Wine',
  'Tech Conference',
  'Yoga Retreat',
  'Comedy Show',
  'Art Exhibition',
  'Networking',
  'Workshop',
]

export function FrontendNavbar({ userName }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [locationSearch, setLocationSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase()),
  )

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link className="shrink-0" href="/">
          <span className="text-[26px] font-extrabold tracking-tight text-[#5151eb]">eventbro</span>
        </Link>

        {/* Search Bar with Location & Trending */}
        <form
          action="#"
          className="relative hidden flex-1 max-w-[560px] lg:flex"
          ref={searchRef}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-11 w-full rounded-l-lg border border-r-0 border-zinc-200 bg-[#fdfdfd] pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
              name="q"
              placeholder="Search events"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />

            {/* Trending Search Dropdown */}
            {searchFocused && !searchQuery && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <TrendingUp className="size-3" />
                  Trending searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term)
                        setSearchFocused(false)
                      }}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-[#5151eb] hover:text-[#5151eb]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex h-11 items-center gap-2 rounded-r-lg border border-zinc-200 bg-[#fdfdfd] px-4 text-sm text-zinc-700 transition hover:bg-zinc-100"
            >
              <MapPin className="size-4 text-[#5151eb]" />
              <span className="max-w-[120px] truncate">{selectedLocation}</span>
              <ChevronDown
                className={`size-3.5 text-zinc-400 transition ${locationOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {locationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#5151eb]"
                />
                <div className="max-h-52 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation('All Locations')
                      setLocationOpen(false)
                      setLocationSearch('')
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-zinc-50 ${selectedLocation === 'All Locations' ? 'bg-indigo-50 font-medium text-[#5151eb]' : 'text-zinc-700'}`}
                  >
                    <MapPin className="size-3.5" />
                    All Locations
                  </button>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc)
                        setLocationOpen(false)
                        setLocationSearch('')
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-zinc-50 ${selectedLocation === loc ? 'bg-indigo-50 font-medium text-[#5151eb]' : 'text-zinc-700'}`}
                    >
                      <MapPin className="size-3.5" />
                      {loc}
                    </button>
                  ))}
                  {filteredLocations.length === 0 && (
                    <p className="px-3 py-2 text-sm text-zinc-400">No locations found</p>
                  )}
                </div>
              </div>
            )}
            <input type="hidden" name="location" value={selectedLocation} />
          </div>
        </form>

        {/* Nav Links */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Button
            asChild
            className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
            size="sm"
            variant="ghost"
          >
            <Link href="#">Find Events</Link>
          </Button>
          <Button
            asChild
            className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
            size="sm"
            variant="ghost"
          >
            <Link href="/organizations/events/draft?onboard=1">Create Events</Link>
          </Button>
          <Button
            asChild
            className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
            size="sm"
            variant="ghost"
          >
            <Link href="#">Find My Tickets</Link>
          </Button>
        </nav>

        {/* Auth */}
        <div className="hidden items-center gap-2 lg:flex">
          {userName ? (
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-[#5151eb]">
              {userName}
            </span>
          ) : (
            <>
              <Button
                asChild
                className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
                size="sm"
                variant="ghost"
              >
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="rounded-md bg-[#5151eb] px-4 text-sm font-medium text-white hover:bg-[#3d3dcc]"
                size="sm"
              >
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="ml-auto lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 py-4 lg:hidden">
          <form action="#" className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 w-full rounded-lg border border-zinc-200 bg-[#fdfdfd] pl-9 pr-4 text-sm outline-none"
              name="q"
              placeholder="Search events"
              type="search"
            />
          </form>
          <nav className="flex flex-col gap-2">
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              href="#"
            >
              Find Events
            </Link>
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              href="/organizations/events/draft?onboard=1"
            >
              Create Events
            </Link>
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              href="#"
            >
              Find My Tickets
            </Link>
            <hr className="my-2 border-zinc-100" />
            {userName ? (
              <span className="px-3 py-2 text-sm font-medium text-[#5151eb]">{userName}</span>
            ) : (
              <>
                <Link
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  href="/auth/login"
                >
                  Log In
                </Link>
                <Link
                  className="rounded-md bg-[#5151eb] px-3 py-2 text-center text-sm font-medium text-white"
                  href="/auth/register"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
