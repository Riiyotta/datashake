import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Embed, OutlineButton, SITE, T_REG, asset } from './ui.jsx'
import { logoMark, logoText } from './svgs.js'

const MENUS = [
  {
    label: 'Product',
    items: [
      ['platform', 'Platform', 'Explore Datashake', '695f72f77ae84cbdda60514b_Frame-36432.svg'],
      ['enterprise', 'Enterprise', 'Built for scale and compliance', '695f73f4ecb0ad342279c6f9_Frame-36432.svg'],
      ['why-datashake', 'Why Datashake', 'See why teams choose us', '695fd6144754d3af93bf2522_Frame-36432.svg'],
    ],
  },
  {
    label: 'Solutions',
    solution: true,
    items: [
      ['industry/cx-platforms', 'Customer Experience Tools', 'Power complete feedback intelligence', '695f7648758258315edacf34_Customer.svg'],
      ['industry/retail', 'Retail', 'Track product performance at scale', '695f76586e0697704383a7f8_Retail.svg'],
      ['industry/social-listening', 'Social Listening', 'Capture every mention across sources', '695f76639705a8e5b6829eb5_Social.svg'],
      ['industry/pharmaceutical', 'Pharmaceutical', 'Unlock patient insights compliantly', '695f766f655fcc9f92cd97b0_Pharmaceutical.svg'],
      ['industry/reputation-and-review-management', 'Reputation & Review Management', 'Protect brand trust automatically', '695f7679f97a0549faf533b3_Reputataion.svg'],
      ['industry/finance', 'Finance', 'Strengthen due diligence with behavioral data', '695f76814598a49a990adb85_Finance.svg'],
      ['industry/marketing-automation', 'Marketing Automation', 'Fuel campaigns with authentic social proof', '695f768c19761d095c55df4a_Marketing.svg'],
      ['industry/agencies', 'Agencies', 'Deliver insights without data overhead', '695f7696f3954786e6327188_Agencies.svg'],
    ],
  },
  {
    label: 'Resources',
    items: [
      ['blog', 'Blog', 'Insights on public data infrastructure', '695f7508a1c44f588d5784eb_Frame-36432.svg'],
      ['dashboard-template', 'Dashboard template library', 'Industry-ready analytics templates', '695f7525f738456aed5590a9_tEMPLATE.svg'],
      ['resources/social-data-coverage-report-2026', '2026 Social Data Coverage Report', 'Get your free report', '69c3e9912c34b76aed113aad_Frame-36420.svg'],
      ['datasets', 'Datasets', 'Ready-to-buy social data', '695f7508a1c44f588d5784eb_Frame-36432.svg'],
    ],
  },
  {
    label: 'Company',
    items: [
      ['about-us', 'About', 'Meet the team behind Datashake', '695fd665e46fe59b284adc9f_Frame-36432.svg'],
      ['contact-us', 'Contact', 'Talk to our data experts', '695fd67c61a3dc10c5d8d68d_Frame-36432.svg'],
    ],
  },
]

const TABLET_QUERY = '(max-width: 991px)'

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/* Webflow w-dropdown (data-hover="true", data-delay="0") driven by the IX2 "Dropdown-Open/Close"
   action lists (measured on live): open — toggle color #666→#0d0d0d 300ms ease, list translateY
   (-50px→0) + opacity (0→1) 300ms ease-in, starting the same frame. Close — w--open is removed so the
   list is display:none at once (its 200ms IX2 fade is never visible); only the toggle color animates
   back to #666 in 200ms ease-in. */
