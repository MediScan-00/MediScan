export const Logo = ({ uniqueId = 'logo', className = '' }: { uniqueId?: string; className?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 100 100"
         width="100%" height="100%"
         className={className}>
      <defs>
        <clipPath id={`pillTopClip_${uniqueId}`}>
          <polygon points="50,0 100,0 100,100 50,100"/>
        </clipPath>
        <clipPath id={`pillShapeClip_${uniqueId}`}>
          <ellipse cx="50" cy="50" 
            rx="20" ry="36"
            transform="rotate(-45 50 50)"/>
        </clipPath>
      </defs>
      <rect width="100" height="100"
            rx="20" fill="#E4F2EE" className="logo-svg-bg"/>
      <ellipse cx="50" cy="50" rx="20" ry="36"
        fill="#4A7C6F"
        transform="rotate(-45 50 50)"/>
      <ellipse cx="50" cy="50" rx="20" ry="36"
        fill="#6DBF9E"
        transform="rotate(-45 50 50)"
        clipPath={`url(#pillTopClip_${uniqueId})`}/>
      <path
        d="M 34 53 L 39 53
           C 40 53 40.5 50 41.5 46
           C 42.5 42 43 57 44 57
           C 45 57 45.5 50 46.5 47
           C 47.5 44 48 55 49 55
           L 52 55
           C 53 55 53.5 53 54.5 51
           C 55.5 49 56 55 57 55
           L 62 55"
        fill="none" stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#pillShapeClip_${uniqueId})`}
        opacity="0.95"/>
    </svg>
  );
};
