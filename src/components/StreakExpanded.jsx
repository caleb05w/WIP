import RollingDigit from './RollingDigit'
import StreakRive from './StreakRive'
import { ITEM_STRIDE, WINDOW_SIZE, TRACKER_W } from './useStreakDays'

export default function StreakExpanded({ count, dir, days, riveKey }) {
  const padded = String(count).padStart(2, '0')
  const nonExiting = days.filter(d => d.status !== 'exiting' && d.status !== 'exiting-right')

  return (
    <div className="flex flex-row items-center justify-between w-full h-full px-[22px] box-border di-expanded-enter">
      <div className="flex items-center gap-3">
        <StreakRive className="w-[72px] h-[72px] shrink-0" replayKey={riveKey} />
        <div className="flex flex-col gap-1">
          <div className="flex gap-[0.1px] text-[22px] font-bold text-white tabular-nums leading-none">
            <RollingDigit key={`t-${padded[0]}-${dir}`} value={padded[0]} dir={dir} />
            <RollingDigit key={`u-${padded[1]}-${dir}`} value={padded[1]} dir={dir} />
          </div>
          <span className="text-[12px] font-normal text-[#7d7d7d] whitespace-nowrap">Day Streak</span>
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ width: `${TRACKER_W}px`, height: '32px' }}>
        {days.map((d) => {
          const leftPx = d.status === 'exiting'       ? 0
                       : d.status === 'exiting-right' ? (WINDOW_SIZE - 1) * ITEM_STRIDE
                       : nonExiting.indexOf(d) * ITEM_STRIDE

          const animClass = d.status === 'entering'      ? 'di-day-enter'
                          : d.status === 'entering-left' ? 'di-day-enter-left'
                          : d.status === 'exiting'       ? 'di-day-exit'
                          : d.status === 'exiting-right' ? 'di-day-exit-right'
                          : ''

          return (
            <div
              key={d.id}
              className={`absolute top-0 flex flex-col items-center gap-[4.5px] transition-[left] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${animClass}`}
              style={{ left: `${leftPx}px` }}
            >
              <span className="text-[9px] text-white/45 leading-none">{d.label}</span>
              <div className={`rounded-full box-border ${
                d.done
                  ? `bg-white border-none ${d.today ? 'w-[17px] h-[17px] di-today-pop' : `w-3.5 h-3.5${d.status === 'filling' ? ' di-circle-fill' : ''}`}`
                  : 'w-3.5 h-3.5 border-[1.5px] border-dashed border-white/30 bg-transparent'
              }`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
