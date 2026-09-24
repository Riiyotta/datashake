import { useLayoutEffect, useRef, useState } from 'react'
import { CONTAINER, Embed, Eyebrow, H2, PADDING_GLOBAL, T_LG, T_REG } from './ui.jsx'
import { plus } from './svgs.js'

const FAQS = [
  ['What types of data does Datashake collect?', 'Everything publicly available, with the depth your use case needs. Social posts, reviews, forums, news, and e-commerce data from 150+ sources. Complete threads, engagement metrics, 5+ years of history. All normalized and analysis-ready.'],
  ['How is Datashake different from other social listening tools?', "We're infrastructure, not an end-user platform. You get the raw data layer (150+ sources vs. typical 20-30) with deeper coverage, faster access, and no per-seat fees. We replace multiple vendor relationships with one reliable integration that powers your products and analytics."],
  ['Can Datashake access private social media content?', 'No, we only collect publicly available data accessible without login.'],
  ['How quickly can I access historical data?', 'Instantly. Our archive search returns 5+ years of historical data in seconds with no advance setup required. If a topic becomes relevant today, you can analyze years of conversation history immediately, plus capture real-time discussions as they unfold.'],
  ['What sources does Datashake cover?', 'Major social platforms, 100+ review sites, news outlets, forums, and e-commerce channels. Multi-language with global coverage. We add new sources based on customer needs and make them automatically available to everyone.'],
  ['How does pricing work?', 'We use a credit-based model where you pay only for data consumed. Your per-mention cost decreases automatically as volume grows, with no per-seat fees. Get in touch for a custom proposal.'],
  ['Do I need technical expertise to use Datashake?', "Yes. Datashake is designed for technical teams building data products or analytics workflows, with integration via API, webhooks, or direct feeds. We're not a dashboard tool, but we do provide ready-made templates if you're building visualizations on top of our data."],
  ['Can Datashake handle enterprise-scale needs?', "Absolutely. We're built to handle hundreds of millions of daily fetches with 98.3% uptime, dedicated support, custom SLAs, and compliance-ready infrastructure. Enterprise customers rely on us to power mission-critical workflows across global markets."],
  ["What if you don't cover a source I need?", 'Just tell us. We regularly add sources based on customer requests and make them available to all customers automatically, with no re-engineering required and no extra costs. Many of our current sources exist because customers asked for them.'],
  ['How long does setup take?', 'Most teams are collecting data within days. We configure your sources, set up API access, and provide technical documentation to get you running quickly. Standard implementations move fast, while complex custom integrations take a bit longer – but we prioritize speed either way.'],
  ['Can I try Datashake first?', "Yes. We offer a free benchmark test using your actual queries to show you what you're missing compared to your current tools."],
  ['Is Datashake compliant with data privacy regulations?', 'Yes. We collect only public data and maintain compliance-ready infrastructure with encryption at every step.'],
  ['What support do you provide?', "Get direct access to real humans who understand data infrastructure challenges. Enterprise customers receive priority support, custom SLAs, and direct access to our data engineering team. We're invested in your long-term success, not just your initial setup."],
  [
    'Who uses Datashake?',
    <>
      -Software companies building customer experience platforms, competitive intelligence tools, and analytics products
      <br />- Enterprise brands monitoring reputation and detecting emerging trends
      <br />
      -Agencies delivering comprehensive data-driven client reporting
      <br />
      -Finance teams conducting due diligence and risk assessment
      <br />
      -Pharma companies tracking adverse events for regulatory compliance
      <br />
      -Any organization that needs reliable data infrastructure at scale
    </>,
  ],
]

const OPEN_T = 'height 250ms ease-in, border-color 250ms ease-in'
const CLOSE_T = 'height 150ms ease-in, border-color 150ms ease-in'

function FaqItem({ question, answer, last }) {
  const [open, setOpen] = useState(false)
  const answerRef = useRef(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const el = answerRef.current
    if (first.current) {
      first.current = false
      return
    }
    const onEnd = (e) => {
      if (e.propertyName === 'height' && open) el.style.height = 'auto'
    }
    el.addEventListener('transitionend', onEnd)
    if (open) {
      el.style.transition = 'none'
      el.style.height = '0px'
      void el.offsetHeight
      el.style.transition = OPEN_T
      // border-box: target = content + bottom border (IX2 tweens to the element's auto height)
      el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`
      el.style.borderColor = ''
    } else {
      el.style.transition = 'none'
      el.style.height = `${el.offsetHeight}px`
      void el.offsetHeight
      el.style.transition = CLOSE_T
      el.style.height = '0px'
      el.style.borderColor = 'rgba(0, 0, 0, 0)'
    }
    return () => el.removeEventListener('transitionend', onEnd)
  }, [open])

  return (
    <div
      className="w-full p-0 cursor-pointer border-l-hair border-dashed border-border"
      onClick={() => setOpen((o) => !o)}
    >
      <div
        className="flex justify-between items-center w-full h-full gap-0 pl-[1rem] py-0 border-b-hair border-dashed border-border tablet:pl-[1.5rem]"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
      >
        <div className={`${T_LG} text-[1.25rem] mobile-p:text-[1.125rem] text-black w-[90%] py-[1rem] mobile-p:pr-[15px]`}>{question}</div>
        <div
          className={`static flex justify-center items-center h-full max-h-full min-h-[80px] py-0 border-l-hair border-dashed border-border mobile-p:min-h-0 min-w-[5rem] tablet:w-[5.5rem] ${
            last ? 'w-[80px]' : 'w-[5rem]'
          }`}
        >
          <Embed
            svg={plus}
            className="w-[1.75rem] h-[1.75rem] mobile-p:w-[20px] mobile-p:h-[20px]"
            style={{
              transform: `rotate(${open ? 45 : 0}deg)`,
              transition: open ? 'transform 250ms ease-in' : 'transform 150ms ease-in',
            }}
          />
        </div>
      </div>
      <div
        ref={answerRef}
        className={`w-full px-[1.5rem] overflow-hidden ${last ? 'border-b-0' : 'border-b-hair border-dashed border-border'}`}
        style={{ height: 0, borderColor: 'rgba(0, 0, 0, 0)' }}
      >
        <div className={`${T_REG} text-grey-v2 pt-[1.5rem] pb-[1.5rem] pl-0`}>{answer}</div>
      </div>
    </div>
  )
}

export default function Faq() {
  return (
    <div>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} relative overflow-auto border-x-hair border-border`}>
          <div className="grid grid-cols-[1fr_1.5fr] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr]">
            <div className="w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
              <div className="flex flex-col justify-start items-start gap-[1.25rem] w-full">
                <Eyebrow left="6939491eb3d2b172910b35cc_Eyebrow-Icon.svg" right="693949364cde9b1d0482c0ed_Eyebrow-Icon-2.svg">
                  FAQs
                </Eyebrow>
                <h2 className={H2}>
                  Your questions,{' '}
                  <br />
                  answered
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-0 w-full tablet:border-t-hair tablet:border-dashed tablet:border-border">
              <div className="w-full">
                {FAQS.map(([q, a], i) => (
                  <FaqItem key={q} question={q} answer={a} last={i === FAQS.length - 1} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
