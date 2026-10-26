import { useId } from 'react'

export default function Logo({ size = 30 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#ff7a59" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <circle cx="14.5" cy="14.5" r="6.5" fill="none" stroke="#fff" strokeWidth="2.6" />
      <path d="M19.5 19.5 24 24" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="12.5" cy="12.5" r="1.6" fill="#fff" />
    </svg>
  )
}
