function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="5" y="5" width="90" height="70" rx="18" fill="#7c3aed"/>
      <path d="M20 73 L10 90 L30 73 Z" fill="#7c3aed"/>
      <path d="M68 18 L52 48 L62 48 L50 75 L74 38 L63 38 Z" fill="white"/>
    </svg>
  );
}

export default Logo;