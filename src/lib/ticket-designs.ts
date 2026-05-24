// Shared ticket design types and presets used by both Ticket Designer and Ticket Settings pages

export interface TicketConfig {
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

export interface TicketDesign {
  id: string
  name: string
  config: TicketConfig
}

export const defaultConfig: TicketConfig = {
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

export const presets: { id: string; name: string; config: Partial<TicketConfig> }[] = [
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

// Initial designs that come pre-configured in the Ticket Designer
export const initialDesigns: TicketDesign[] = [
  {
    id: 'general-admission',
    name: 'General Admission',
    config: {
      ...defaultConfig,
      bgGradientFrom: '#0891b2',
      bgGradientTo: '#1e40af',
      labelColor: '#a5f3fc',
      badgeBg: '#0e7490',
      badgeText: '#cffafe',
      qrFgColor: '#164e63',
    },
  },
  {
    id: 'vip',
    name: 'VIP',
    config: { ...defaultConfig },
  },
]

// Helper to get background style from a config
export function getTicketBackground(config: TicketConfig): React.CSSProperties {
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
