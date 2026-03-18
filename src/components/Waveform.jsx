export default function Waveform({ playing }) {
  return (
    <div className="flex items-center gap-[3px] h-5 ml-auto">
      {[0.4, 1, 0.7, 0.9, 0.5].map((scale, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm bg-[#1db954] origin-bottom h-full ${playing ? 'di-wave-animate' : ''}`}
          style={{ transform: `scaleY(${scale})`, '--scale': scale, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  )
}
