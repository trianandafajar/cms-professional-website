'use client'

import { Calendar, Clock, MapPin, User, Sparkles } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { type TicketConfig, getTicketBackground } from '@/lib/ticket-designs'

const sampleEvent = {
  name: 'Indonesia Creative Summit 2026',
  date: '28 June 2026',
  time: '09:00 WIB',
  venue: 'JCC, Jakarta',
}

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

interface TicketPreviewProps {
  config: TicketConfig
  designName: string
  /** Scale factor for the ticket (default 1). Use < 1 for thumbnails */
  scale?: number
  eventName?: string
  eventDate?: string
  eventTime?: string
  venue?: string
  attendee?: string
  status?: string
  ticketCode?: string
  qrValue?: string
}

export default function TicketPreviewCard({
  config,
  designName,
  scale = 1,
  eventName = sampleEvent.name,
  eventDate = sampleEvent.date,
  eventTime = sampleEvent.time,
  venue = sampleEvent.venue,
  attendee = 'Alex Johnson',
  status = 'Ready to scan',
  ticketCode = 'TKT-PREVIEW-001',
  qrValue = 'https://eventbro.id/checkin/TKT-PREVIEW-001',
}: TicketPreviewProps) {
  const bgStyle = getTicketBackground(config)
  const w = config.width * scale
  const h = (config.orientation === 'vertical' ? config.height + 200 : config.height) * scale

  return (
    <div
      style={{
        ...bgStyle,
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: `${config.borderRadius * scale}px`,
        padding: `${config.padding * scale}px`,
      }}
      className="relative overflow-hidden"
    >
      {config.showDecoCircles && (
        <>
          <div
            className="pointer-events-none absolute -right-16 -top-16 rounded-full bg-white/5"
            style={{ width: 56 * scale * 4, height: 56 * scale * 4 }}
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-12 rounded-full bg-white/5"
            style={{ width: 40 * scale * 4, height: 40 * scale * 4 }}
          />
          <div
            className="pointer-events-none absolute right-1/4 top-1/3 rounded-full bg-white/3"
            style={{ width: 24 * scale * 4, height: 24 * scale * 4 }}
          />
        </>
      )}
      {config.bgType === 'image' && (
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
      )}

      <div
        className={`relative flex h-full ${config.orientation === 'vertical' ? 'flex-col' : 'flex-row items-stretch'}`}
        style={{ gap: `${6 * scale * 4}px` }}
      >
        {/* Info */}
        <div
          className={`flex flex-1 flex-col justify-between ${config.qrPosition === 'left' ? 'order-2' : 'order-1'}`}
        >
          <div>
            <div
              style={{
                backgroundColor: config.badgeBg,
                color: config.badgeText,
                fontSize: `${Math.max(9, 12 * scale)}px`,
                padding: `${4 * scale}px ${12 * scale}px`,
              }}
              className="inline-flex items-center gap-1 rounded-full font-semibold"
            >
              <Sparkles size={Math.max(8, 11 * scale)} />
              {designName}
            </div>
            <h3
              style={{
                color: config.titleColor,
                fontSize: `${config.titleSize * scale}px`,
                marginTop: `${12 * scale}px`,
              }}
              className="font-bold leading-tight"
            >
              {eventName}
            </h3>
          </div>
          <div
            className="grid grid-cols-2"
            style={{ gap: `${12 * scale}px`, marginTop: `${16 * scale}px` }}
          >
            <TicketDetail
              labelColor={config.labelColor}
              valueColor={config.valueColor}
              icon={<Calendar size={Math.max(8, 12 * scale)} />}
              label="Date"
              value={eventDate}
            />
            <TicketDetail
              labelColor={config.labelColor}
              valueColor={config.valueColor}
              icon={<Clock size={Math.max(8, 12 * scale)} />}
              label="Time"
              value={eventTime}
            />
            <TicketDetail
              labelColor={config.labelColor}
              valueColor={config.valueColor}
              icon={<MapPin size={Math.max(8, 12 * scale)} />}
              label="Venue"
              value={venue}
            />
            <TicketDetail
              labelColor={config.labelColor}
              valueColor={config.valueColor}
              icon={<User size={Math.max(8, 12 * scale)} />}
              label="Attendee"
              value={attendee}
            />
          </div>
          {config.showBranding && (
            <div
              className="flex items-center justify-between"
              style={{ marginTop: `${16 * scale}px` }}
            >
              <p
                style={{ color: config.labelColor, fontSize: `${Math.max(7, 10 * scale)}px` }}
                className="font-medium"
              >
                Powered by eventbro
              </p>
              <p style={{ color: config.labelColor, fontSize: `${Math.max(7, 10 * scale)}px` }}>
                {ticketCode}
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
          className={`flex flex-col items-center justify-center ${config.orientation === 'horizontal' ? '' : 'w-full'} ${config.qrPosition === 'left' ? 'order-1' : 'order-3'}`}
          style={{ width: config.orientation === 'horizontal' ? `${48 * scale * 4}px` : undefined }}
          aria-label={status}
        >
          <div
            style={{
              borderRadius: `${config.qrBorderRadius * scale}px`,
              padding: `${12 * scale}px`,
            }}
            className="bg-white"
          >
            <QRCodeSVG
              value={qrValue}
              size={config.qrSize * scale}
              bgColor={config.qrBgColor}
              fgColor={config.qrFgColor}
              level="H"
              marginSize={0}
            />
          </div>
          <p
            style={{
              color: config.labelColor,
              fontSize: `${Math.max(7, 10 * scale)}px`,
              marginTop: `${8 * scale}px`,
            }}
            className="text-center font-medium"
          >
            Scan for check-in
          </p>
        </div>
      </div>
    </div>
  )
}
