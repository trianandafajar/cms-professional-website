export const DEMO_ACCOUNT_PASSWORD = 'Eventbro123!'

export const DEMO_ACCOUNTS = {
  organizer: {
    key: 'organizer',
    name: 'Organizer Demo',
    email: 'organization@eventbro.com',
    password: DEMO_ACCOUNT_PASSWORD,
    roleName: 'event organizer (eo)',
    isOrganizer: true,
    isOnboarded: true,
    onboardingStep: 4,
    bio: 'Demo organizer account for showcasing the Eventbro organization dashboard.',
    website: 'https://eventbro.com',
    instagram: '@eventbro',
  },
  user: {
    key: 'user',
    name: 'User Demo',
    email: 'user@eventbro.com',
    password: DEMO_ACCOUNT_PASSWORD,
    roleName: 'visitor',
    isOrganizer: false,
    isOnboarded: true,
    onboardingStep: 4,
    bio: 'Demo attendee account for showcasing ticket browsing, checkout, and orders.',
    website: 'https://eventbro.com',
    instagram: '@eventbro',
  },
  admin: {
    key: 'admin',
    name: 'Admin Demo',
    email: 'admin@eventbro.com',
    password: DEMO_ACCOUNT_PASSWORD,
    roleName: 'admin',
    isOrganizer: false,
    isOnboarded: true,
    onboardingStep: 4,
    bio: 'Demo admin account for Payload admin access and moderation workflows.',
    website: 'https://eventbro.com',
    instagram: '@eventbro',
  },
} as const

export const PORTFOLIO_LOGIN_OPTIONS = [
  {
    label: 'Organizer Demo',
    description: 'Auto login to organizer dashboard',
    email: DEMO_ACCOUNTS.organizer.email,
    password: DEMO_ACCOUNTS.organizer.password,
  },
  {
    label: 'User Demo',
    description: 'Auto login to ticket and order user',
    email: DEMO_ACCOUNTS.user.email,
    password: DEMO_ACCOUNTS.user.password,
  },
] as const

export type DemoAccountKey = keyof typeof DEMO_ACCOUNTS
