import { CONTAINER, Eyebrow, H2, Lottie, PADDING_GLOBAL, SideStripColumn, T_LG } from './ui.jsx'

// .text-wrapper.size-600px: min-width 685px wins over max-width 38.125rem (min > max)
export const SIZE_600 = 'w-full h-full min-w-[685px] max-w-[38.125rem] tablet:min-w-full mobile-l:w-auto mobile-l:min-w-0'
// .flex-h.gap-full.padding-3rem
export const TEXT_ROW =
  'flex justify-between items-end gap-[2rem] w-full px-[3rem] py-[3.75rem] tablet:flex-col tablet:justify-between tablet:items-start mobile-l:gap-[1.5rem] mobile-l:p-[24px]'
// .gap-3col.container-size
export const GAP_3COL =
  'grid grid-cols-[minmax(8rem,8rem)_1fr_minmax(8rem,8rem)] grid-flow-row auto-cols-fr gap-0 place-items-stretch tablet:grid-cols-[1fr]'

export default function ProblemSection() {
  return (
    <div>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} border-x-hair border-border`}>
          <div className="w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
            <div className="flex flex-col justify-start items-start gap-[1.5rem] w-full">
              <Eyebrow left="6969128db4c4691effcdf50f_Red-eyebrow-right.svg" right="6969128626f2de4821c55b3c_Red-Eyebrow-left.svg">
                The Problem
              </Eyebrow>
              <div className={SIZE_600}>
                <h2 className={H2}>You’re making decisions on incomplete data foundations</h2>
                <div className="w-full pt-[1rem]" />
                <div className={`${T_LG} text-[1.5rem] mobile-p:text-[1.25rem] text-grey-v2 max-w-[40rem]`}>
                  Public data powers modern business decisions, yet most teams rely on fragile, stitched-together systems to collect it.
                </div>
              </div>
            </div>
          </div>
          <div className={`${GAP_3COL} border-b-hair border-border`}>
            <SideStripColumn />
            <div className="flex flex-col justify-start items-start gap-[12px] w-full h-auto">
              <div className="w-full h-auto max-h-none">
                <div className="relative z-[1] w-full h-[.5px] min-h-[.5px] bg-border" />
                {/* IX2 a-12 Lottie-Problem: on scroll into view, 0→93% over 10s linear */}
                <Lottie name="problem" src="/lottie/problem.json" ix={{ to: 93, duration: 10000 }} />
                <div className="relative z-[1] w-full h-[.5px] min-h-[.5px] bg-border" />
              </div>
              <div className={TEXT_ROW}>
                <div className={SIZE_600}>
                  <div className={`${T_LG} text-[1.25rem] mobile-p:text-[1.125rem] text-grey-v2 max-w-[40rem]`}>
                    Juggling multiple providers means your team is always fixing something. Different data formats drain engineering hours,
                    coverage gaps mean missing critical data daily. And when a provider's API changes or a platform goes down, your entire
                    pipeline breaks – taking insights and decisions with it.
                  </div>
                </div>
              </div>
            </div>
            <SideStripColumn right />
          </div>
        </div>
      </div>
    </div>
  )
}
