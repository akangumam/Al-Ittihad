export function SchoolLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg, #2E6B22, #3E8A2F)',
        border: '2px solid #F6B31E',
        boxShadow: '0 2px 8px rgba(62,138,47,0.30)',
      }}
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 8-pointed Islamic star */}
        <path
          d="M12 2.5 L13.6 8.4 L19.5 6 L15.6 10.8 L21.5 12 L15.6 13.2 L19.5 18 L13.6 15.6 L12 21.5 L10.4 15.6 L4.5 18 L8.4 13.2 L2.5 12 L8.4 10.8 L4.5 6 L10.4 8.4 Z"
          fill="#F6B31E"
        />
        <circle cx="12" cy="12" r="3" fill="white" />
        <circle cx="12" cy="12" r="1.5" fill="#3E8A2F" />
      </svg>
    </div>
  );
}
