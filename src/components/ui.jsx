import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import { EASE, tween } from '../lib/motion.js'
import { arrow32 } from './svgs.js'

export const asset = (file) => `/assets/${file}`
export const SITE = 'https://www.datashake.com'

/* ---------- Typography fragments (family / tracking only; size + color are set per element) ---------- */
export const T_REG = 'font-sans text-[1rem] tracking-[-0.01em] block' // .text-size-regular
export const T_SMALL = 'font-sans text-[.875rem] tracking-[-0.01em]' // .text-size-small
export const T_MED = 'font-sans text-[1.125rem] tracking-[-0.015em]' // .text-size-medium
export const T_LG = 'font-sans tracking-[-0.02em]' // .text-size-large (size + weight per element; base weight 400)
export const H2 =
  'font-display text-[3rem] font-normal leading-[1.2] tracking-[-0.015em] text-black mobile-l:text-[2rem]' // .heading-style-h2
export const H3 =
  'font-display text-[2.5rem] font-normal leading-[1.2] tracking-[-0.5px] text-black mobile-l:text-[1.5rem]' // .heading-style-h3

/* ---------- Layout fragments ---------- */
export const PADDING_GLOBAL = 'px-[2.5rem] tablet:px-[1.25rem] mobile-l:px-[.75rem]'
export const CONTAINER = 'w-full max-w-[90rem] mx-auto'
// .padding-3rem (1 class): 3rem → 2rem (tablet) → 1.5rem (mobile portrait)
export const PAD_3REM = 'w-full p-[3rem] tablet:p-[2rem] mobile-p:p-[1.5rem]'

/** Webflow .w-embed wrapper around a verbatim inline SVG. */
export function Embed({ svg, className = '', style }) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />
}

/* ---------- Buttons ---------- */
// .button — padding-x and font-size are set per variant so no two utilities fight over a property
const BUTTON =
  'flex justify-between items-center text-center tracking-[-0.02em] whitespace-nowrap rounded-none font-sans font-medium leading-none no-underline max-w-full mobile-l:w-full'

const ARROW_VARIANTS = {
  // [data-wf--button-arrow--variant="base"]
  base: {
    btn: 'gap-[3rem] mobile-p:gap-0 px-[1.5rem] py-[.75rem] text-[1.125rem] bg-green text-black hover:bg-green-hover hover:text-white transition-[background-color,color] duration-200 hover:duration-300 ease-[ease]',
    icon: 'group-hover:bg-green-icon-hover',
  },
  // [data-wf--button-arrow--variant="footer"] (same colors, gap 0)
  footer: {
    btn: 'gap-0 px-[1.5rem] py-[.75rem] text-[1.125rem] bg-green text-black hover:bg-green-hover hover:text-white transition-[background-color,color] duration-200 hover:duration-300 ease-[ease]',
    icon: 'group-hover:bg-green-icon-hover',
  },
  // [data-wf--button-arrow--variant="white"]
  white: {
    btn: 'gap-[3rem] mobile-p:gap-[5px] px-[1.5rem] py-[.75rem] text-[1.125rem] mobile-l:text-[1rem] w-auto bg-white text-black hover:bg-white-hover transition-[background-color] duration-200 hover:duration-300 ease-[ease] mobile-p:whitespace-normal mobile-p:break-words mobile-p:leading-[1.5]',
    icon: 'group-hover:bg-white-icon-hover',
  },
  // [data-wf--button-arrow--variant="full-width"] — live: #0d0d0d on desktop/tablet, the variant's
  // own background-color: #000 only applies at <=767px (measured).
  fullWidth: {
    btn: 'gap-[3rem] mobile-p:gap-0 px-[1.5rem] py-[1.5rem] text-[1.125rem] bg-black mobile-l:bg-pure-black text-white hover:bg-black-hover transition-[background-color] duration-200 hover:duration-300 ease-[ease]',
    icon: 'text-white group-hover:bg-black-icon-hover',
  },
}

