'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    articles: [
      {
        title: 'What is Eventbro?',
        content:
          'Eventbro is a comprehensive event management and ticketing platform designed for organizers who want to create, promote, and sell tickets for events of any size. From small meetups to large conferences, Eventbro provides all the tools you need to manage your events professionally.',
      },
      {
        title: 'Creating your account',
        content:
          'To get started, sign up with your email address and password at /auth/signup. After registration, you will be guided through an onboarding process where you can select your preferred location and event categories. This helps us personalize your experience and recommend relevant events.',
      },
      {
        title: 'Becoming an organizer',
        content:
          'During onboarding or from your account settings, you can enable the "Organizer" role. This gives you access to the Organizer Dashboard where you can create events, manage orders, design tickets, run marketing campaigns, and track your finances. Organizers have a separate workspace from attendees.',
      },
      {
        title: 'Understanding roles',
        content:
          'Eventbro has two primary roles: Attendee and Organizer. Attendees can browse events, purchase tickets, manage their orders, and save liked events. Organizers have access to the full event management suite including event creation, order management, ticket design, marketing tools, and financial reporting. Each role has its own dedicated dashboard and navigation.',
      },
    ],
  },
  {
    id: 'organizer-dashboard',
    title: 'Organizer Dashboard',
    articles: [
      {
        title: 'Dashboard overview',
        content:
          'The Organizer Dashboard (/organizations/dashboard) is your command center. It provides a high-level overview of your event performance including total ticket sales, revenue, upcoming events, and recent orders. Use the sidebar navigation to access all organizer features.',
      },
      {
        title: 'Navigating the sidebar',
        content:
          'The left sidebar provides quick access to all organizer tools: Dashboard (home), Events (create and manage), Orders (view purchases), Ticket Designer (customize ticket appearance), Marketing (promotions and campaigns), Finance (payouts and settings), Settings (account configuration), and Help (this page).',
      },
    ],
  },
  {
    id: 'events',
    title: 'Event Management',
    articles: [
      {
        title: 'Creating a new event',
        content:
          'Navigate to Events > Create Event or click "Create Event" in the top navigation. Fill in your event details including title, description, date and time, location, category, and cover image. You can save as draft and publish later, or publish immediately.',
      },
      {
        title: 'Managing existing events',
        content:
          'The Events page (/organizations/events) shows all your events in either list or calendar view. You can filter by status (draft, published, completed), search by name, and sort by date. Click on any event to edit its details, manage tickets, or view analytics.',
      },
      {
        title: 'Event editor',
        content:
          'The event editor allows you to modify all aspects of your event: basic information (title, description, category), scheduling (date, time, timezone), location (venue name, address, city), media (cover image, gallery), and ticketing (ticket types, pricing, quantity limits).',
      },
      {
        title: 'List vs Calendar view',
        content:
          'Toggle between List and Calendar views on the Events page. List view shows events in a table format with key details at a glance. Calendar view displays events on a monthly calendar, making it easy to visualize your event schedule and avoid conflicts.',
      },
      {
        title: 'Event statuses',
        content:
          'Events can have the following statuses: Draft (not visible to public, still being edited), Published (live and visible to attendees, tickets available for purchase), and Completed (event date has passed). You can change status from the event editor.',
      },
    ],
  },
  {
    id: 'tickets',
    title: 'Tickets & Pricing',
    articles: [
      {
        title: 'Setting up ticket types',
        content:
          'Each event can have multiple ticket types (e.g., General Admission, VIP, Early Bird). For each type, set the name, price, quantity available, and optional description. You can also set sale start and end dates to create time-limited offers.',
      },
      {
        title: 'Ticket Designer',
        content:
          'The Ticket Designer (/organizations/ticket-designer) lets you customize the visual appearance of your tickets. Design branded tickets with your logo, event artwork, and custom colors. These designs are used for digital tickets sent to attendees and for check-in at the venue.',
      },
      {
        title: 'Pricing strategies',
        content:
          'Consider offering early bird pricing to incentivize early purchases, tiered pricing for different experience levels (General, VIP, Premium), and group discounts for bulk purchases. You can create promotional codes in the Marketing section to offer percentage or fixed-amount discounts.',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Order Management',
    articles: [
      {
        title: 'Viewing orders',
        content:
          'The Orders page (/organizations/orders) displays all ticket purchases for your events. Each order shows the order ID, buyer information, event name, ticket type, quantity, total amount, payment status, and date. Orders are updated in real-time as purchases are made.',
      },
      {
        title: 'Filtering and searching orders',
        content:
          'Use the search bar to find orders by ID, buyer name, or email. Filter by status (All, Completed, Pending, Refunded) using the toggle buttons. Use the Event dropdown to filter orders by specific event. Click column headers (Buyer, Total, Date) to sort ascending or descending.',
      },
      {
        title: 'Order details',
        content:
          'Click "View" on any order to see full details including buyer contact information, ticket breakdown, payment method, transaction ID, and check-in status. From the detail page you can process refunds, resend confirmation emails, or update check-in status.',
      },
      {
        title: 'Exporting orders',
        content:
          'Click the "Export" button to download your orders as a CSV file. The export respects your current filters, so you can export orders for a specific event, status, or date range. Use exported data for accounting, attendee lists, or integration with other tools.',
      },
      {
        title: 'Check-in management',
        content:
          'Track attendee check-ins from the Orders page. The check-in column shows whether each ticket holder has arrived at the event. You can update check-in status manually from the order detail page or use the Eventbro mobile app for on-site scanning.',
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing & Promotions',
    articles: [
      {
        title: 'Marketing dashboard',
        content:
          'The Marketing section (/organizations/marketing) provides tools to promote your events and drive ticket sales. Access the marketing dashboard for an overview of campaign performance, email engagement, and promotional code usage.',
      },
      {
        title: 'Promotions and discount codes',
        content:
          'Create promotional codes (/organizations/marketing/promotions) to offer discounts on your events. Set percentage or fixed-amount discounts, usage limits, expiration dates, and restrict codes to specific events or ticket types. Share codes through email campaigns, social media, or partner channels.',
      },
      {
        title: 'Email templates',
        content:
          'Design custom email templates (/organizations/marketing/email-template) for event announcements, reminders, and follow-ups. Use the template editor to customize subject lines, body content, and call-to-action buttons. Templates can be reused across multiple events.',
      },
      {
        title: 'Campaign analytics',
        content:
          'Track the performance of your marketing efforts from the marketing dashboard. View metrics like email open rates, click-through rates, promotional code redemptions, and conversion rates. Use these insights to optimize future campaigns.',
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finance & Payouts',
    articles: [
      {
        title: 'Finance overview',
        content:
          'The Finance section (/organizations/finance) provides complete financial visibility into your event revenue. View summary cards showing total gross revenue, net revenue (after fees), and total platform fees. Toggle between "By payout" and "By event" views.',
      },
      {
        title: 'Payouts',
        content:
          'The Payouts tab shows all completed and pending transfers to your connected payment account. Each payout displays the associated event, gross amount, fees deducted, net amount received, status (Paid, Pending, Processing), and date. Use filters to narrow results by date range, status, or event.',
      },
      {
        title: 'Upcoming payouts',
        content:
          'The Upcoming tab shows scheduled payouts that have not yet been transferred. This helps you forecast incoming revenue and plan accordingly. Scheduled payouts are processed automatically based on your payment provider settings.',
      },
      {
        title: 'Invoices FAQ',
        content:
          'The Invoices tab provides answers to common questions about billing, fees, and payment terms. Learn about service fee structure, payment due dates, invoice terminology, payment methods, and refund policies.',
      },
      {
        title: 'Payment account settings',
        content:
          'Navigate to Finance > Settings > Payment Accounts to connect your Stripe or PayPal account. This is required to receive payouts from ticket sales. The connection process is secure and takes less than 2 minutes. You can disconnect and reconnect accounts at any time.',
      },
      {
        title: 'Taxpayer information',
        content:
          'Under Finance > Settings > Taxpayer Info, provide your tax details for compliance purposes. This information should match your connected payment account details. Accurate taxpayer information prevents delays in payout processing and ensures proper tax document generation.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Account Settings',
    articles: [
      {
        title: 'Organization settings',
        content:
          'Access your organization settings at /organizations/settings. Configure your organization name, description, logo, contact information, and notification preferences. These details appear on your public organizer profile and in communications with attendees.',
      },
      {
        title: 'Profile management',
        content:
          'Update your personal profile including display name, bio, website, and social media links. Your profile is visible to attendees who view your organizer page. A complete profile builds trust and helps attendees discover your events.',
      },
      {
        title: 'Notification preferences',
        content:
          'Configure which notifications you receive and how. Options include email notifications for new orders, refund requests, event reminders, and marketing reports. You can also enable in-app notifications accessible from the bell icon in the top navigation.',
      },
    ],
  },
  {
    id: 'attendee-features',
    title: 'Attendee Features',
    articles: [
      {
        title: 'Browsing events',
        content:
          'The homepage displays featured events, events by city, and recommended events based on your preferences. Use the search bar to find events by name, or filter by location using the location selector. Browse organizer profiles to discover events from your favorite organizers.',
      },
      {
        title: 'Purchasing tickets',
        content:
          'Navigate to an event page and click on the ticket type you want. Select quantity, review the order summary including any fees, and proceed to checkout. After successful payment, you will receive a confirmation email with your digital tickets.',
      },
      {
        title: 'Managing your tickets',
        content:
          'Access your purchased tickets at /my/tickets. View all upcoming and past event tickets, download digital tickets for entry, and check event details. Each ticket includes a QR code for venue check-in.',
      },
      {
        title: 'Order history',
        content:
          'View your complete purchase history at /my/orders. See order details including ticket types, quantities, amounts paid, and order status. Click on any order to view the full receipt and ticket details.',
      },
      {
        title: 'Liked events',
        content:
          'Save events you are interested in by clicking the heart icon. Access all your liked events at /my/likes. This helps you keep track of events you want to attend and makes it easy to return to them when you are ready to purchase tickets.',
      },
      {
        title: 'Profile settings',
        content:
          'Update your attendee profile at /my/profile. Change your display name, bio, and other personal information. Your profile helps organizers identify you for check-in and personalized communications.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    articles: [
      {
        title: 'Account security',
        content:
          'Your account is protected by a secure password. We recommend using a strong, unique password that combines letters, numbers, and special characters. Never share your login credentials with others. If you suspect unauthorized access, change your password immediately.',
      },
      {
        title: 'Payment security',
        content:
          'All payment processing is handled through trusted providers (Stripe and PayPal). Eventbro never stores your full credit card details. Transactions are encrypted using industry-standard TLS encryption. Payment provider connections use OAuth for secure authorization.',
      },
      {
        title: 'Data privacy',
        content:
          'We collect only the information necessary to provide our services. Your personal data is never sold to third parties. Organizers can see buyer information for their events only. You can request data export or account deletion by contacting support.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    articles: [
      {
        title: 'I cannot access my dashboard',
        content:
          'Ensure you are logged in with the correct account. If you are an organizer trying to access /organizations/*, verify that your account has the organizer role enabled. If you are an attendee, your dashboard is at /my/tickets. Clear your browser cache and cookies if issues persist.',
      },
      {
        title: 'My payout is delayed',
        content:
          'Payouts are processed according to your payment provider schedule (typically 2-7 business days). Ensure your payment account is properly connected in Finance > Settings. Verify that your taxpayer information matches your payment account details. Contact support if a payout is overdue by more than 7 business days.',
      },
      {
        title: 'I cannot create an event',
        content:
          'Event creation requires an organizer account. If you do not see the "Create Event" option, ensure your account has the organizer role enabled. All required fields (title, date, location, at least one ticket type) must be filled before publishing.',
      },
      {
        title: 'Attendees are not receiving tickets',
        content:
          'Confirmation emails with tickets are sent automatically after successful payment. Ask attendees to check their spam/junk folder. Ensure the buyer email address is correct in the order details. You can resend confirmation emails from the order detail page.',
      },
      {
        title: 'I need to process a refund',
        content:
          'Navigate to Orders, find the relevant order, and click "View" to open the detail page. From there you can initiate a refund. Refunds are processed through the original payment method and may take 5-10 business days to appear on the buyer statement. Platform fees may or may not be refunded depending on your plan.',
      },
      {
        title: 'My event is not appearing in search',
        content:
          'Only published events appear in search results and on the homepage. Ensure your event status is "Published" (not "Draft"). Events also need a valid future date, at least one available ticket type, and a cover image for best visibility.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Support',
    articles: [
      {
        title: 'Getting help',
        content:
          'If you cannot find the answer to your question in this help center, you can reach our support team through the following channels: Email support at support@eventbro.com, in-app chat available during business hours, or through the feedback form in your account settings.',
      },
      {
        title: 'Reporting issues',
        content:
          'To report a bug or technical issue, please include: a description of what happened, what you expected to happen, the page URL where the issue occurred, your browser and device information, and any error messages you saw. Screenshots are helpful for visual issues.',
      },
      {
        title: 'Feature requests',
        content:
          'We welcome feedback and feature suggestions from our community. Submit feature requests through the feedback form or email us at feedback@eventbro.com. We review all suggestions and prioritize based on community demand and platform roadmap.',
      },
    ],
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const filteredSections = sections
    .map((section) => ({
      ...section,
      articles: section.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.content.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((section) => section.articles.length > 0)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Help Center</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Everything you need to know about using Eventbro
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles..."
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#5151eb]"
        />
      </div>

      {/* Table of Contents */}
      {!search && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-[#5151eb]/30 hover:text-[#5151eb]"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-8">
        {filteredSections.map((section) => (
          <div key={section.id} id={section.id}>
            <h2 className="mb-4 text-xl font-bold text-zinc-900">{section.title}</h2>
            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
              {section.articles.map((article, idx) => (
                <details
                  key={idx}
                  className="group"
                  open={activeSection === `${section.id}-${idx}`}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      setActiveSection(`${section.id}-${idx}`)
                    } else if (activeSection === `${section.id}-${idx}`) {
                      setActiveSection(null)
                    }
                  }}
                >
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50/50 [&::-webkit-details-marker]:hidden">
                    <span className="pr-4">{article.title}</span>
                    <span className="shrink-0 text-zinc-400 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-zinc-50 px-5 py-4">
                    <p className="text-sm leading-relaxed text-zinc-600">{article.content}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {search && filteredSections.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
          <h3 className="text-base font-semibold text-zinc-900">No articles found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Try a different search term or browse the topics above
          </p>
        </div>
      )}

      {/* Contact footer */}
      <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-zinc-800">Still need help?</p>
        <p className="mt-1 text-sm text-zinc-500">
          Contact our support team at{' '}
          <a href="mailto:support@eventbro.com" className="font-medium text-[#5151eb]">
            support@eventbro.com
          </a>
        </p>
      </div>
    </div>
  )
}
