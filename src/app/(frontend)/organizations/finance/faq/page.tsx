'use client'

const faqs = [
  {
    question:
      'I thought the attendee/ticket buyer was paying the fee. Why did I receive this invoice?',
    answer:
      'We sent you this invoice to collect the Eventbro Service Fees paid by your attendees for the tickets you sold. When using a third-party payment processor (such as PayPal or Stripe), you receive all payments directly into your account, including the service fees.',
  },
  {
    question: 'When is my payment due?',
    answer:
      'Your payment is due within 30 days of the invoice date. The invoice due date is displayed next to the Pay Now button when viewing your invoice.',
  },
  {
    question: 'What do the terms in the invoice section mean?',
    answer:
      'Ticket Sales refers to total sales processed. Eventbro Fee is the service fee per ticket. Invoice Period is the billing timeframe. Price is what you receive per ticket (excluding fees). Payment Received is the total paid by attendees.',
  },
  {
    question: 'How do I see the itemized fees for all of my orders?',
    answer: 'Click on the invoice number to see invoice details for your event.',
  },
  {
    question: 'Can I pay my invoice with my credit/debit card or bank account?',
    answer: 'You can pay online using your credit card, debit card, or PayPal account.',
  },
  {
    question: "Can I send a check if I don't want to pay online?",
    answer:
      'If you collected payment in US dollars, you can pay by check. For events in all other currencies, you must pay online.',
  },
  {
    question: 'Can I pay all of my invoices at once?',
    answer:
      "If you pay online, you can't pay all invoices at once. Each invoice must be processed separately.",
  },
  {
    question: 'What happens if I refund a transaction after I pay my invoice?',
    answer:
      'If you refund an order after the invoice has been generated, the fee credit will automatically be applied to the next invoice.',
  },
  {
    question: 'How often will I receive an invoice?',
    answer:
      'Invoices are sent at the beginning of each month for fees collected in the previous month. There are no recurring monthly, setup, or hidden charges.',
  },
]

export default function FinanceFaqPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Common questions about invoices, fees, and payments</p>

      <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50/50 [&::-webkit-details-marker]:hidden">
              <span className="pr-4">{faq.question}</span>
              <span className="shrink-0 text-zinc-400 transition group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-zinc-50 px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
