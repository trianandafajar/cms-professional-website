'use client'

import { useEffect, useRef, useState, useCallback, ChangeEvent } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  Download,
  Move,
  Maximize2,
  Square,
  Circle,
  Type,
  Sliders,
  RotateCcw,
  QrCode,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Pencil,
  Check,
  Upload,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/stores/authStore'

// ─── Types ───
interface TicketConfig {
  orientation: 'horizontal' | 'vertical'
  width: number
  height: number
  borderRadius: number
  padding: number
  bgType: 'gradient' | 'solid' | 'image'
  bgGradientFrom: string
  bgGradientTo: string
  bgGradientDirection: string
  bgSolid: string
  bgImage: string
  titleSize: number
  titleColor: string
  labelColor: string
  valueColor: string
  qrSize: number
  qrPosition: 'right' | 'left' | 'bottom-right' | 'bottom-left'
  qrBgColor: string
  qrFgColor: string
  qrBorderRadius: number
  showDecoCircles: boolean
  showDivider: boolean
  dividerStyle: 'dashed' | 'solid' | 'dotted'
  showBranding: boolean
  badgeBg: string
  badgeText: string
}

interface TicketDesign {
  id: string
  dbId?: number
  name: string
  config: TicketConfig
}

type SavedTicketDesignPreset = {
  id: number
  designKey: string
  name: string
  config: TicketConfig
}

const defaultConfig: TicketConfig = {
  orientation: 'horizontal',
  width: 780,
  height: 370,
  borderRadius: 24,
  padding: 32,
  bgType: 'gradient',
  bgGradientFrom: '#1e1b4b',
  bgGradientTo: '#312e81',
  bgGradientDirection: '135deg',
  bgSolid: '#1e1b4b',
  bgImage: '',
  titleSize: 22,
  titleColor: '#ffffff',
  labelColor: '#a5b4fc',
  valueColor: '#ffffff',
  qrSize: 150,
  qrPosition: 'right',
  qrBgColor: '#ffffff',
  qrFgColor: '#1e1b4b',
  qrBorderRadius: 16,
  showDecoCircles: true,
  showDivider: true,
  dividerStyle: 'dashed',
  showBranding: true,
  badgeBg: '#4338ca',
  badgeText: '#e0e7ff',
}

const presets: { id: string; name: string; config: Partial<TicketConfig> }[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#1e1b4b',
      bgGradientTo: '#312e81',
      titleColor: '#ffffff',
      labelColor: '#a5b4fc',
      valueColor: '#ffffff',
      qrFgColor: '#1e1b4b',
      badgeBg: '#4338ca',
      badgeText: '#e0e7ff',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#ea580c',
      bgGradientTo: '#9333ea',
      titleColor: '#ffffff',
      labelColor: '#fed7aa',
      valueColor: '#ffffff',
      qrFgColor: '#9a3412',
      badgeBg: '#c2410c',
      badgeText: '#ffedd5',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#0891b2',
      bgGradientTo: '#1e40af',
      titleColor: '#ffffff',
      labelColor: '#a5f3fc',
      valueColor: '#ffffff',
      qrFgColor: '#164e63',
      badgeBg: '#0e7490',
      badgeText: '#cffafe',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#065f46',
      bgGradientTo: '#134e4a',
      titleColor: '#ffffff',
      labelColor: '#6ee7b7',
      valueColor: '#ffffff',
      qrFgColor: '#064e3b',
      badgeBg: '#047857',
      badgeText: '#d1fae5',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    config: {
      bgType: 'solid',
      bgSolid: '#ffffff',
      titleColor: '#18181b',
      labelColor: '#71717a',
      valueColor: '#18181b',
      qrFgColor: '#18181b',
      badgeBg: '#e0e7ff',
      badgeText: '#4338ca',
    },
  },
  {
    id: 'royal',
    name: 'Royal',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#4c1d95',
      bgGradientTo: '#701a75',
      titleColor: '#ffffff',
      labelColor: '#e9d5ff',
      valueColor: '#ffffff',
      qrFgColor: '#4c1d95',
      badgeBg: '#7c3aed',
      badgeText: '#f3e8ff',
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#18181b',
      bgGradientTo: '#27272a',
      titleColor: '#ffffff',
      labelColor: '#a1a1aa',
      valueColor: '#ffffff',
      qrFgColor: '#18181b',
      badgeBg: '#3f3f46',
      badgeText: '#e4e4e7',
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    config: {
      bgType: 'gradient',
      bgGradientFrom: '#78350f',
      bgGradientTo: '#451a03',
      titleColor: '#fbbf24',
      labelColor: '#fde68a',
      valueColor: '#fef3c7',
      qrFgColor: '#451a03',
      badgeBg: '#92400e',
      badgeText: '#fef3c7',
    },
  },
]

