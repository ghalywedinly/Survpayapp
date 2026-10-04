// Decorative composite illustration for the Trust section: a shield/check
// centerpiece with three orbiting capability badges (verified, secure,
// rated). Hand-built to match the site's line-icon language (24px grid,
// 1.8 stroke, rounded caps) rather than generated art, so it stays crisp
// and on-brand at any size. Purely visual — aria-hidden.
export function TrustBadgeIllustration({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="100" r="88" stroke="white" strokeOpacity="0.08" strokeDasharray="2 6" />

      <circle cx="100" cy="100" r="52" fill="#6f57ff" fillOpacity="0.18" />
      <path
        d="M100 52l30 12v24c0 24-13 38-30 46-17-8-30-22-30-46V64l30-12z"
        fill="#1c1f2b"
        stroke="#a89dff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M86 99l10 10 20-20" stroke="#78e5b0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      <g transform="translate(24 28)">
        <circle r="18" fill="#1c1f2b" stroke="#4c2fd6" strokeWidth="1.5" />
        <path d="M-7 0l5 5 9-9" stroke="#a89dff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g transform="translate(172 44)">
        <circle r="18" fill="#1c1f2b" stroke="#1cb473" strokeWidth="1.5" />
        <rect x="-7" y="-2" width="14" height="11" rx="2.5" stroke="#78e5b0" strokeWidth="2" />
        <path d="M-4 -2v-4a4 4 0 018 0v4" stroke="#78e5b0" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g transform="translate(166 156)">
        <circle r="18" fill="#1c1f2b" stroke="#d6870a" strokeWidth="1.5" />
        <path
          d="M0 -9l2.6 5.6 6.1.7-4.5 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.1 6.1-.7z"
          fill="#fbbf35"
          fillOpacity="0.9"
        />
      </g>
    </svg>
  );
}
