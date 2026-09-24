import { ArrowButton, CONTAINER, H2, PADDING_GLOBAL, SITE, T_MED, asset } from './ui.jsx'

export default function FinalCta() {
  return (
    <section>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} relative overflow-auto border-x-hair border-border`}>
          <div className="relative w-full h-[550px] pt-[6rem] bg-light-green mobile-l:h-auto mobile-l:pb-[6rem] mobile-l:px-[1.5rem] mobile-p:pt-[3rem] mobile-p:pb-[3rem]">
            {/* .text-wrapper.size-550px.align-center.z-index-1.mobile-padding */}
            <div className="relative z-[1] w-[34.375rem] min-w-[34.375rem] h-auto mx-auto pt-[24px] tablet:w-full tablet:min-w-0 tablet:px-[1.5rem] mobile-l:w-auto">
              <div className="flex flex-col justify-start items-center gap-[1.25rem] w-full">
                <h2 className={`${H2} text-center`}>Book a call with one of our data experts</h2>
                <div className={`${T_MED} text-black text-center font-medium`}>
                  Schedule a quick call to see how Datashake can power your platform’s next leap
                </div>
                <div className={`${T_MED} text-grey-v2 text-center`}>Trusted by enterprise brands and data platforms worldwide</div>
                <div className="mobile-l:w-full">
                  <div className="w-full pt-[2rem]" />
                  <ArrowButton href={`${SITE}/demo`}>Book a demo</ArrowButton>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 w-full h-full">
              <img
                src={asset('695442158ff7e237e5f5e875_CTA-Background.webp')}
                alt="White background with thin dashed green lines connecting small solid green rectangles in a stepped pattern across the image."
                loading="lazy"
                className="block w-full h-full min-h-[1px] object-cover tablet:min-h-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
