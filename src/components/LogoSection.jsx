import { CONTAINER, Embed, PADDING_GLOBAL, SITE, T_REG, T_SMALL, asset } from './ui.jsx'
import { arrow20 } from './svgs.js'

// [href, label, alt, first <img>, second <img>, which of the two carries .is-active, extra]
// Image order and the .is-active placement are exactly as in the original DOM.
const LOGOS = [
  ['industry/cx-platforms', 'Customer experience', 'Qualtrics logo', '695fde2155874d4fd12d0c4d_Qualtrics-Grey.svg', '695fde2155874d4fd12d0c4d_Qualtrics-Grey.svg', 1, {}],
  ['industry/reputation-and-review-management', 'Reputation management', 'Yext logo', '695fdf576971eabc9e19d43a_Yext-Grey.svg', '695fd9af4bcc36dc8291d618_Yext-Logo.svg', 1, { last: true }],
  ['industry/retail', 'Retail', 'The Home Depot logo', '6938845d5dc733d389b6a1ea_Logo-item.svg', '695fdfa1c2e0872bf1a3fae2_Home-Grey.svg', 0, {}],
  ['industry/marketing-automation', 'Marketing automation', 'Brightlocal logo', '696a373d7cf15783304feb66_Bright-Color.svg', '696a3746c87f28ab9e71429c_Bright-Logo.svg', 0, { last: true, h35: true }],
  ['industry/agencies', 'Agencies', 'Epicor logo', '696a36646b979b2b9ba7d7c1_Epicor-Logo.svg', '696a36ca255645d4685a09f1_Epicor-Color.svg', 1, { spacer: true }],
  ['industry/social-listening', 'Social listening', 'Talkwalker logo', '695fd9e04757b43e0508f8c6_Talkwalker-Logo.svg', '695fdfe525c4cfc78899d65d_Talkwalker-Grey.svg', 0, { last: true, hideBorder: true }],
]

export default function LogoSection() {
  return (
    <section>
      <div className={PADDING_GLOBAL}>
        <div className={`${CONTAINER} border-x-hair border-border`}>
          <div className="w-full pt-[2rem]" />
          <div className="w-full h-full text-center tablet:px-[1.5rem]">
            <div className={`${T_REG} text-grey-v2`}>Powering data intelligence for leading platforms &amp; global brands</div>
          </div>
          <div className="w-full pt-[2rem]" />
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] auto-cols-fr gap-0 tablet:grid-cols-[1fr_1fr]">
            {LOGOS.map(([path, label, alt, a, b, activeIdx, o]) => {
              const img = (src, active) => (
                <img
                  key={src + active}
                  src={asset(src)}
                  alt={alt}
                  loading="lazy"
                  className={`block ${
                    active
                      ? 'absolute inset-0 w-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-[ease]'
                      : ''
                  } ${o.h35 ? 'h-[35px] mobile-p:h-[28px]' : ''}`}
                />
              )
              return (
                <a
                  key={path}
                  href={`${SITE}/${path}`}
                  className={`group relative flex flex-col justify-end items-center gap-[1.125rem] w-full max-w-full h-full min-h-[140px] pb-[1.125rem] border-t-hair border-border no-underline normal-case bg-transparent hover:bg-grey-v1 transition-[background-color] duration-300 ease-[ease] ${
                    o.hideBorder ? '' : 'border-r-hair'
                  } ${o.last ? 'tablet:border-r-0' : ''}`}
                >
                  <div className="relative">
                    {img(a, activeIdx === 0)}
                    {img(b, activeIdx === 1)}
                    {o.spacer && <div className="w-full pt-[.5rem]" />}
                  </div>
                  <div className={`${T_SMALL} text-grey-v2 text-center`}>{label}</div>
                  <div className="absolute top-[11px] right-[15px] opacity-0 translate-y-[10px] group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-[ease]">
                    <Embed svg={arrow20} className="block w-[20px] min-w-[20px] h-[20px] min-h-[20px]" />
                  </div>
                </a>
              )
            })}
          </div>
          <div className="w-full h-full border-x-hair border-border" />
        </div>
      </div>
    </section>
  )
}
