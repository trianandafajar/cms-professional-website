export default function FinanceFaqPage() {
  return (
    <div className="space-y-8 px-10 py-6 max-h-[calc(100vh-253px)] min-h-[calc(100vh-253px)] overflow-y-auto">
      <h1 className="text-3xl font-bold text-[#1E0A3C]">Invoice FAQ</h1>

      <div className="space-y-8 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            I thought the attendee/ticket buyer was paying the fee. Why did I receive this invoice?
          </h2>

          <p>
            We sent you this invoice to collect the EventBro Service Fees paid by your attendees for
            the tickets you sold. When using a third-party payment processor (such as PayPal, Google
            Checkout, or Authorize.net) or an offline payment method, you receive all payments
            directly into your account. This includes the EventBro Service Fees that your attendees
            paid (whether the fees were passed on to your attendee or included in the ticket price).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">When is my payment due?</h2>

          <p>
            Your payment is due within 30 days of the invoice date. The invoice due date is
            displayed next to the Pay Now button when viewing your invoice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            What do the terms in the invoice section of my account mean?
          </h2>

          <ul className="list-disc space-y-2 pl-6">
            <li>
              Ticket Sales refers to the total amount of sales processed through EventBro for a
              given invoice or event. This number does not include EventBro Fees.
            </li>

            <li>EventBro Fee is a small service fee we charge for every ticket you sell.</li>

            <li>Invoice Period is the timeframe for which you are being invoiced.</li>

            <li>
              Price is the amount of money that you as the event organizer will receive per ticket.
              It does not include EventBro Fees.
            </li>

            <li>
              Payment Received refers to the amount of money paid by the attendee for an order.
            </li>

            <li>
              Taxes Collected is the total amount of taxes collected for all orders within an event.
            </li>

            <li>Tax refers to the amount of tax charged for a given order.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            How do I see the itemized fees for all of my orders?
          </h2>

          <p>Click on the invoice number to see invoice details for your event.</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            Can I pay my invoice with my credit/debit card or directly from my bank account?
          </h2>

          <p>You can pay online using your credit card, debit card, or PayPal account.</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            If I don't want to pay this invoice online, can I send you a check in the mail?
          </h2>

          <p>
            If you collected payment in US dollars for your event, you can pay by check. For events
            in all other currencies, you must pay online.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            Can I pay all of my invoices at once?
          </h2>

          <p>
            If you pay online, you can't pay all of your invoices at once. You'll have to process
            each invoice separately.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            I already sent in a check payment for an invoice. Why did I receive this invoice
            notification?
          </h2>

          <p>
            It takes about 10 business days from the time payment is received for your account to be
            updated. If you already sent payment, you may disregard the notice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            What happens if I refund a transaction after I pay my invoice?
          </h2>

          <p>
            If you refund an order after the invoice has been generated for that month, the fee
            credit will automatically be applied to the next invoice we issue.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-[#1E0A3C]">
            How often will I receive an invoice?
          </h2>

          <p>
            Invoices are sent at the beginning of each month for fees collected in the previous
            month. There are no recurring monthly, setup, or hidden charges.
          </p>
        </section>
      </div>
    </div>
  )
}
