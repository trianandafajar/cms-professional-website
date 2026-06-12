import Image from 'next/image'

export default function AdminGraphicsIcon() {
  return (
    <span className="payload-brand-icon" aria-hidden="true">
      <Image src="/icon.png" alt="" width={20} height={20} />
    </span>
  )
}