function Dropdown({ menu, isTablet }) {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const listRef = useRef(null)

  const openIt = () => setShown(true)
  const closeIt = () => {
    setOpen(false)
    setShown(false)
  }
  // list is display:block with its initial state now; flush styles, then start the transition
  useLayoutEffect(() => {
    if (!shown) return
    void listRef.current.offsetHeight
    setOpen(true)
  }, [shown])

  const hover = !isTablet
  return (
    <div
      className="relative inline-block z-[900] text-left mx-auto tablet:w-full tablet:mx-0 tablet:pt-[1.25rem] tablet:pb-[1.25rem] tablet:pl-[1rem] tablet:border-b-hair tablet:border-border"
      onMouseEnter={hover ? openIt : undefined}
      onMouseLeave={hover ? closeIt : undefined}
    >
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (shown && open ? closeIt() : openIt())}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            shown && open ? closeIt() : openIt()
          }
          if (e.key === 'Escape') closeIt()
        }}
        className={`relative inline-block tablet:block align-top p-0 mx-auto whitespace-nowrap text-left cursor-pointer select-none font-sans tracking-[-0.5px] ${
          open ? 'text-black transition-colors duration-300 ease-[ease]' : 'text-grey-v2 transition-colors duration-200 ease-in'
        }`}
      >
        <div className="tracking-[-0.02em] font-normal">{menu.label}</div>
      </div>
      <nav
        ref={listRef}
        className={`${shown ? 'block' : 'hidden'} absolute tablet:relative min-w-full bg-transparent pt-[1rem] left-[-150px] tablet:left-0 ${
          open ? 'duration-300' : 'duration-200'
        } transition-[transform,opacity] ease-in`}
        style={{ transform: `translate3d(0, ${open ? 0 : -50}px, 0)`, opacity: open ? 1 : 0 }}
      >
        <div className="border-hair border-dashed border-border bg-grey-v1 p-[10px] tablet:p-0">
          <div className="w-full h-full p-[.5rem] border-hair border-dashed border-border bg-white tablet:border-none tablet:p-0">
            <div
              className={
                menu.solution
                  ? 'grid grid-cols-[1fr_1fr] auto-cols-fr gap-[.25rem] w-full tablet:grid-cols-[1fr]'
                  : 'grid grid-cols-[1fr] auto-cols-fr gap-[.25rem]'
              }
            >
              {menu.items.map(([path, title, sub, icon]) => (
                <a
                  key={path + title}
                  href={`${SITE}/${path}`}
                  className={`flex gap-[1rem] justify-start items-center max-w-full px-[1rem] py-[.875rem] no-underline transition-[background-color] duration-300 ease-[ease] hover:bg-grey-v1 tablet:w-full ${
                    menu.solution ? 'min-w-[440px] tablet:min-w-0' : 'min-w-[370px] tablet:min-w-full mobile-l:min-w-0'
                  }`}
                >
                  <img src={asset(icon)} alt="" loading="lazy" className="block w-[40px] min-w-[40px] h-[40px] min-h-[40px]" />
                  <div className="flex flex-col justify-start items-start gap-0 w-full h-full relative">
                    <div className={`${T_REG} text-black`}>{title}</div>
                    <div className={`${T_REG} text-grey-v2 whitespace-nowrap mobile-p:whitespace-normal`}>{sub}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

function NavMenu({ isTablet }) {
  return (
    <>
      <div className="flex gap-[1.25rem] justify-start items-center tablet:gap-0 tablet:flex-col tablet:items-start tablet:w-full tablet:h-full tablet:border-x-hair tablet:border-border mobile-p:min-h-full">
        {MENUS.map((m) => (
          <Dropdown key={m.label} menu={m} isTablet={isTablet} />
        ))}
      </div>
      <div className="flex flex-wrap gap-[1rem] justify-start items-center w-auto tablet:absolute tablet:inset-x-0 tablet:bottom-0 tablet:w-full">
        <OutlineButton href="https://dashboard.datashake.com/signin" variant="small">
          Login
        </OutlineButton>
        <div className="tablet:hidden">
          <OutlineButton href={`${SITE}/demo`} variant="black">
            Book a call
          </OutlineButton>
        </div>
      </div>
    </>
  )
}

export default function Navbar() {
  const isTablet = useMedia(TABLET_QUERY)
  // Mobile menu: Webflow nav data-animation="default", data-duration="400", ease — the menu slides
  // down from translateY(-100%) inside .w-nav-overlay; page scroll is locked while open.
  const [menuOpen, setMenuOpen] = useState(false) // logical state (button X, scroll lock)
  const [menuMounted, setMenuMounted] = useState(false)
  const [menuIn, setMenuIn] = useState(false)
  const timer = useRef()

  const toggle = () => {
    clearTimeout(timer.current)
    if (!menuOpen) {
      setMenuOpen(true)
      setMenuMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setMenuIn(true)))
    } else {
      setMenuOpen(false)
      setMenuIn(false)
      timer.current = setTimeout(() => setMenuMounted(false), 400)
    }
  }

  useEffect(() => {
    if (!isTablet && menuOpen) {
      setMenuOpen(false)
      setMenuIn(false)
      setMenuMounted(false)
    }
  }, [isTablet, menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => () => clearTimeout(timer.current), [])

  const showOverlay = isTablet && menuMounted

  return (
    <div
      role="banner"
      className="fixed inset-x-0 top-0 z-[1000] w-full bg-white border-b-hair border-solid border-border px-[2.5rem] tablet:px-[1.25rem] mobile-l:px-[.75rem]"
    >
      <div className="flex flex-row gap-[2rem] justify-start items-center w-full max-w-[90rem] mx-auto px-[1.5rem] py-[1rem] border-x-hair border-border tablet:justify-between mobile-p:px-[1rem]">
        <a
          href={`${SITE}/`}
          aria-current="page"
          aria-label="home"
          className="group relative flex gap-[.5rem] justify-start items-center no-underline mobile-l:pl-[10px]"
        >
          <Embed
            svg={logoMark}
            className="w-[1.5rem] h-[1.5rem] mobile-p:w-[1rem] mobile-p:h-[1.2rem] group-hover:rotate-[360deg] group-hover:transition-transform group-hover:duration-500 group-hover:ease-[ease]"
          />
          <Embed svg={logoText} className="w-[8rem] h-[2rem] mobile-p:w-[6rem] mobile-p:h-[1.4rem]" />
        </a>

        {/* Desktop menu (Webflow collapses it at ≤991px) */}
        {!showOverlay && (
          <nav role="navigation" className="relative flex flex-1 gap-[1.25rem] justify-between items-center w-auto tablet:hidden">
            <NavMenu isTablet={isTablet} />
          </nav>
        )}

        <div className="tablet:flex tablet:gap-[1.25rem] tablet:justify-start tablet:items-center">
          <div className="hidden tablet:block">
            <OutlineButton href={`${SITE}/demo`} variant="blackMobile">
              Book a call
            </OutlineButton>
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={toggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggle()
              }
            }}
            className="hidden tablet:block relative float-right cursor-pointer select-none text-[24px] p-[1rem] tablet:px-[.5rem] tablet:py-[.6rem] tablet:border-hair tablet:border-border tablet:text-white"
          >
            <div className="flex flex-col gap-[.5rem] justify-start items-start">
              {/* IX2 Navbar-Open: top line translateY(5px) rotate(45deg), bottom translateY(-4px) rotate(-45deg), 500ms;
                  Navbar-Close: back to 0 in 250ms ease-in */}
              <div
                className={`flex-none w-[16px] h-[1px] max-h-none bg-black mobile-p:flex-[0_1_auto] mobile-p:h-[1.5px] ${
                  menuOpen ? 'transition-transform duration-500 ease-linear' : 'transition-transform duration-[250ms] ease-in'
                }`}
                style={{ transform: menuOpen ? 'translate3d(0, 5px, 0) rotate(45deg)' : 'translate3d(0, 0, 0) rotate(0deg)' }}
              />
              <div
                className={`flex-none w-[16px] h-[1.5px] max-h-[1.5px] bg-black mobile-p:flex-[0_1_auto] mobile-p:max-h-none mobile-p:pb-0 ${
                  menuOpen ? 'transition-transform duration-500 ease-linear' : 'transition-transform duration-[250ms] ease-in'
                }`}
                style={{ transform: menuOpen ? 'translate3d(0, -4px, 0) rotate(-45deg)' : 'translate3d(0, 0, 0) rotate(0deg)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* .w-nav-overlay — holds the open menu on tablet/mobile */}
      {showOverlay && (
        <div className="absolute top-full inset-x-0 w-full overflow-hidden">
          <nav
            role="navigation"
            data-nav-menu-open=""
            className="relative block w-full min-w-[200px] text-center bg-white h-[90vh] min-h-0 px-[1.25rem] overflow-auto mobile-p:min-h-[80vh] mobile-p:px-[.75rem] transition-transform duration-[400ms] ease-[ease]"
            style={{ transform: menuIn ? 'translateY(0)' : 'translateY(-100%)' }}
          >
            <NavMenu isTablet={isTablet} />
          </nav>
        </div>
      )}
    </div>
  )
}