/** .button with the rotating arrow icon (button-arrow component). */
export function ArrowButton({ href, children, variant = 'base', className = '' }) {
  const v = ARROW_VARIANTS[variant]
  return (
    <a href={href} className={`group ${BUTTON} ${v.btn} ${className}`}>
      <div>{children}</div>
      <Embed
        svg={arrow32}
        className={`w-[2rem] min-w-[2rem] h-[2rem] min-h-[2rem] bg-transparent rotate-0 group-hover:-rotate-90 transition-[background-color,transform] duration-200 group-hover:duration-300 ease-[ease] ${v.icon}`}
      />
    </a>
  )
}

// .button.is-secondary: .5px border (style none on desktop, dashed ≤991), 56px min height
const SECONDARY =
  'py-[.75rem] gap-[3rem] mobile-p:gap-0 border-hair border-none tablet:border-dashed mobile-p:border-[1px] mobile-l:justify-center mobile-l:items-center'

const OUTLINE_VARIANTS = {
  // [data-wf--button-outline--variant="base"] — "Explore the platform"
  base: 'btn-outline-dashed border-border bg-transparent min-h-[56px] mobile-l:min-h-[50px] px-[1.5rem] text-[1.125rem]',
  // [data-wf--button-outline--variant="small"] — nav "Login"
  small:
    'btn-outline-dashed border-border bg-transparent min-h-0 mobile-l:min-h-[50px] px-[1rem] text-[1rem] tablet:justify-between tablet:items-center tablet:w-full',
  // [data-wf--button-outline--variant="black"] — desktop nav "Book a call"
  black:
    'border-black bg-black hover:bg-black-hover transition-[background-color] duration-200 ease-[ease] min-h-0 mobile-l:min-h-[50px] text-white px-[1rem] text-[1rem]',
  // .button.is-secondary.black.mobile-32px — tablet/mobile nav "Book a call". No hover rule on the original;
  // its 3-class selector keeps min-height:auto even under the ≤767 min-height:50px rule.
  blackMobile: 'border-black bg-black min-h-0 text-white px-[1rem] text-[1rem] tablet:max-h-[32px]',
}

export function OutlineButton({ href, children, variant = 'base', className = '' }) {
  return (
    <a href={href} className={`${BUTTON} ${SECONDARY} ${OUTLINE_VARIANTS[variant]} ${className}`}>
      <div>{children}</div>
    </a>
  )
}

/* ---------- Eyebrow (small label with two 14px icons) ---------- */
export function Eyebrow({ left, right, children, green = false }) {
  return (
    <div className="flex gap-[12px] justify-start items-center">
      <img src={asset(left)} alt="" loading="lazy" className="w-[14px] min-w-[14px] h-[14px] min-h-[14px]" />
      <div className={`${T_REG} ${green ? 'text-green' : 'text-grey-v2'}`}>{children}</div>
      <img src={asset(right)} alt="" loading="lazy" className="w-[14px] min-w-[14px] h-[14px] min-h-[14px]" />
    </div>
  )
}

/* ---------- Lines divider component (data-wf--lines-divider--variant) ---------- */
const LINE_DIVIDER = '6941785a4b1f2df4106341e2_Line-Divider.svg'
const DIVIDER_VERTICAL = '6939575c46881e7082982980_Divider-Horizontal.svg'

