export default function NextraLogo({ size = 24, glow = false, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 6px rgba(255,161,22,0.55))" } : undefined}
    >
      <circle cx="16" cy="16" r="14" stroke="#FFA116" strokeWidth="2.5" />
      <path
        d="M12 11L8 16L12 21"
        stroke="#FFA116"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 11L24 16L20 21"
        stroke="#FFA116"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2" fill="#FFA116" />
    </svg>
  );
}