import { useCallback, useEffect, useRef, useState } from 'react'
import { CONTAINER, Embed, H3, Lottie, PADDING_GLOBAL, T_LG, T_MED } from './ui.jsx'
import { CheckRow } from './ReliableSection.jsx'
import * as S from './svgs.js'

const TABS = [
  {
    label: 'Speed',
    tabIcon: S.tabSpeed,
    subIcon: S.subSpeed,
    check: S.checkYellow,
    progress: 'bg-light-yellow',
    title: 'Get answers in seconds',
    body: "Access 5+ years of historical data instantly through archive search, or collect fresh conversations in real-time when you need current information. Get data how you need it, when you need it — whether you're analyzing long-term trends or responding to emerging issues.",
    points: ['Archive search returns results in seconds', 'Real-time collection for emerging topics', '5+ years of historical depth available instantly'],
    lottie: '/lottie/970-15.json',
  },
  {
    label: 'Depth',
    tabIcon: S.tabDepth,
    subIcon: S.subDepth,
    check: S.checkBlue,
    progress: 'bg-light-blue',
    title: 'Make confident decisions with complete data',
    body: 'Capture full threads, replies, engagement metadata, and complete conversation history. Get everything you need to spot emerging trends, detect crisis signals, and analyze industry-wide patterns at scale. We collect all available data points, from posts and comments to metadata and user insights.',
    points: ['Complete conversation threads and replies', 'Engagement data and metadata', 'Data volume for industry-wide trend and benchmark analysis'],
    lottie: '/lottie/970-16.json',
  },
  {
    label: 'Coverage',
    tabIcon: S.tabCoverage,
    subIcon: S.subCoverage,
    check: S.checkOrange,
    progress: 'bg-light-orange',
    title: 'Scale your coverage without scaling complexity',
    body: 'Access review sites, social platforms, forums, and e-commerce channels without shopping for multiple vendors. Get data from billions of public conversations across sources, all through one trusted partner. When we add new sources based on customer needs, they become available to you automatically, without re-engineering or additional integration work.',
    points: ['150+ sources and growing, across review sites, social platforms, forums', 'Multi-language and regional coverage globally', 'New sources added as you need them'],
    lottie: '/lottie/970-17.json',
  },
  {
    label: 'Relevance',
    tabIcon: S.tabRelevance,
    subIcon: S.subRelevance,
    check: S.checkPurple,
    progress: 'bg-light-purple',
    title: "Find what matters, filter what doesn't",
    body: (
      <>
        Make better decisions with <strong>relevant</strong> data, not just <em>more</em> data. Precise search and filtering capabilities help you
        quickly find the results you’re after. We deliver clean, analysis-ready data so you can gather the strongest insights.
      </>
    ),
    points: ['Archive search returns results in seconds', 'Date range, language, and source type filtering', 'Advanced duplicate detection for clean results'],
    lottie: '/lottie/970-18.json',
  },
]

/* Motion measured on the live site:
   - Webflow tabs (data-duration-out 100, data-duration-in 300, data-easing ease): on change the link
     gets w--current at once; the old pane fades out (opacity 100ms ease), is hidden, then the new pane
     is shown at opacity 0 and fades in (opacity 300ms ease). Webflow then calls link.focus() and
     restores window scroll (the focus is what scrolls the tab strip on mobile).
   - IX2 TAB_ACTIVE/TAB_INACTIVE on .tab-menu-item: the newly active tab's .tab-progress width is set
     to 0 and grows to 100% over 8000ms linear; the inactive tab's resets to 0 instantly. IX2 does NOT
     fire for the initially current tab, so tab 1's bar stays empty during the first cycle.
   - Flowbase auto rotation (fb-tabs-speed 8000): timer starts at window load; every click (also on the
     current tab) and every focus of a non-current tab restarts the 8s timer.
   - Inline script: at innerWidth < 768 the tab strip smooth-scrolls to center the current tab. */
const SPEED = 8000
const OUT_MS = 100
const IN_MS = 300

