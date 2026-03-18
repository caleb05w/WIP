export default function RollingDigit({ value, dir, className = '' }) {
  return (
    <div className={`inline-block overflow-hidden h-[1em] w-fit ${className}`}>
      <span className={`block tracking-[0.02em] ${dir === 'up' ? 'di-digit-up' : dir === 'down' ? 'di-digit-down' : ''}`}>
        {value}
      </span>
    </div>
  )
}
