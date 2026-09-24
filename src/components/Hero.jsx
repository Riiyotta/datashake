import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ArrowButton, CONTAINER, Lottie, OutlineButton, PADDING_GLOBAL, SITE, T_LG, T_SMALL, asset } from './ui.jsx'

// Order and the leading `hide` item are exactly as in the original DOM; the second half is the
// runtime clone set ("cloned-item") the original script appends for the seamless loop-back.
const WORDS = [
  'customer conversations',
  'social media',
  'review sites',
  'app stores',
  'forums',
  'e-commerce platforms',
  'ratings directories',
  '150+ sources',
]

/* Original inline script: itemHeight 53 (>768) / 38 landscape, 48 portrait (≤768) / 36 (≤480);
   per item tl.to(track, { y: -(i+1)*h, duration: 1, ease: "expo.inOut", delay: 1 }), then
   tl.set(track, { y: 0 }); timeline repeat -1; rebuilt on resize (250ms debounce) when h changes. */
function getItemHeight() {
  const width = window.innerWidth
  const height = window.innerHeight
  const isLandscape = width > height
  if (width <= 480) return 36
  if (width <= 768) return isLandscape ? 38 : 48
  return 53
}

function useRotateTimeline(trackRef) {
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let itemHeight = getItemHeight()
    let tl
    const create = () => {
      if (tl) tl.kill()
      gsap.set(track, { y: 0 })
      tl = gsap.timeline({ repeat: -1 })
      WORDS.forEach((_, index) => {
        tl.to(track, { y: -(index + 1) * itemHeight, duration: 1, ease: 'expo.inOut', delay: 1 })
      })
      tl.set(track, { y: 0 })
    }
    create()
    let resizeTimer
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const next = getItemHeight()
        if (next !== itemHeight) {
          itemHeight = next
          create()
        }
      }, 250)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      if (tl) tl.kill()
    }
  }, [trackRef])
}

const ROTATE_TEXT =
  'block opacity-100 h-[53px] text-green tracking-[-1px] whitespace-nowrap font-display text-[48px] font-normal leading-[1.2] tablet:h-[48px] tablet:text-[2.8rem] mobile-l:h-auto mobile-l:text-[38px] mobile-p:h-[36px] mobile-p:text-[2rem]'

export default function Hero() {
  const trackRef = useRef(null)
  useRotateTimeline(trackRef)

  return (
    <div className="border-b-hair border-solid border-border min-h-0">
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} relative overflow-auto border-x-hair border-border`}>
          <div className="w-full pt-[4.5rem]" />
          <div className="grid grid-cols-[1fr_1fr] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr]">
            <div className="w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
              <div className="flex flex-col justify-between items-start gap-[6rem] w-full h-full mobile-p:gap-[2rem]">
                <div className="flex flex-col justify-start items-start gap-[12px] w-full">
                  <div className="flex gap-[12px] justify-start items-center px-[12px] py-[6px] border-hair border-dashed border-border bg-grey-v1 no-underline mobile-l:px-[10px]">
                    <div className={`${T_SMALL} text-grey-v2`}>
                      <a
                        href={`${SITE}/resources/social-data-coverage-report-2026`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-full no-underline"
                      >
                        The Social Data Coverage Report 2026 is here ⚡
                      </a>
                    </div>
                  </div>
                  <div className="relative w-[510px] tablet:pb-[4rem] mobile-l:w-[450px] mobile-p:w-auto">
                    <h1 className="m-0 text-black tracking-[-0.02em] font-display text-[48px] font-normal leading-[1.2] tablet:text-[42px] mobile-l:text-[38px] mobile-p:text-[2rem]">
                      One API. One schema. Cleaned, normalized. Search and filter across
                    </h1>
                    <div className="absolute top-auto bottom-[-48px] w-full h-[52px] overflow-hidden tablet:bottom-auto tablet:h-[48px] mobile-l:h-[38px] mobile-p:h-[36px]">
                      <div ref={trackRef} className="w-full h-full overflow-visible" data-rotate-list="">
                        {[...WORDS, ...WORDS].map((word, i) => (
                          <div key={i} className={`opacity-100 h-auto static ${i % WORDS.length === 0 ? '!hidden' : ''}`}>
                            <div className={ROTATE_TEXT}>{word}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-start items-start gap-[2rem] w-full">
                  <div className="w-[28.125rem] h-auto tablet:w-auto">
                    <div className={`${T_LG} text-[1.25rem] mobile-p:text-[1.125rem] text-grey-v2 max-w-[40rem]`}>
                      Replace multiple vendors with one partner you can trust for comprehensive, fast and scalable data from 150+ sources.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-[1rem] justify-start items-center w-full">
                    <ArrowButton href={`${SITE}/demo`}>Book a demo</ArrowButton>
                    <OutlineButton href={`${SITE}/platform`}>Explore the platform</OutlineButton>
                  </div>
                </div>
              </div>
            </div>
            {/* .image-wrapper.border-left.z-index-1 — .z-index-1 adds padding-top:24px (and 2rem side padding ≤991) */}
            <div className="relative z-[1] w-full h-auto max-h-none mx-auto pt-[24px] border-l-hair border-border tablet:px-[2rem]">
              <div className="absolute inset-0 z-[1] w-full h-full bg-grey-v1">
                {/* IX2 a-13 Lottie-Hero: on scroll into view, 0→93% over 20s linear */}
                <Lottie name="hero" src="/lottie/hero.json" className="w-full h-auto min-h-0" ix={{ to: 93, duration: 20000 }} />
              </div>
              <img
                src={asset('6938803c45536fc95cbcf5fb_Hero-Image.webp')}
                alt="User reviews and social media post excerpts showing reactions to new iPhone features and Nike Air Max launch, with a search result count of 384,589 and export options."
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
