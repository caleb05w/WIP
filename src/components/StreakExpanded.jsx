import RollingDigit from './RollingDigit'
import StreakRive from './StreakRive'
import { ITEM_STRIDE, WINDOW_SIZE, TRACKER_W } from './useStreakDays'

const ANIM_CLASS = {
  entering:      'di-day-enter',
  'entering-left': 'di-day-enter-left',
  exiting:       'di-day-exit',
  'exiting-right': 'di-day-exit-right',
}

function DayCircle({ done, today, status }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ overflow: 'visible' }}>
      {/* Dashed stroke — always visible underneath */}
      <circle cx="7" cy="7" r="5.4" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeDasharray="2.4" />
      {/* Filled circle — overlays on top when done, slightly larger than stroke outer edge */}
      {done && (
        <circle
          cx="7" cy="7" r="6.2"
          fill="white"
          className={today ? 'di-today-pop' : status === 'filling' ? 'di-circle-fill' : ''}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />
      )}
    </svg>
  )
}

export default function StreakExpanded({ count, dir, days, riveKey, colorMode, stateMachine }) {
  const padded = String(count).padStart(2, '0')
  const nonExiting = days.filter(d => d.status !== 'exiting' && d.status !== 'exiting-right')

  return (
    <div className="flex flex-row items-center justify-between w-full h-full px-[22px] box-border di-expanded-enter">

      <div className="flex items-center gap-[10px]">
        <StreakRive
          key={colorMode}
          className="w-[64px] h-[64px] shrink-0"
          replayKey={riveKey}
          src={colorMode === 'gradient' ? '/images/violet-streak.riv' : '/images/streak.riv'}
          stateMachine={stateMachine}
        />
        <div className="flex flex-col gap-0">
          <div className="flex gap-0 text-[24px] font-semibold text-white tabular-nums leading-none">
            <div className={padded[0] === '0' ? 'w-[16px]' : 'w-[13px]'}>
              <RollingDigit key={`t-${padded[0]}-${dir}`} value={padded[0]} dir={dir} />
            </div>
            <RollingDigit key={`u-${padded[1]}-${dir}`} value={padded[1]} dir={dir} />
          </div>
          <span className="text-[14px] font-normal text-[#7d7d7d] tracking-[-3%] whitespace-nowrap">Day Streak</span>
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ width: `${TRACKER_W + 10}px`, height: '64px' }}>
        <div className="absolute inset-y-0 left-[-4px] w-[12px] bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-[0px] w-[12px] bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        {days.map((d) => {
          const leftPx = d.status === 'exiting'        ? 0
                       : d.status === 'exiting-right'  ? (WINDOW_SIZE - 1) * ITEM_STRIDE
                       : nonExiting.indexOf(d) * ITEM_STRIDE

          return (
            <div
              key={d.id}
              className={`absolute top-[0.25rem] flex flex-col items-center gap-[8px] py-[8px] transition-[left] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${ANIM_CLASS[d.status] ?? ''}`}
              style={{ left: `${leftPx + 5}px`, width: '14px', opacity: d.done ? 1 : 0.6 }}
            >
              <span className="text-[14px] text-white leading-none">{d.label}</span>
              <DayCircle done={d.done} today={d.today} status={d.status} />
            </div>
          )
        })}
      </div>

    </div>
  )
}
