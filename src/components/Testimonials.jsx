import { useEffect, useRef, useState } from 'react'
import { CONTAINER, PADDING_GLOBAL, T_LG, T_MED, asset } from './ui.jsx'

/* Label text uses each variant's accent color (text-color-blue/orange/purple/yellow on the child
   divs, verified on the rendered original); only the <a> element itself computes to #2d62ff. */
const ITEMS = [
  {
    name: 'Tech Lead',
    role: 'Review Management Services',
    quote:
      '"We’ve been using Datashake for over six years, and it’s been a big part of our business growth during that time. It has really helped improve our operations by providing consistent, reliable data that we can easily plug into our workflows."',
    bg: '693b2bad262f15e43a700997_Testimonial-Background.svg',
    tab: 'bg-light-blue',
    color: 'text-blue',
    nameWeight: 'font-medium',
  },
  {
    name: 'Arkadiusz',
    role: 'Software Engineering Manager, Software development',
    quote:
      '“Datashake delivers exceptional value through their unique features and flexible APIs. Their team is highly collaborative and responsive, making them a pleasure to work with. I highly recommend their services.”',
    bg: '693b30c87d7515b5b57b7614_Testimonial-Orange-BG.svg',
    tab: 'bg-light-orange',
    color: 'text-orange',
    nameWeight: 'font-medium',
  },
  {
    name: 'Founder & Product Lead',
    role: 'Review Management Software',
    quote:
      '“Working with Datashake has been a game-changer for our review management platform. Their review aggregation service covers 100+ sites and saves us a huge amount of development time and maintenance. Instead of constantly building and updating our own integrations, we can stay focused on making a great product.”',
    bg: '693b315a3bebea2f490621a6_Testimonial-Purple-BG.svg',
    tab: 'bg-light-purple',
    color: 'text-purple',
    nameWeight: 'font-medium',
  },
  {
    name: 'Senior Technical Partner Manager',
    role: 'Brand Digital Presence & Marketing Software',
    quote:
      '“Partnering with Datashake has been a great experience. Their customer success team is responsive, knowledgeable, and always quick to help. They’re open to evolving the product as our needs grow, and their framework makes scaling up or down extremely easy.”',
    bg: '693b31cfb5fed498f4de1233_Testimonial-Yellow-BG.svg',
    tab: 'bg-light-yellow',
    color: 'text-yellow',
    nameWeight: '', // the original's yellow panel name has no .text-weight-medium
  },
]

const VERTICAL = '[writing-mode:vertical-rl] rotate-180'

export default function Testimonials() {
  const [active, setActive] = useState(0)
  // Original: click handler bound only if (min-width: 992px) matched on document ready.
  const clickable = useRef(false)
  useEffect(() => {
    clickable.current = window.matchMedia('(min-width: 992px)').matches
  }, [])

  return (
    <section>
      <div className={PADDING_GLOBAL}>
        <div className={CONTAINER}>
          <div className="flex w-full h-full min-h-[500px] max-h-[500px] tablet:flex-col tablet:min-h-0 tablet:max-h-none">
            {ITEMS.map((item, i) => {
              const isActive = i === active
              return [
                <a
                  key={`link-${i}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (clickable.current) setActive(i)
                  }}
                  className={`flex flex-none justify-center items-end gap-[.5rem] max-w-full no-underline transition-all duration-[800ms] ease-[ease] tablet:hidden ${
                    item.tab
                  } ${isActive ? 'w-0 p-0 overflow-hidden' : 'w-auto p-[32px]'}`}
                >
                  <div className={`${T_LG} text-[1.25rem] ${item.color} font-medium ${VERTICAL}`}>{item.name}</div>
                  <div className={`${T_MED} ${item.color} ${VERTICAL}`}>{item.role}</div>
                </a>,
                <div
                  key={`content-${i}`}
                  className={`overflow-hidden transition-[height,width] duration-[800ms] ease-[ease] ${item.tab} ${
                    isActive ? 'w-full' : i === 0 ? 'w-0' : 'w-0 tablet:w-full'
                  }`}
                >
                  <div className="relative flex flex-col justify-between items-start w-full h-full overflow-hidden pt-[3rem] pr-[5rem] pb-[3rem] pl-[8rem] tablet:gap-[1.5rem] tablet:px-[2.5rem] mobile-p:px-[1.5rem]">
                    <div className="w-[50rem] h-full tablet:w-auto">
                      <div
                        className={`font-display tracking-[-0.02em] text-[2rem] leading-[1.3] mobile-l:text-[1.5rem] ${item.color}`}
                      >
                        {item.quote}
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-0 w-[20%] h-full tablet:hidden">
                      <img src={asset(item.bg)} alt="" loading="lazy" className="block w-full h-full min-h-[1px] object-cover tablet:min-h-0" />
                    </div>
                    <div className="flex flex-col justify-start items-start gap-[.5rem] w-[20rem]">
                      <div className={`${T_LG} text-[1.25rem] ${item.color} ${item.nameWeight}`}>{item.name}</div>
                      <div className={`${T_MED} ${item.color}`}>{item.role}</div>
                    </div>
                  </div>
                </div>,
              ]
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
