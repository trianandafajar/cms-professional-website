'use client'

type SocialAuthButtonsProps = {
  mode?: 'signin' | 'signup'
  onProvider?: (provider: 'google' | 'apple' | 'facebook') => void
}

export function SocialAuthButtons({ mode = 'signin', onProvider }: SocialAuthButtonsProps) {
  const verb = mode === 'signin' ? 'Continue with' : 'Sign up with'

  const handleClick = (provider: 'google' | 'apple' | 'facebook') => () => {
    if (onProvider) {
      onProvider(provider)
    } else {
      // Placeholder until OAuth is wired up
      // eslint-disable-next-line no-console
      console.warn(`OAuth provider "${provider}" not yet configured.`)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled
        onClick={handleClick('google')}
        className="cursor-pointer disabled:cursor-not-allowed flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#12192f] shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
      >
        <GoogleIcon className="size-5" />
        <span>{verb} Google</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          onClick={handleClick('apple')}
          className="cursor-pointer disabled:cursor-not-allowed flex w-full items-center justify-center gap-2 rounded-xl bg-[#12192f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
        >
          <AppleIcon className="size-[18px]" />
          <span>Apple</span>
        </button>
        <button
          type="button"
          disabled  
          onClick={handleClick('facebook')}
          className="cursor-pointer disabled:cursor-not-allowed flex w-full items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f63d4]"
        >
          <FacebookIcon className="size-[18px]" />
          <span>Facebook</span>
        </button>
      </div>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.972 32.91 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.676 6.053 29.082 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.676 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.398 0-9.971-3.066-11.31-7.323l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083 43.595 20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.07-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.27.05.43zM21.5 17.5c-.6 1.4-1.3 2.7-2.3 3.9-1.1 1.4-2.3 2.6-4.2 2.6-1.7 0-2.3-1-4.2-1-1.9 0-2.6 1-4.2 1-1.9 0-3.3-1.3-4.4-2.7C0.4 18.6-.5 14.4 1.4 11.6c1.3-2 3.4-3.2 5.4-3.2 1.7 0 3.2 1.1 4.2 1.1 1 0 2.7-1.1 4.7-1.1.7 0 3.2.1 4.9 2.4-.1.1-2.9 1.7-2.9 5 0 3.9 3.5 5.2 3.5 5.2-.1.3-.4 1.4-.7 2.5z"
      />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.027 1.792-4.7 4.533-4.7 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.255h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  )
}
