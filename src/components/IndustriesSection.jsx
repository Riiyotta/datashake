import { ArrowButton, CONTAINER, Eyebrow, H2, NarrowStripDivider, PADDING_GLOBAL, SITE, T_LG, T_MED, T_REG, asset } from './ui.jsx'

// [image, alt, title, body]; every third card is the "last-item" variant (right border on desktop)
const CARDS = [
  ['693b2752e7826c75201aa9c2_Crisis-Illustration.svg', 'illustration depicting crises and risk monitoring from social platforms', 'Crisis Monitoring & Risk Detection', 'Detect potential crises before they escalate. Monitor reputation threats, product issues, and negative sentiment spikes in real-time across all channels.'],
  ['693aaa22543d41b64af90bdb_Benefit-Illustration.svg', 'illustration depicting predicted data volumes', 'Trend Detection', 'Identify emerging trends before they become mainstream. Track conversation volume and topic evolution across any source you need.'],
  ['696a45da0f1229f20a28f1e4_RPFS-Illustration.webp', 'Diagram listing review sites and social media platforms with related content types, including E-Commerce, Product, Service, Physical Shop, Posts, User Profiles, Videos, and Reviews.', 'Win Competitive RFPs', 'Win enterprise contracts with deep coverage from 150+ sources that becomes the deciding factor in RFP evaluations.'],
  ['693b280abb79699bcdc60aed_Deals-Illustration.svg', 'illustration showing deal closure increases with Datashake API', 'Close More Deals', 'Close more deals when you integrate Datashake data. Get access to coverage that becomes undeniable competitive differentiation'],
  ['693b283e2069033d2ea99e8f_Competitive-Illustration.svg', 'illustration showing competitive analysis of data streams', 'Competitive Analysis', 'Track competitive activity across all channels simultaneously. Monitor pricing, promotions, product launches, and more to compete smarter.'],
  ['695441357de4841a1da03c74_Retain-Illustration.webp', 'Map of North America with orange rectangular markers indicating locations across the United States, Mexico, and the Caribbean.', 'Retain Enterprise Customers', 'Retains your most valuable enterprise customers by delivering the comprehensive data your clients need across global markets.'],
  ['69544152ed6bbdf3beee0095_Due-Illustration.webp', "Task labeled 'Hire 2 software engineers to improve face ID' marked as approved, linked to a social media comment from 4 days ago stating 'iPhone 17 face ID feels much slower than my 14 Pro.'", 'Due Diligence & KYC', 'Finance teams strengthen KYC processes and risk assessment with comprehensive social and review data.'],
  ['693b2866ae8a9eeb03279bd4_Compliance-Illustration.svg', 'illustration depicting abstract data streams being scanned', 'Regulatory Compliance', "Pharmaceutical companies monitor adverse events and post-market surveillance through complete coverage that manual monitoring can't match."],
  ['695441741c57ad046429eddb_Client-Illustration.webp', 'Report highlighting great customer response to new features with 11,234 mentions and suggested marketing actions.', 'Client Reporting', 'Agencies deliver stronger client insights with comprehensive data coverage, flexible access, and predictable pricing.'],
]

export default function IndustriesSection() {
  return (
    <div>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} border-x-hair border-border`}>
          <div className="w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
            <div className="grid grid-cols-[1fr_1fr] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr]">
              <div className="flex flex-col justify-start items-start gap-[1.5rem] w-full">
                <Eyebrow left="6939491eb3d2b172910b35cc_Eyebrow-Icon.svg" right="693949364cde9b1d0482c0ed_Eyebrow-Icon-2.svg">
                  Power Your Data
                </Eyebrow>
                <div className="w-[34.375rem] min-w-[34.375rem] h-auto tablet:w-full tablet:min-w-0">
                  <h2 className={H2}>What global companies use Datashake for</h2>
                </div>
              </div>
              <div className="self-end text-left">
                <div className={`${T_MED} text-grey-v2`}>
                  From trend detection and crisis monitoring to competitive intelligence and risk assessment — we support all your use cases with
                  the most comprehensive data coverage available.
                </div>
              </div>
            </div>
          </div>
          {/* empty .gap-3col.container-size from the original (zero height) */}
          <div className="grid grid-cols-[minmax(8rem,8rem)_1fr_minmax(8rem,8rem)] tablet:grid-cols-[1fr]" />
          <div className="grid grid-cols-[minmax(3rem,3rem)_1fr_minmax(3rem,3rem)] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr]">
            <NarrowStripDivider />
            <div className="grid grid-cols-[1fr_minmax(200px,1fr)_1fr] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr_1fr] mobile-p:grid-cols-[1fr]">
              {CARDS.map(([img, alt, title, body], i) => {
                const lastItem = i % 3 === 2
                return (
                  <div
                    key={title}
                    className={`relative z-[1] flex flex-col justify-start items-start gap-0 p-0 border-t-hair border-l-hair border-border tablet:border-l-0 tablet:border-r-hair mobile-p:border-r-0 ${
                      lastItem ? 'border-r-hair' : ''
                    }`}
                  >
                    <div className="w-full h-auto min-h-[20rem] max-h-[20rem] overflow-hidden border-b-hair border-border">
                      <img src={asset(img)} alt={alt} loading="lazy" className="block w-full h-full min-h-[1px] object-cover tablet:min-h-0" />
                    </div>
                    <div className="flex flex-col justify-start items-start gap-[12px] w-full p-[1.5rem]">
                      <div className={`${T_LG} text-[1.5rem] mobile-p:text-[1.25rem] font-medium text-black`}>{title}</div>
                      <div className={`${T_REG} text-grey-v2`}>{body}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <NarrowStripDivider />
          </div>
          <div className="w-full">
            <ArrowButton href={`${SITE}/demo`} variant="fullWidth">
              Book a demo
            </ArrowButton>
          </div>
        </div>
      </div>
    </div>
  )
}
