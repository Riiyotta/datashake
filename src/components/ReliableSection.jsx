import { ArrowButton, CONTAINER, Embed, H2, Lottie, PADDING_GLOBAL, SITE, T_LG, T_MED } from './ui.jsx'
import { checkGreen32 } from './svgs.js'

export function CheckRow({ svg, children }) {
  // .horizontal-item
  return (
    <div className="flex gap-[12px] justify-start items-center w-full py-[1rem] border-b-hair border-dashed border-border">
      <Embed svg={svg} className="w-[2rem] min-w-[2rem] h-[2rem] min-h-[2rem]" />
      <div className={`${T_MED} text-black`}>{children}</div>
    </div>
  )
}

export default function ReliableSection() {
  return (
    <section>
      <div className={PADDING_GLOBAL}>
        <div className={CONTAINER}>
          <div className="relative w-full px-[4.5rem] py-[5rem] bg-grey-v1 border-x-hair border-border tablet:px-[1.5rem] tablet:pt-[2.5rem] tablet:pb-0">
            <div className="grid grid-cols-[1fr_1fr] auto-cols-fr gap-[5rem] w-full static tablet:grid-cols-[1fr]">
              <div className="flex flex-col justify-start items-start gap-[12px] w-full">
                <h2 className={H2}>Your most reliable source of social &amp; review data at scale</h2>
                <div className="flex flex-col justify-start items-start gap-[1.25rem] w-full">
                  <div className={`${T_LG} text-[1.25rem] mobile-p:text-[1.125rem] text-grey-v2 max-w-[40rem]`}>
                    Datashake powers the next generation of data-driven solutions — from customer experience and trend analytics to KYC and
                    competitive monitoring.
                  </div>
                  <div className="flex flex-col justify-start items-start gap-[12px] w-full">
                    <CheckRow svg={checkGreen32}>Collect, normalize, and deliver data from different sources</CheckRow>
                    <CheckRow svg={checkGreen32}>Focus on getting insights, not managing infrastructure.</CheckRow>
                  </div>
                  <div className="w-full pt-[.5rem]" />
                  <div className="mobile-l:w-full">
                    <ArrowButton href={`${SITE}/demo`}>Book a demo</ArrowButton>
                  </div>
                </div>
              </div>
            </div>
            {/* .background-image.position-right-bottom.width-50.align-bottom (static, full width ≤991) */}
            <div className="pointer-events-none absolute top-auto right-0 bottom-0 left-auto w-1/2 h-full flex justify-center items-end tablet:static tablet:w-full tablet:mt-[2rem]">
              {/* IX2 e-14: scroll into view (30% offset), 200ms delay, 0→100% at native length */}
              <Lottie name="970-04" src="/lottie/970-04.json" className="w-full h-auto" autoplay ix={{ offset: 30, delay: 200, to: 100, duration: 'auto' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
