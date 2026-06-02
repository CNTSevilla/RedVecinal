export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logored" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#B71C1C" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="#0d0d0d" stroke="url(#logored)" strokeWidth="6" />
      <path d="M100 30 L120 90 L185 90 L135 130 L155 190 L100 150 L45 190 L65 130 L15 90 L80 90 Z" fill="url(#logored)" opacity="0.9" />
      <path d="M100 50 L112 90 L160 90 L125 118 L140 165 L100 135 L60 165 L75 118 L40 90 L88 90 Z" fill="#0d0d0d" />
      <circle cx="100" cy="100" r="28" fill="url(#logored)" />
      <path d="M85 95 L95 105 L115 85" stroke="#0d0d0d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
