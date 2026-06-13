export type FooterPage = {
  slug: string
  title: string
  eyebrow: string
  description: string
  sections: {
    title: string
    body: string
  }[]
}

export const footerPages: FooterPage[] = [
  {
    slug: 'about',
    title: 'About Eventbro',
    eyebrow: 'Company',
    description:
      'Eventbro helps people discover memorable events and gives organizers a cleaner way to publish, sell, and manage tickets.',
    sections: [
      {
        title: 'Built for discovery',
        body: 'Eventbro brings events, organizers, locations, tickets, and attendee tools into one focused experience so visitors can move from browsing to booking with less friction.',
      },
      {
        title: 'Built for organizers',
        body: 'Organizers can manage event details, ticket types, orders, check-in workflows, promotions, and finance settings from a single dashboard.',
      },
    ],
  },
  {
    slug: 'blog',
    title: 'Eventbro Blog',
    eyebrow: 'Updates',
    description:
      'Stories, product notes, and practical ideas for running better events and building stronger attendee experiences.',
    sections: [
      {
        title: 'Product updates',
        body: 'Follow improvements to event discovery, checkout, organizer tools, ticket design, check-in, and marketing workflows.',
      },
      {
        title: 'Event playbooks',
        body: 'We share practical guidance for planning launches, selling tickets, communicating with attendees, and making event operations easier.',
      },
    ],
  },
  {
    slug: 'help',
    title: 'Help Center',
    eyebrow: 'Support',
    description:
      'Find quick answers for browsing events, buying tickets, creating events, managing orders, and checking in attendees.',
    sections: [
      {
        title: 'For attendees',
        body: 'Browse events from the homepage, use search and city filters, save events you like, and access purchased tickets from your account.',
      },
      {
        title: 'For organizers',
        body: 'Organizer accounts can create events, configure ticket types, track orders, scan QR codes, and manage payouts from the organization dashboard.',
      },
      {
        title: 'Contact support',
        body: 'Need direct help? Email support@eventbro.com and include your account email, event name, and a short description of the issue.',
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    eyebrow: 'Legal',
    description:
      'These terms explain the basic rules for using Eventbro as an attendee, organizer, or platform administrator.',
    sections: [
      {
        title: 'Using the platform',
        body: 'You agree to provide accurate account and event information, follow applicable laws, and avoid activity that harms attendees, organizers, or the platform.',
      },
      {
        title: 'Tickets and payments',
        body: 'Organizers are responsible for event accuracy, ticket availability, refund policies, and fulfillment. Payment processing may be handled by third-party providers.',
      },
      {
        title: 'Account access',
        body: 'You are responsible for keeping your login credentials secure. Eventbro may restrict access when an account violates platform policies or permission rules.',
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    description:
      'This policy summarizes how Eventbro handles personal information used for accounts, ticketing, organizer tools, and support.',
    sections: [
      {
        title: 'Information we collect',
        body: 'We collect account details, event activity, ticket purchase information, organizer profile data, and technical information needed to operate the service.',
      },
      {
        title: 'How we use data',
        body: 'Data is used to authenticate accounts, process tickets, show relevant events, help organizers manage orders, prevent abuse, and provide support.',
      },
      {
        title: 'Your choices',
        body: 'You can update account information from your profile or contact support to request help with data access, correction, or deletion.',
      },
    ],
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    eyebrow: 'Plans',
    description:
      'Eventbro keeps pricing straightforward so organizers can launch events and understand the tools available for selling tickets.',
    sections: [
      {
        title: 'Start with the essentials',
        body: 'Create events, publish ticket types, receive orders, and manage attendee check-in with the core organizer workflow.',
      },
      {
        title: 'Scale with event operations',
        body: 'Marketing tools, finance settings, ticket design, promotions, and reporting help teams manage larger event programs.',
      },
    ],
  },
  {
    slug: 'sell-tickets-online',
    title: 'Sell Tickets Online',
    eyebrow: 'Organizer tools',
    description:
      'Create ticket types, set quantities, define pricing, and guide attendees through a simple online checkout flow.',
    sections: [
      {
        title: 'Flexible ticket setup',
        body: 'Offer general admission, VIP access, early bird pricing, limited quantities, and custom descriptions for each ticket type.',
      },
      {
        title: 'Order visibility',
        body: 'Track purchases, attendee details, ticket status, and order history from the organizer dashboard.',
      },
    ],
  },
  {
    slug: 'event-management',
    title: 'Event Management',
    eyebrow: 'Organizer tools',
    description:
      'Plan, publish, promote, and operate events from one dashboard designed for everyday organizer workflows.',
    sections: [
      {
        title: 'Manage every event state',
        body: 'Draft events before launch, publish when ready, and keep completed or cancelled events organized for reporting.',
      },
      {
        title: 'Keep operations connected',
        body: 'Event details, tickets, promotions, orders, check-in, and finance settings work together inside the organizer area.',
      },
    ],
  },
  {
    slug: 'virtual-events',
    title: 'Virtual Events',
    eyebrow: 'Event formats',
    description:
      'Support online and hybrid event experiences with clear event pages, ticketing, attendee communication, and organizer controls.',
    sections: [
      {
        title: 'Easy discovery',
        body: 'Virtual events can be promoted with the same event discovery tools used for city-based events and organizer profiles.',
      },
      {
        title: 'Ticket access',
        body: 'Attendees can keep tickets in their account and organizers can use the same order management workflows for online sessions.',
      },
    ],
  },
  {
    slug: 'qr-codes-for-events',
    title: 'QR Codes for Events',
    eyebrow: 'Check-in',
    description:
      'Use QR-coded tickets to make entry faster and give organizers better visibility into attendee arrival status.',
    sections: [
      {
        title: 'Scan tickets on site',
        body: 'Organizer check-in tools help validate tickets and mark attendees as checked in during live event operations.',
      },
      {
        title: 'Designed for digital tickets',
        body: 'Ticket previews and QR codes are built into the attendee ticket experience so entry information stays easy to access.',
      },
    ],
  },
]

export function getFooterPage(slug: string) {
  return footerPages.find((page) => page.slug === slug) ?? null
}
