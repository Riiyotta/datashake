import { useEffect, useRef } from 'react'
import Typed from 'typed.js'
import { CONTAINER, H2, PADDING_GLOBAL } from './ui.jsx'
import BarCanvas from './BarCanvas.jsx'

// Options copied verbatim from the original inline `new Typed(".typed-words", {...})`.
const TYPED_OPTIONS = {
  strings: [
    'Real-time crisis detection system',
    'Competitive intelligence dashboard',
    'Customer sentiment tracker',
    'Trend forecasting engine',
    'Brand health monitor',
    'Product feedback aggregator',
    'Market research platform',
    'Global reputation management system',
    'Adverse event detection',
    'Early warning system',
    'Customer experience improvements',
    'Detect product quality issues',
    'Track competitor pricing',
    'Map customer journeys',
    'Monitor KOL conversations',
    'Identify emerging trends',
  ],
  typeSpeed: 45,
  backSpeed: 25,
  backDelay: 400,
  startDelay: 250,
  loop: true,
  showCursor: false,
  cursorChar: '|',
  attr: null,
}

export default function BuildSection() {
  const typedRef = useRef(null)
  useEffect(() => {
    const typed = new Typed(typedRef.current, TYPED_OPTIONS)
    return () => typed.destroy()
  }, [])

  return (
    <section>
      <div className={PADDING_GLOBAL}>
        <div className={CONTAINER}>
          <div className="relative flex justify-center items-center w-full min-h-[430px] border-x-hair border-border mobile-l:min-h-[350px]">
            {/* .flex-v.gap-2rem.size-700px.align-center.z-index-1 */}
            <div className="relative z-[1] flex flex-col justify-start items-center gap-[2rem] w-[700px] mx-auto pt-[24px] tablet:px-[2rem] mobile-l:w-[70vw]">
              <h2 className={`${H2} text-center`}>What would you build with unlimited access to public conversation data?</h2>
              <div className="border-l-2 border-solid border-green pl-[1.5rem] pb-0">
                <div className="w-[380px] pb-[.3rem] border-b border-dashed border-border mobile-p:w-[80vw]">
                  <div ref={typedRef} className="typed-cursor-css text-grey-v2 tracking-[-0.5px] font-sans text-[1.25rem]" />
                </div>
              </div>
            </div>
            {/* .background-image.height-50 > .canvas — p5.js bar sketch (BarCanvas) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 w-full h-1/2">
              <BarCanvas variant="build" className="absolute inset-x-0 top-0 w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