export default function BenefitsTabs() {
  const [active, setActive] = useState(0)
  const menuRef = useRef(null)
  const links = useRef([])
  const panes = useRef([])
  const bars = useRef([])
  const st = useRef({ current: 0, shown: 0, flow: 0, flowTimer: 0, paneTimers: [], raf: 0, mounted: false })

  const centerActive = useCallback(() => {
    if (window.innerWidth >= 768) return
    const menu = menuRef.current
    const tab = links.current[st.current.current]
    if (!menu || !tab || menu.scrollWidth <= menu.clientWidth) return
    menu.scrollTo({ left: tab.offsetLeft - menu.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' })
  }, [])

  const startBar = useCallback((i) => {
    const s = st.current
    cancelAnimationFrame(s.raf)
    const el = bars.current[i]
    el.style.width = '0%'
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / SPEED)
      el.style.width = `${+(p * 100).toFixed(3)}%`
      if (p < 1) s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
  }, [])

  const changeTab = useCallback(
    (i) => {
      const s = st.current
      if (i === s.current) return
      const prev = s.current
      s.current = i
      setActive(i)
      // IX2 progress
      bars.current[prev].style.width = '0%'
      startBar(i)
      // Webflow: focus the link, keep window scroll where it was
      const x = window.scrollX
      const y = window.scrollY
      links.current[i].focus()
      window.scrollTo(x, y)
      // pane outro → intro
      s.paneTimers.forEach(clearTimeout)
      s.paneTimers = []
      panes.current.forEach((el, k) => {
        if (k !== s.shown) {
          el.style.display = 'none'
          el.style.transition = ''
          el.style.opacity = ''
        }
      })
      const out = panes.current[s.shown]
      const intro = () => {
        out.style.display = 'none'
        out.style.transition = ''
        out.style.opacity = ''
        const inc = panes.current[i]
        s.shown = i
        inc.style.transition = `opacity ${IN_MS}ms ease`
        inc.style.opacity = '0'
        inc.style.display = 'block'
        void inc.offsetHeight
        inc.style.opacity = '1'
      }
      if (out === panes.current[i]) {
        out.style.transition = ''
        out.style.opacity = ''
        return
      }
      out.style.transition = `opacity ${OUT_MS}ms ease`
      out.style.opacity = '0'
      s.paneTimers.push(setTimeout(intro, OUT_MS + 10))
    },
    [startBar],
  )

  const restartTimer = useCallback(() => {
    const s = st.current
    clearTimeout(s.flowTimer)
    s.flowTimer = setTimeout(() => {
      const next = (s.flow + 1) % TABS.length
      s.flow = next
      changeTab(next)
      restartTimer()
    }, SPEED)
  }, [changeTab])

  // Flowbase init at window load
  useEffect(() => {
    const s = st.current
    const init = () => restartTimer()
    if (document.readyState === 'complete') init()
    else window.addEventListener('load', init, { once: true })
    return () => {
      window.removeEventListener('load', init)
      clearTimeout(s.flowTimer)
      s.paneTimers.forEach(clearTimeout)
      cancelAnimationFrame(s.raf)
    }
  }, [restartTimer])

  // mobile strip centering (on class change, initially and on resize)
  useEffect(() => {
    centerActive()
  }, [active, centerActive])
  useEffect(() => {
    window.addEventListener('resize', centerActive)
    return () => window.removeEventListener('resize', centerActive)
  }, [centerActive])

  return (
    <div>
      <div className={PADDING_GLOBAL}>
        <div className={CONTAINER}>
          <div className="sticky top-[10vh]">
            <div className="relative w-full h-full" data-tabs-benefits="">
              <div
                ref={menuRef}
                role="tablist"
                className="relative grid grid-cols-[1fr_1fr_1fr_1fr] auto-cols-fr gap-0 border-b-hair border-l-hair border-border tablet:w-full tablet:flex tablet:overflow-auto"
              >
                {TABS.map((tab, i) => {
                  const current = i === active
                  return (
                    <a
                      key={tab.label}
                      ref={(el) => (links.current[i] = el)}
                      href={`#benefits-pane-${i}`}
                      role="tab"
                      aria-selected={current}
                      aria-controls={`benefits-pane-${i}`}
                      tabIndex={current ? 0 : -1}
                      data-tab-index={i}
                      onClick={(e) => {
                        e.preventDefault()
                        st.current.flow = i
                        changeTab(i)
                        restartTimer()
                      }}
                      onFocus={() => {
                        if (st.current.flow !== i) {
                          st.current.flow = i
                          restartTimer()
                        }
                      }}
                      className={`relative flex justify-center items-center gap-[12px] max-w-full align-top text-left cursor-pointer no-underline px-[30px] py-[1.5rem] border-r-hair border-border text-black tracking-[-1px] font-sans text-[1.25rem] font-normal tablet:w-[200px] tablet:min-w-[200px] ${
                        current ? 'bg-white' : 'bg-transparent'
                      }`}
                    >
                      {/* .flex-h.gap-12px.z-index-1 — the global .z-index-1 makes this 50% wide, centered, padding-top 24px */}
                      <div className="relative z-[1] flex justify-start items-center gap-[12px] w-1/2 mx-auto pt-[24px] tablet:w-full tablet:px-[2rem]">
                        <Embed svg={tab.tabIcon} className="w-[1.75rem] h-[1.75rem] mobile-p:w-[20px] mobile-p:h-[20px]" />
                        <div>{tab.label}</div>
                      </div>
                      <div
                        ref={(el) => (bars.current[i] = el)}
                        data-tab-progress={i}
                        className={`absolute top-0 bottom-0 left-0 right-auto h-full ${tab.progress}`}
                        style={{ width: '0%' }}
                      />
                    </a>
                  )
                })}
              </div>
              <div className="relative block overflow-hidden border-x-hair border-border">
                {TABS.map((tab, i) => (
                  <div
                    key={tab.label}
                    ref={(el) => (panes.current[i] = el)}
                    id={`benefits-pane-${i}`}
                    role="tabpanel"
                    data-tab-pane={i}
                    className="relative"
                    style={{ display: i === 0 ? 'block' : 'none' }}
                  >
                    <div className="grid grid-cols-[1fr_1fr] auto-cols-fr gap-0 w-full tablet:grid-cols-[1fr]">
                      <div className="flex flex-col justify-between items-start gap-[12px] w-full h-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]">
                        <div className="flex flex-col justify-start items-start gap-[1.25rem] w-full">
                          <div className="flex gap-[12px] justify-start items-center">
                            <Embed svg={tab.subIcon} className="block w-[40px] min-w-[40px] h-[40px] min-h-[40px]" />
                            <div className={`${T_MED} text-black`}>{tab.label}</div>
                          </div>
                          <h3 className={H3}>{tab.title}</h3>
                          <div className={`${T_LG} text-[1.25rem] mobile-p:text-[1.125rem] text-grey-v2 max-w-[40rem]`}>{tab.body}</div>
                        </div>
                        <div className="flex flex-col justify-start items-start gap-[12px] w-full">
                          {tab.points.map((p) => (
                            <CheckRow key={p} svg={tab.check}>
                              {p}
                            </CheckRow>
                          ))}
                        </div>
                      </div>
                      <div className="w-full h-full py-0 bg-grey-v1 border-l-hair border-border tablet:border-l-0">
                        <Lottie name={`tab-${i + 1}`} src={tab.lottie} autoplay loop />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
