import { ArrowButton, CONTAINER, Embed, Eyebrow, PADDING_GLOBAL, SITE, T_LG, asset } from './ui.jsx'
import { checkGreenBox } from './svgs.js'

/* The original's standalone `.text-color-white` utility sets opacity .7, white, text-align center,
   margin-top 10px and font-size 1.125rem, and it out-cascades `.heading-style-h2` / `.text-size-large`
   (same specificity, later in the file). Verified by rendering the saved page: the H2 computes to
   18px / opacity .7 / centered at 1440px. Reproduced as-is. */
const WHITE = 'text-white opacity-70 text-center mt-[10px]'

const POINTS = [
  'Free, no-commitment benchmark test',
  'Investigate any search request and topic',
  'Compare results side-by-side',
  'Expand your current source coverage',
]

export default function FreeTrialSection() {
  return (
    <div>
      <div className={PADDING_GLOBAL}>
        <div className={CONTAINER}>
          <div className="relative w-full px-[4.5rem] py-[5rem] bg-dark-green border-x-hair border-border tablet:px-[1.5rem] tablet:py-[2.5rem]">
            {/* .grid-2col.gap-5rem.z-index-1 */}
            <div className="relative z-[1] grid grid-cols-[1fr_1fr] auto-cols-fr gap-[5rem] w-full mx-auto pt-[24px] tablet:grid-cols-[1fr] tablet:px-[2rem] mobile-p:gap-[2.5rem]">
              <div className="flex flex-col justify-between items-start gap-[12px] w-full h-full">
                <div className="flex flex-col justify-start items-start gap-[1.25rem] w-full">
                  <Eyebrow green left="6939491eb3d2b172910b35cc_Eyebrow-Icon.svg" right="693949364cde9b1d0482c0ed_Eyebrow-Icon-2.svg">
                    Free Benchmark Trial
                  </Eyebrow>
                  <h2
                    className={`${WHITE} font-display text-[1.125rem] mobile-l:text-[2rem] font-normal leading-[1.2] tracking-[-0.015em]`}
                  >
                    Test your use case with Datashake <span className="text-green font-normal">— for free.</span>
                  </h2>
                </div>
                <div className="w-[28.125rem] h-auto tablet:w-auto">
                  <div className="flex flex-col justify-start items-start gap-[1.25rem] w-full">
                    <div className={`${T_LG} ${WHITE} text-[1.125rem] mobile-l:text-[1.25rem]`}>
                      We’ll run your search to show you how Datashake uncovers more data.
                    </div>
                    <div className="mobile-l:w-full">
                      <ArrowButton href={`${SITE}/demo`} variant="white">
                        Start your free benchmark check
                      </ArrowButton>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-start items-start gap-[3rem] w-full">
                <div className="w-full h-full">
                  <div className={`${T_LG} ${WHITE} text-[1.5rem] leading-[1.3] mobile-p:text-[1.125rem]`}>
                    Detect data gaps in your infrastructure and expand your data coverage seamlessly.
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_1fr] auto-cols-fr gap-0 w-full border-b-hair border-l-hair border-dashed border-white-15 tablet:grid-cols-[1fr]">
                  {POINTS.map((p) => (
                    <div
                      key={p}
                      className="relative z-[1] flex flex-col justify-start items-start gap-[12px] w-full p-[1.5rem] bg-white-3 backdrop-blur-[5px] border-t-hair border-r-hair border-dashed border-white-15 tablet:flex-row mobile-p:flex-col"
                    >
                      <Embed svg={checkGreenBox} className="w-[2rem] min-w-[2rem] h-[2rem] min-h-[2rem]" />
                      <div className={`${T_LG} ${WHITE} text-[1.25rem] font-medium`}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-auto w-full h-[30%]">
              <img
                src={asset('69398bd82470e86fed86a813_Squares-Background-Green.svg')}
                alt=""
                loading="lazy"
                className="block w-full h-full min-h-[1px] object-cover tablet:min-h-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