/** variant="base": full-width hairline band between sections. */
export function LinesDivider() {
  return (
    <section className="w-full border-y-hair border-solid border-border">
      <div className={PADDING_GLOBAL}>
        <div className={CONTAINER}>
          <div className="w-full h-full border-x-hair border-border">
            <img
              src={asset(LINE_DIVIDER)}
              alt=""
              loading="lazy"
              className="block w-full h-full min-h-[1px] object-cover tablet:min-h-[4rem] mobile-p:min-h-[3.5rem]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/** variant="horizontal-10rem": absolute 8rem vertical strip inside .divider-horizontal-wrapper. */
export function SideStripDivider() {
  return (
    <section className="absolute inset-0 w-full min-w-[8rem] max-w-[8rem] h-auto overflow-hidden">
      <div className="w-full h-full px-0">
        <div className={`${CONTAINER} h-full`}>
          <div className="w-full h-full">
            <img
              src={asset(DIVIDER_VERTICAL)}
              alt=""
              loading="lazy"
              className="block w-full min-w-[8rem] h-full min-h-0 max-h-none object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/** .divider-horizontal-wrapper (left, or right-side) holding the 8rem strip; hidden ≤991. */
export function SideStripColumn({ right = false }) {
  return (
    <div
      className={`relative w-full h-full max-h-full border-t-hair border-border tablet:hidden ${
        right ? 'border-l-hair overflow-visible' : 'border-r-hair'
      }`}
    >
      <SideStripDivider />
    </div>
  )
}

/** variant="horizontal-3rem": 3rem vertical strip used as a grid column; hidden ≤991. */
export function NarrowStripDivider() {
  return (
    <section className="w-full border-t-hair border-solid border-border tablet:hidden">
      <div className="h-full px-0">
        <div className={`${CONTAINER} h-full`}>
          <div className="w-full h-full">
            <img
              src={asset(DIVIDER_VERTICAL)}
              alt=""
              loading="lazy"
              className="block w-full h-full min-h-0 min-w-[3rem] max-w-[3rem] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Lottie player ----------
   svg renderer; `autoplay`/`loop` mirror data-autoplay / data-loop. The lottie-web instance is
   exposed on the container as `el.lottie` (same as Webflow).

   Behaviour measured on the live site (Webflow lottie module + IX2):
   - autoplay elements (970-04, the 4 benefits-tab lotties) play from load; the FIRST time the
     element intersects the viewport (any pixel; a hidden tab pane counts once it is displayed)
     they restart from frame 0; afterwards they pause while out of view and resume on return.
   - `ix` = IX2 SCROLL_INTO_VIEW → PLUGIN_LOTTIE action (fires once): when the element overlaps the
     viewport inset by `offset`% top & bottom, jump to frame 0, wait `delay` ms, then tween the
     frame to `to`% of totalFrames over `duration` ms ('auto' = native length) with `ease`.
     IX2 only renders while on screen, but the tween is wall-clock based, so an always-on tween
     is visually identical. */
export function Lottie({ src, className = '', loop = false, autoplay = false, name, ix }) {
  const ref = useRef(null)
  const ixKey = ix ? JSON.stringify(ix) : ''
  useEffect(() => {
    const el = ref.current
    const anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay, path: src, name })
    el.lottie = anim
    const cleanups = []
    const cfg = ixKey ? JSON.parse(ixKey) : null

    const onLoaded = () => {
      if (autoplay) {
        let seen = false
        let pausedByView = false
        const io = new IntersectionObserver((entries) => {
          const e = entries[entries.length - 1]
          if (e.isIntersecting) {
            if (!seen) {
              seen = true
              anim.goToAndPlay(0, true)
            } else if (pausedByView) {
              pausedByView = false
              anim.play()
            }
          } else if (seen && !anim.isPaused) {
            pausedByView = true
            anim.pause()
          }
        })
        io.observe(el)
        cleanups.push(() => io.disconnect())
      }
      if (cfg) {
        const band = `-${cfg.offset || 0}% 0px -${cfg.offset || 0}% 0px`
        let cancel = () => {}
        let timer
        const io = new IntersectionObserver(
          (entries) => {
            if (!entries[entries.length - 1].isIntersecting) return
            io.disconnect()
            anim.goToAndStop(0, true)
            timer = setTimeout(() => {
              const total = anim.totalFrames
              const target = (total * cfg.to) / 100
              const ms = cfg.duration === 'auto' ? (total / anim.frameRate) * 1000 : cfg.duration
              cancel = tween({
                duration: ms,
                ease: EASE[cfg.ease || 'linear'],
                onUpdate: (p) => anim.goToAndStop(target * p, true),
              })
            }, cfg.delay || 0)
          },
          { rootMargin: band },
        )
        io.observe(el)
        cleanups.push(() => {
          io.disconnect()
          clearTimeout(timer)
          cancel()
        })
      }
    }
    if (anim.isLoaded) onLoaded()
    else anim.addEventListener('DOMLoaded', onLoaded)

    return () => {
      cleanups.forEach((c) => c())
      anim.destroy()
      delete el.lottie
    }
  }, [src, loop, autoplay, name, ixKey])
  return <div ref={ref} className={className} data-lottie={name} data-src={src} />
}
