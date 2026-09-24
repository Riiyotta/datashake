import { ArrowButton, CONTAINER, Eyebrow, H2, Lottie, PADDING_GLOBAL, SITE, SideStripColumn, T_LG, T_MED, asset } from './ui.jsx'
import { GAP_3COL, SIZE_600, TEXT_ROW } from './ProblemSection.jsx'

const STATS = [
  ['6954225ff03c26feba9890d0_Uptime-Icon.svg', '98.3% uptime', 'Proven reliability across sources with proactive monitoring'],
  ['69542268db277324767e7b27_Security-Icon.svg', 'Enterprise security', 'Encryption at every step with compliance-ready infrastructure'],
  ['6954227c05f17176c82af1b1_Scale-Icon.svg', 'Massive scale', 'Scale your workflow to hundreds of millions of daily fetches'],
  ['6954228708675a34854006f1_Industry-Icon.svg', 'Industry standard', 'Proven reliability across sources with proactive monitoring'],
  ['69542291ef3d3221396413bf_Coverage-Icon.svg', 'Earned media coverage', 'Detect conversations outside channels you own'],
]

export default function SolutionSection() {
  return (
    <div>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} border-x-hair border-border`}>
          <div className="w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
            <div className="flex flex-col justify-start items-start gap-[1.5rem] w-full">
              <Eyebrow left="6939491eb3d2b172910b35cc_Eyebrow-Icon.svg" right="693949364cde9b1d0482c0ed_Eyebrow-Icon-2.svg">
                The Solution
              </Eyebrow>
              <div className={SIZE_600}>
                <h2 className={H2}>Get the most complete data to power your insights</h2>
                <div className="w-full pt-[1rem]" />
                <div className={`${T_LG} text-[1.5rem] mobile-p:text-[1.25rem] text-black`}>
                  Datashake provides the reliable foundation of public data that your business has always needed.
                </div>
              </div>
            </div>
          </div>
          <div className={GAP_3COL}>
            <SideStripColumn />
            <div className="flex flex-col justify-start items-start gap-[12px] w-full h-auto">
              <div className="w-full h-auto max-h-none">
                {/* IX2 a-14 Lottie-Solution: on scroll into view, 0→98% over 15s easeIn */}
                <Lottie name="solution" src="/lottie/solution.json" className="w-full" ix={{ to: 98, duration: 15000, ease: 'easeIn' }} />
              </div>
              <div className={TEXT_ROW}>
                <div className={SIZE_600}>
                  <div className={`${T_LG} text-[1.25rem] mobile-p:text-[1.125rem] text-grey-v2 max-w-[40rem]`}>
                    We unify 150+ social media and online review sources into one resilient API, standardizing formats and absorbing platform
                    shifts so your pipelines never fail. Data arrives analysis-ready while your team expands coverage without compounding
                    complexity. Infrastructure engineered for the decisions that define your businesses success.
                  </div>
                </div>
                <div className="mobile-l:w-full">
                  <ArrowButton href={`${SITE}/demo`}>See Datashake in action</ArrowButton>
                </div>
              </div>
            </div>
            <SideStripColumn right />
          </div>
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] auto-cols-fr gap-0 tablet:grid-cols-[1fr]">
            {STATS.map(([icon, title, body], i) => (
              <div
                key={title}
                className={`relative z-[1] flex flex-col justify-start items-start gap-[12px] p-[2rem] border-t-hair border-border ${
                  i === STATS.length - 1 ? '' : 'border-r-hair mobile-l:border-r-0'
                }`}
              >
                <div className="flex flex-col justify-start items-start gap-[12px] w-full">
                  <img src={asset(icon)} alt="" loading="lazy" className="block w-[40px] min-w-[40px] h-[40px] min-h-[40px]" />
                  <div className={`${T_LG} text-[1.25rem] font-medium text-black`}>{title}</div>
                </div>
                <div className="flex flex-col justify-start items-start gap-[12px] w-full">
                  <div className={`${T_MED} text-grey-v2`}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
