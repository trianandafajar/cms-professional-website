import Image from 'next/image'

export default function AdminGraphicsLogo() {
  return (
    <div className="payload-brand-logo">
      <Image
        className="payload-brand-logo__image"
        src="/icon.png"
        width={40}
        height={40}
        alt="Eventbro"
      />
      <span className="payload-brand-logo__text">eventbro</span>
    </div>
  )
}
