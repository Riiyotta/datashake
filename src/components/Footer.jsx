import { ArrowButton, CONTAINER, Embed, LinesDivider, PADDING_GLOBAL, SITE, T_MED, T_SMALL, asset } from './ui.jsx'
import { facebook, instagram, linkedin, x } from './svgs.js'
import BarCanvas from './BarCanvas.jsx'

const COLUMNS = [
  [
    'Solutions',
    [
      ['Customer Experience Tools', `${SITE}/industry/cx-platforms`],
      ['Social Listening', `${SITE}/industry/social-listening`],
      ['Reputation & Review Management', `${SITE}/industry/reputation-and-review-management`],
      ['Marketing Automation', `${SITE}/industry/marketing-automation`],
      ['Retail', `${SITE}/industry/retail`],
      ['Pharmaceutical', `${SITE}/industry/pharmaceutical`],
      ['Finance', `${SITE}/industry/finance`],
      ['Agencies', `${SITE}/industry/agencies`],
    ],
  ],
  [
    'Product',
    [
      ['Platform', `${SITE}/platform`],
      ['Enterprise', `${SITE}/enterprise`],
      ['Why Datashake', `${SITE}/why-datashake`],
      ['Status', 'https://status.datashake.com/', true],
    ],
  ],
  [
    'Company',
    [
      ['About', `${SITE}/about-us`],
      ['Blog', `${SITE}/blog`],
      ['Book a Demo', `${SITE}/demo`],
      ['Contact', `${SITE}/contact-us`],
    ],
  ],
  [
    'Legal',
    [
      ['Terms of Service', `${SITE}/terms-of-service`],
      ['Privacy Policy', `${SITE}/privacy-policy`],
    ],
  ],
]

const SOCIALS = [
  ['https://www.linkedin.com/company/atdatashake', linkedin],
  ['https://www.facebook.com/datashake', facebook],
  ['https://www.instagram.com/datashakehq/', instagram],
  ['https://x.com/DatashakeHQ', x],
]

export default function Footer() {
  return (
    <footer>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} relative overflow-auto border-x-hair border-border`}>
          <div className="flex justify-between items-center px-[3rem] py-[1.5rem] bg-grey-v1 border-b-hair border-border tablet:flex-col tablet:justify-between tablet:items-start tablet:gap-[2rem] mobile-p:px-[1.5rem]">
            <div className="font-display tracking-[-0.02em] text-[1.5rem] mobile-p:text-[1.25rem] text-black">
              Get social data insights delivered fresh
            </div>
            {/* .hubspot-wrapper — HubSpot newsletter form intentionally not embedded (third-party).
                min-height reserves the live form's rendered height, which scales with the fluid root:
                measured live at 320–1920px it fits 108px + 1.25rem (>768), 142px + 1.25rem (481–768)
                and 222px + 1.25rem (≤480) to within ~0.5px. */}
            <div
              className="flex-[0_1_auto] w-[685px] min-w-[685px] min-h-[calc(108px+1.25rem)] [@media(min-width:481px)_and_(max-width:768px)]:min-h-[calc(142px+1.25rem)] [@media(max-width:480px)]:min-h-[calc(222px+1.25rem)] ml-auto mb-0 tablet:w-full tablet:min-w-0"
              data-hubspot-slot="newsletter"
            >
              <div className="w-full mb-0 ml-0" />
            </div>
          </div>
          <div className="grid grid-cols-[.4fr_1fr] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr]">
            <div className="relative z-[2] flex flex-col justify-between items-start gap-[2rem] w-full h-full min-h-0 p-0 border-r-hair border-border tablet:justify-start tablet:border-r-0 mobile-p:gap-0 mobile-p:border-b-hair">
              <div className="w-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
                <div className="flex flex-col justify-start items-start gap-[2rem] w-full">
                  <a href={`${SITE}/`} aria-current="page" className="inline-block max-w-full">
                    <img src={asset('693864b3bf7cdd4a83615647_Datashake-logo.svg')} alt="Datashake logo" loading="lazy" />
                  </a>
                  <div className="flex gap-[4px] justify-start items-center">
                    {SOCIALS.map(([href, svg]) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex justify-center items-center w-[40px] min-w-[40px] h-[40px] max-w-full border-hair border-dashed border-border"
                      >
                        <Embed
                          svg={svg}
                          className="static w-[1.5rem] min-w-[1.5rem] h-[1.5rem] min-h-[1.5rem] text-grey-v2 group-hover:text-green transition-colors duration-200 ease-[ease]"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col justify-start items-start gap-0 w-full h-full">
                <div className="flex justify-start items-end w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
                  <div className="w-full">
                    <ArrowButton href={`${SITE}/demo`} variant="footer">
                      Book a demo
                    </ArrowButton>
                  </div>
                </div>
                <div className="static z-[2] flex justify-start items-center w-full h-full max-h-none p-[48px] border-t-hair border-border tablet:hidden">
                  {/* .text-size-small.z-index-1 — the global .z-index-1 makes it 50% wide, centered, padding-top 24px */}
                  <div className={`${T_SMALL} text-grey-v2 relative z-[1] w-1/2 mx-auto pt-[24px]`}>All Rights Reserved © Datashake</div>
                </div>
              </div>
            </div>
            <div className="p-[48px] tablet:flex tablet:flex-col tablet:justify-start tablet:items-start tablet:gap-[3rem] tablet:w-full mobile-p:p-[1.5rem]">
              <div className="flex justify-between items-start gap-0 w-full mobile-p:flex-col mobile-p:gap-[3rem]">
                {COLUMNS.map(([heading, links]) => (
                  <div key={heading} className="relative z-[1] flex flex-col justify-start items-start gap-[1.5rem] mobile-p:gap-[1rem]">
                    <div className={`${T_MED} text-black`}>{heading}</div>
                    <div className="flex flex-col justify-start items-start gap-[1rem] w-full">
                      {links.map(([label, href, external]) => (
                        <a
                          key={label}
                          href={href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noreferrer' : undefined}
                          className="font-sans leading-[1.2] tracking-[-0.5px] text-grey-v2 no-underline transition-colors duration-200 ease-[ease] hover:text-black"
                        >
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* .background-image.height-300px > .canvas-footer — p5.js bar sketch (BarCanvas) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-auto w-full h-[150px]">
            <BarCanvas variant="footer" className="w-full h-full" />
          </div>
        </div>
      </div>
      <LinesDivider />
    </footer>
  )
}