const sampleEvent = {
  name: 'Indonesia Creative Summit 2026',
  date: '28 June 2026',
  time: '09:00 WIB',
  venue: 'JCC, Jakarta',
}

function createEmptyDesign(index: number): TicketDesign {
  return {
    id: `design-${Date.now()}`,
    name: `New Design ${index}`,
    config: { ...defaultConfig },
  }
}

export default function TicketDesignerPage() {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [designs, setDesigns] = useState<TicketDesign[]>([])
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'presets' | 'layout' | 'style' | 'qr'>('presets')
  const [downloading, setDownloading] = useState(false)
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true)
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [isDeletingPreset, setIsDeletingPreset] = useState(false)
  const [isRenamingPreset, setIsRenamingPreset] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')
  const ticketRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const saveMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeDesign = designs.find((d) => d.id === activeDesignId) ?? null
  const config = activeDesign?.config ?? defaultConfig

  const showSaveMessage = (message: string) => {
    if (saveMessageTimeoutRef.current) {
      clearTimeout(saveMessageTimeoutRef.current)
    }

    setSaveMessage(message)
    saveMessageTimeoutRef.current = setTimeout(() => {
      setSaveMessage(null)
      saveMessageTimeoutRef.current = null
    }, 2500)
  }

  useEffect(() => {
    if (!hasHydrated) return

    async function loadSavedDesigns() {
      if (!user?.id) {
        setIsLoadingDesigns(false)
        return
      }

      setIsLoadingDesigns(true)

      try {
        const response = await apiClient.get<{ docs: SavedTicketDesignPreset[] }>(
          '/api/ticket-design-presets?limit=100&sort=name',
        )
        const savedDesigns = (response.docs ?? []).map((doc) => ({
          id: doc.designKey,
          dbId: doc.id,
          name: doc.name,
          config: { ...defaultConfig, ...doc.config },
        }))

        setDesigns(savedDesigns)
        setActiveDesignId((current) => current ?? savedDesigns[0]?.id ?? null)
      } catch (error) {
        console.error('Failed to load ticket design presets:', error)
      } finally {
        setIsLoadingDesigns(false)
      }
    }

    loadSavedDesigns()
  }, [hasHydrated, user?.id])

  useEffect(() => {
    return () => {
      if (saveMessageTimeoutRef.current) {
        clearTimeout(saveMessageTimeoutRef.current)
      }
    }
  }, [])

  const updateConfig = (partial: Partial<TicketConfig>) => {
    if (!activeDesignId) return

    setDesigns((prev) =>
      prev.map((d) =>
        d.id === activeDesignId ? { ...d, config: { ...d.config, ...partial } } : d,
      ),
    )
  }

  const applyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) updateConfig(preset.config)
  }

  const resetConfig = () => updateConfig(defaultConfig)

  const addDesign = () => {
    const newDesign = createEmptyDesign(designs.length + 1)
    setDesigns((prev) => [...prev, newDesign])
    setActiveDesignId(newDesign.id)
  }

  const duplicateDesign = (designId: string) => {
    const source = designs.find((d) => d.id === designId)
    if (!source) return
    const id = `design-${Date.now()}`
    const newDesign: TicketDesign = {
      id,
      name: `${source.name} (Copy)`,
      config: { ...source.config },
    }
    setDesigns((prev) => [...prev, newDesign])
    setActiveDesignId(id)
  }

  const deleteDesign = async (designId: string) => {
    if (designs.length <= 1) return

    const design = designs.find((d) => d.id === designId)
    if (!design) return

    const confirmed = window.confirm(`Delete preset "${design.name}"?`)
    if (!confirmed) return

    setSaveMessage(null)

    try {
      if (design.dbId) {
        setIsDeletingPreset(true)
        await apiClient.delete(`/api/ticket-design-presets/${design.dbId}`)
      }

      setDesigns((prev) => {
        const next = prev.filter((d) => d.id !== designId)

        if (activeDesignId === designId) {
          setActiveDesignId(next[0]?.id ?? null)
        }

        return next
      })
      showSaveMessage('Preset deleted')
    } catch (error) {
      console.error('Failed to delete ticket design preset:', error)
      showSaveMessage('Failed to delete preset')
    } finally {
      setIsDeletingPreset(false)
    }
  }

  const startRename = (designId: string) => {
    const design = designs.find((d) => d.id === designId)
    if (!design) return
    setEditingName(designId)
    setTempName(design.name)
  }

  const confirmRename = async () => {
    if (!editingName || !tempName.trim()) return

    const nextName = tempName.trim()
    const design = designs.find((d) => d.id === editingName)
    if (!design) return

    setSaveMessage(null)

    try {
      if (design.dbId) {
        setIsRenamingPreset(true)
        await apiClient.patch(`/api/ticket-design-presets/${design.dbId}`, {
          name: nextName,
        })
      }

      setDesigns((prev) =>
        prev.map((d) => (d.id === editingName ? { ...d, name: nextName } : d)),
      )
      setEditingName(null)
      setTempName('')
      showSaveMessage('Preset updated')
    } catch (error) {
      console.error('Failed to rename ticket design preset:', error)
      showSaveMessage('Failed to update preset')
    } finally {
      setIsRenamingPreset(false)
    }
  }

  const saveActiveDesignAsPreset = async () => {
    if (!activeDesign) return

    setIsSavingPreset(true)
    setSaveMessage(null)

    try {
      const data = {
        designKey: activeDesign.id,
        name: activeDesign.name,
        config: activeDesign.config,
      }

      const response = activeDesign.dbId
        ? await apiClient.patch<{ doc: SavedTicketDesignPreset }>(
            `/api/ticket-design-presets/${activeDesign.dbId}`,
            data,
          )
        : await apiClient.post<{ doc: SavedTicketDesignPreset }>('/api/ticket-design-presets', data)

      setDesigns((prev) =>
        prev.map((design) =>
          design.id === activeDesign.id
            ? {
                ...design,
                dbId: response.doc.id,
                name: response.doc.name,
                config: { ...defaultConfig, ...response.doc.config },
              }
            : design,
        ),
      )
      showSaveMessage('Preset saved')
    } catch (error) {
      console.error('Failed to save ticket design preset:', error)
      showSaveMessage('Failed to save preset')
    } finally {
      setIsSavingPreset(false)
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        updateConfig({ bgType: 'image', bgImage: result })
      }
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const downloadTicket = useCallback(async () => {
    const el = ticketRef.current
    if (!el || !activeDesign) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 3,
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `ticket-${activeDesign.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }, [activeDesign])

  const downloadAllDesigns = useCallback(async () => {
    if (designs.length === 0) return

    setDownloading(true)
    for (const design of designs) {
      setActiveDesignId(design.id)
      // Wait for re-render
      await new Promise((r) => setTimeout(r, 300))
      const el = ticketRef.current
      if (!el) continue
      try {
        const dataUrl = await toPng(el, {
          pixelRatio: 3,
          cacheBust: true,
        })
        const link = document.createElement('a')
        link.download = `ticket-${design.name.toLowerCase().replace(/\s+/g, '-')}.png`
        link.href = dataUrl
        link.click()
        // Small delay between downloads
        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        console.error(`Download failed for ${design.name}:`, err)
      }
    }
    setDownloading(false)
  }, [designs])

  const getTicketBackground = (): React.CSSProperties => {
    if (config.bgType === 'gradient') {
      return {
        background: `linear-gradient(${config.bgGradientDirection}, ${config.bgGradientFrom}, ${config.bgGradientTo})`,
      }
    }
    if (config.bgType === 'image' && config.bgImage) {
      return {
        backgroundImage: `url(${config.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return { backgroundColor: config.bgSolid }
  }

  // Hidden file input
  const triggerFileUpload = () => fileInputRef.current?.click()

  return (
    <div className="flex h-[calc(100vh-63px)] -m-7">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ─── Left Sidebar ─── */}
      <aside className="w-[340px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#5151eb]" />
              <h3 className="text-sm font-bold text-zinc-900">Ticket Designer</h3>
            </div>
            <button
              onClick={resetConfig}
              disabled={!activeDesign}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 disabled:opacity-50"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* Design Switcher */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Designs
              </span>
              <button
                onClick={addDesign}
                className="flex items-center gap-1 rounded-md bg-[#5151eb] px-2 py-1 text-[10px] font-medium text-white transition hover:bg-[#4040d9]"
              >
                <Plus size={10} />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {designs.length === 0 ? (
                <p className="text-xs text-zinc-400">Belum ada preset tersimpan.</p>
              ) : (
                designs.map((design) => (
                  <div key={design.id} className="group relative">
                    {editingName === design.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                          disabled={isRenamingPreset}
                          className="h-7 w-24 rounded-md border border-[#5151eb] px-2 text-[10px] font-medium outline-none"
                          autoFocus
                        />
                        <button
                          onClick={confirmRename}
                          disabled={isRenamingPreset}
                          className="rounded-md bg-[#5151eb] p-1 text-white disabled:opacity-50"
                        >
                          <Check size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveDesignId(design.id)}
                        className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                          activeDesignId === design.id
                            ? 'bg-[#5151eb] text-white shadow-sm'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {design.name}
                      </button>
                    )}
                    {activeDesignId === design.id && editingName !== design.id && (
                      <div className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => startRename(design.id)}
                          disabled={isRenamingPreset || isDeletingPreset}
                          className="rounded-full border border-zinc-200 bg-white p-0.5 shadow hover:bg-zinc-50 disabled:opacity-50"
                        >
                          <Pencil size={8} className="text-zinc-500" />
                        </button>
                        <button
                          onClick={() => duplicateDesign(design.id)}
                          disabled={isRenamingPreset || isDeletingPreset}
                          className="rounded-full border border-zinc-200 bg-white p-0.5 shadow hover:bg-zinc-50 disabled:opacity-50"
                        >
                          <Copy size={8} className="text-zinc-500" />
                        </button>
                        {designs.length > 1 && (
                          <button
                            onClick={() => deleteDesign(design.id)}
                            disabled={isDeletingPreset || isRenamingPreset}
                            className="rounded-full border border-red-200 bg-white p-0.5 shadow hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={8} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
            {(['presets', 'layout', 'style', 'qr'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-[#5151eb] shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Presets */}
          {activeTab === 'presets' && (
            <SidebarSection title="Color Presets" icon={<Sparkles size={14} />}>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="group overflow-hidden rounded-xl border border-zinc-200 p-1.5 transition hover:border-[#5151eb]/50 hover:shadow-sm"
                  >
                    <div
                      className="h-12 w-full rounded-lg"
                      style={{
                        background:
                          preset.config.bgType === 'solid'
                            ? preset.config.bgSolid
                            : `linear-gradient(135deg, ${preset.config.bgGradientFrom}, ${preset.config.bgGradientTo})`,
                      }}
                    />
                    <p className="mt-1.5 text-[10px] font-medium text-zinc-600 group-hover:text-[#5151eb]">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Layout */}
          {activeTab === 'layout' && (
            <div className="space-y-5">
              <SidebarSection title="Orientation" icon={<Move size={14} />}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateConfig({ orientation: 'horizontal' })}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                      config.orientation === 'horizontal'
                        ? 'border-[#5151eb] bg-indigo-50 text-[#5151eb]'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="h-4 w-7 rounded border border-current" />
                    Horizontal
                  </button>
                  <button
                    onClick={() => updateConfig({ orientation: 'vertical' })}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                      config.orientation === 'vertical'
                        ? 'border-[#5151eb] bg-indigo-50 text-[#5151eb]'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="h-7 w-4 rounded border border-current" />
                    Vertical
                  </button>
                </div>
              </SidebarSection>
              <SidebarSection title="Dimensions" icon={<Maximize2 size={14} />}>
                <SliderControl
                  label="Width"
                  value={config.width}
                  min={400}
                  max={1000}
                  onChange={(v) => updateConfig({ width: v })}
                />
                <SliderControl
                  label="Height"
                  value={config.height}
                  min={250}
                  max={600}
                  onChange={(v) => updateConfig({ height: v })}
                />
              </SidebarSection>
              <SidebarSection title="Shape" icon={<Square size={14} />}>
                <SliderControl
                  label="Border Radius"
                  value={config.borderRadius}
                  min={0}
                  max={48}
                  onChange={(v) => updateConfig({ borderRadius: v })}
                />
                <SliderControl
                  label="Padding"
                  value={config.padding}
                  min={16}
                  max={56}
                  onChange={(v) => updateConfig({ padding: v })}
                />
              </SidebarSection>
              <SidebarSection title="Elements" icon={<Sliders size={14} />}>
                <ToggleControl
                  label="Decorative Circles"
                  checked={config.showDecoCircles}
                  onChange={(v) => updateConfig({ showDecoCircles: v })}
                />
                <ToggleControl
                  label="Divider Line"
                  checked={config.showDivider}
                  onChange={(v) => updateConfig({ showDivider: v })}
                />
                {config.showDivider && (
                  <div className="ml-4 mt-2 flex gap-1.5">
                    {(['dashed', 'solid', 'dotted'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateConfig({ dividerStyle: s })}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition ${config.dividerStyle === s ? 'bg-[#5151eb] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <ToggleControl
                  label="Branding Footer"
                  checked={config.showBranding}
                  onChange={(v) => updateConfig({ showBranding: v })}
                />
              </SidebarSection>
            </div>
          )}

          {/* Style */}
          {activeTab === 'style' && (
            <div className="space-y-5">
              <SidebarSection title="Background" icon={<ImageIcon size={14} />}>
                <div className="flex gap-1.5 mb-3">
                  {(['gradient', 'solid', 'image'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateConfig({ bgType: t })}
                      className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-medium capitalize transition ${config.bgType === t ? 'bg-[#5151eb] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {config.bgType === 'gradient' && (
                  <div className="space-y-3">
                    <ColorControl
                      label="From"
                      value={config.bgGradientFrom}
                      onChange={(v) => updateConfig({ bgGradientFrom: v })}
                    />
                    <ColorControl
                      label="To"
                      value={config.bgGradientTo}
                      onChange={(v) => updateConfig({ bgGradientTo: v })}
                    />
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Direction
                      </label>
                      <div className="mt-1 grid grid-cols-4 gap-1">
                        {['135deg', '180deg', '90deg', '45deg'].map((d) => (
                          <button
                            key={d}
                            onClick={() => updateConfig({ bgGradientDirection: d })}
                            className={`rounded-md px-2 py-1.5 text-[10px] font-medium transition ${config.bgGradientDirection === d ? 'bg-[#5151eb] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {config.bgType === 'solid' && (
                  <ColorControl
                    label="Color"
                    value={config.bgSolid}
                    onChange={(v) => updateConfig({ bgSolid: v })}
                  />
                )}
                {config.bgType === 'image' && (
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <button
                        onClick={triggerFileUpload}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-xs font-medium text-zinc-600 transition hover:border-[#5151eb] hover:bg-indigo-50 hover:text-[#5151eb]"
                      >
                        <Upload size={16} />
                        Upload Image File
                      </button>
                    </div>
                    {/* Or URL */}
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Or paste URL
                      </label>
                      <input
                        type="text"
                        value={config.bgImage.startsWith('data:') ? '' : config.bgImage}
                        onChange={(e) => updateConfig({ bgImage: e.target.value })}
                        placeholder="https://..."
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                      />
                    </div>
                    {/* Preview */}
                    {config.bgImage && (
                      <div className="relative overflow-hidden rounded-lg border border-zinc-200">
                        <img
                          src={config.bgImage}
                          alt="Background"
                          className="h-20 w-full object-cover"
                        />
                        <button
                          onClick={() => updateConfig({ bgImage: '' })}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white shadow"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </SidebarSection>

              <SidebarSection title="Typography" icon={<Type size={14} />}>
                <SliderControl
                  label="Title Size"
                  value={config.titleSize}
                  min={16}
                  max={36}
                  onChange={(v) => updateConfig({ titleSize: v })}
                />
                <ColorControl
                  label="Title Color"
                  value={config.titleColor}
                  onChange={(v) => updateConfig({ titleColor: v })}
                />
                <ColorControl
                  label="Label Color"
                  value={config.labelColor}
                  onChange={(v) => updateConfig({ labelColor: v })}
                />
                <ColorControl
                  label="Value Color"
                  value={config.valueColor}
                  onChange={(v) => updateConfig({ valueColor: v })}
                />
              </SidebarSection>
              <SidebarSection title="Badge" icon={<Sparkles size={14} />}>
                <ColorControl
                  label="Background"
                  value={config.badgeBg}
                  onChange={(v) => updateConfig({ badgeBg: v })}
                />
                <ColorControl
                  label="Text"
                  value={config.badgeText}
                  onChange={(v) => updateConfig({ badgeText: v })}
                />
              </SidebarSection>
            </div>
          )}

          {/* QR */}
          {activeTab === 'qr' && (
            <div className="space-y-5">
              <SidebarSection title="Position" icon={<QrCode size={14} />}>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['right', 'left', 'bottom-right', 'bottom-left'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateConfig({ qrPosition: pos })}
                      className={`rounded-lg px-2.5 py-2 text-[10px] font-medium capitalize transition ${config.qrPosition === pos ? 'bg-[#5151eb] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </SidebarSection>
              <SidebarSection title="Size & Shape" icon={<Maximize2 size={14} />}>
                <SliderControl
                  label="QR Size"
                  value={config.qrSize}
                  min={80}
                  max={220}
                  onChange={(v) => updateConfig({ qrSize: v })}
                />
                <SliderControl
                  label="Border Radius"
                  value={config.qrBorderRadius}
                  min={0}
                  max={32}
                  onChange={(v) => updateConfig({ qrBorderRadius: v })}
                />
              </SidebarSection>
              <SidebarSection title="Colors" icon={<Circle size={14} />}>
                <ColorControl
                  label="Background"
                  value={config.qrBgColor}
                  onChange={(v) => updateConfig({ qrBgColor: v })}
                />
                <ColorControl
                  label="Foreground"
                  value={config.qrFgColor}
                  onChange={(v) => updateConfig({ qrFgColor: v })}
                />
              </SidebarSection>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Right: Preview ─── */}
      <div className="flex-1 overflow-y-auto bg-zinc-100/50 p-8">
        <div className="mx-auto max-w-5xl">
          {/* Top bar */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Ticket Designer</h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Editing:{' '}
                <span className="font-semibold text-[#5151eb]">
                  {activeDesign?.name ?? 'No design selected'}
                </span>{' '}
                •{' '}
                {isLoadingDesigns
                  ? 'loading saved designs'
                  : `${designs.length} design${designs.length > 1 ? 's' : ''} total`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saveMessage && (
                <span
                  className={`text-sm font-medium ${
                    saveMessage.includes('Failed') ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {saveMessage}
                </span>
              )}
              <button
                onClick={saveActiveDesignAsPreset}
                disabled={
                  isSavingPreset || isDeletingPreset || isRenamingPreset || !user || !activeDesign
                }
                className="flex items-center gap-2 rounded-xl border border-[#5151eb]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#5151eb] transition hover:bg-indigo-50 disabled:opacity-50"
              >
                <Check size={15} />
                {isSavingPreset
                  ? 'Saving...'
                  : isDeletingPreset
                    ? 'Deleting...'
                    : isRenamingPreset
                      ? 'Updating...'
                      : 'Save Preset'}
              </button>
              <button
                onClick={downloadAllDesigns}
                disabled={downloading || designs.length === 0}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                <Download size={15} />
                Download All
              </button>
              <button
                onClick={downloadTicket}
                disabled={downloading || !activeDesign}
                className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d9] disabled:opacity-50"
              >
                <Download size={16} />
                {downloading ? 'Exporting...' : 'Download'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm min-h-[500px]">
            {!activeDesign ? (
              <div className="flex max-w-md flex-col items-center text-center">
                <div className="rounded-full bg-indigo-50 p-4 text-[#5151eb]">
                  <Sliders size={24} />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-zinc-900">Belum ada preset</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Tambahkan design baru untuk mulai membuat preset ticket.
                </p>
                <button
                  onClick={addDesign}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5151eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d9]"
                >
                  <Plus size={14} />
                  Add Design
                </button>
              </div>
            ) : (
              <div
                ref={ticketRef}
                style={{
                  ...getTicketBackground(),
                  width: `${config.width}px`,
                  height:
                    config.orientation === 'vertical'
                      ? `${config.height + 200}px`
                      : `${config.height}px`,
                  borderRadius: `${config.borderRadius}px`,
                  padding: `${config.padding}px`,
                }}
                className="relative overflow-hidden shadow-2xl"
              >
              {config.showDecoCircles && (
                <>
                  <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
                  <div className="pointer-events-none absolute right-1/4 top-1/3 h-24 w-24 rounded-full bg-white/3" />
                </>
              )}
              {config.bgType === 'image' && (
                <div className="pointer-events-none absolute inset-0 bg-black/40" />
              )}

              <div
                className={`relative flex h-full ${config.orientation === 'vertical' ? 'flex-col' : 'flex-row items-stretch'} gap-6`}
              >
                {/* Info */}
                <div
                  className={`flex flex-1 flex-col justify-between ${config.qrPosition === 'left' ? 'order-2' : 'order-1'}`}
                >
                  <div>
                    <div
                      style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      <Sparkles size={11} />
                      {activeDesign.name}
                    </div>
                    <h3
                      style={{ color: config.titleColor, fontSize: `${config.titleSize}px` }}
                      className="mt-3 font-bold leading-tight"
                    >
                      {sampleEvent.name}
                    </h3>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <TicketDetail
                      labelColor={config.labelColor}
                      valueColor={config.valueColor}
                      icon={<Calendar size={12} />}
                      label="Date"
                      value={sampleEvent.date}
                    />
                    <TicketDetail
                      labelColor={config.labelColor}
                      valueColor={config.valueColor}
                      icon={<Clock size={12} />}
                      label="Time"
                      value={sampleEvent.time}
                    />
                    <TicketDetail
                      labelColor={config.labelColor}
                      valueColor={config.valueColor}
                      icon={<MapPin size={12} />}
                      label="Venue"
                      value={sampleEvent.venue}
                    />
                    <TicketDetail
                      labelColor={config.labelColor}
                      valueColor={config.valueColor}
                      icon={<User size={12} />}
                      label="Attendee"
                      value="Alex Johnson"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                      <p
                        style={{ color: config.labelColor }}
                        className="text-[9px] uppercase tracking-wider"
                      >
                        Seat
                      </p>
                      <p style={{ color: config.valueColor }} className="text-sm font-bold">
                        VIP-A12
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                      <p
                        style={{ color: config.labelColor }}
                        className="text-[9px] uppercase tracking-wider"
                      >
                        Gate
                      </p>
                      <p style={{ color: config.valueColor }} className="text-sm font-bold">
                        Gate 2
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                      <p
                        style={{ color: config.labelColor }}
                        className="text-[9px] uppercase tracking-wider"
                      >
                        Price
                      </p>
                      <p style={{ color: config.valueColor }} className="text-sm font-bold">
                        Rp 500.000
                      </p>
                    </div>
                  </div>
                  {config.showBranding && (
                    <div className="mt-4 flex items-center justify-between">
                      <p style={{ color: config.labelColor }} className="text-[10px] font-medium">
                        Powered by eventbro
                      </p>
                      <p style={{ color: config.labelColor }} className="text-[10px]">
                        TKT-PREVIEW-001
                      </p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                {config.showDivider &&
                  (config.orientation === 'horizontal' ? (
                    <div
                      className={`flex items-center ${config.qrPosition === 'left' ? 'order-3' : 'order-2'}`}
                    >
                      <div
                        className="h-full w-px"
                        style={{ borderLeft: `1px ${config.dividerStyle} rgba(255,255,255,0.3)` }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full order-2"
                      style={{ borderTop: `1px ${config.dividerStyle} rgba(255,255,255,0.3)` }}
                    />
                  ))}

                {/* QR */}
                <div
                  className={`flex flex-col items-center justify-center gap-3 ${config.orientation === 'horizontal' ? 'w-48' : 'w-full'} ${config.qrPosition === 'left' ? 'order-1' : 'order-3'}`}
                >
                  <div
                    style={{ borderRadius: `${config.qrBorderRadius}px` }}
                    className="bg-white p-3 shadow-lg"
                  >
                    <QRCodeSVG
                      value="https://eventbro.id/checkin/TKT-PREVIEW-001"
                      size={config.qrSize}
                      bgColor={config.qrBgColor}
                      fgColor={config.qrFgColor}
                      level="H"
                      marginSize={0}
                    />
                  </div>
                  <p
                    style={{ color: config.labelColor }}
                    className="text-center text-[10px] font-medium"
                  >
                    Scan for check-in
                  </p>
                </div>
              </div>
              </div>
            )}
          </div>

          {/* All designs preview */}
          {designs.length > 1 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">All Designs</h3>
              <div className="grid grid-cols-2 gap-3">
                {designs.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setActiveDesignId(design.id)}
                    className={`overflow-hidden rounded-xl border-2 p-2 transition ${
                      activeDesignId === design.id
                        ? 'border-[#5151eb] shadow-md'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div
                      className="h-20 w-full rounded-lg"
                      style={
                        design.config.bgType === 'gradient'
                          ? {
                              background: `linear-gradient(${design.config.bgGradientDirection}, ${design.config.bgGradientFrom}, ${design.config.bgGradientTo})`,
                            }
                          : design.config.bgType === 'image' && design.config.bgImage
                            ? {
                                backgroundImage: `url(${design.config.bgImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }
                            : { backgroundColor: design.config.bgSolid }
                      }
                    />
                    <p
                      className={`mt-2 text-xs font-medium ${activeDesignId === design.id ? 'text-[#5151eb]' : 'text-zinc-600'}`}
                    >
                      {design.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───

function TicketDetail({
  labelColor,
  valueColor,
  icon,
  label,
  value,
}: {
  labelColor: string
  valueColor: string
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1" style={{ color: labelColor }}>
        {icon}
        <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p style={{ color: valueColor }} className="text-xs font-semibold">
        {value}
      </p>
    </div>
  )
}

function SidebarSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-zinc-400">{icon}</span>
        <h4 className="text-xs font-semibold text-zinc-700">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <span className="text-[10px] font-semibold text-zinc-700">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-[#5151eb]"
      />
    </div>
  )
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mb-3">
      <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-md border border-zinc-200 p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-mono text-zinc-700 outline-none transition focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/10"
        />
      </div>
    </div>
  )
}

function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-[#5151eb]' : 'bg-zinc-200'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}
