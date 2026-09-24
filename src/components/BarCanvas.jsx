import { useEffect, useRef } from 'react'
import p5 from 'p5'

/* Port of the original inline p5.js (v1.9.0) sketch, kept verbatim in behaviour:
   - `.canvas` (Build section) stacks bars from the top down; `.canvas-footer` from the bottom up.
   - 12px columns, 4px gap, bar heights from [20, 25, 15, 35], colours #D9FADA / #F5FEF6 / #ECFDEC.
   - Idle: each bar's alpha pulses (sin, freq 0.02–0.04 per frame, 120–255) and its colour lerps
     between palette entries (0.01–0.02 per frame).
   - While the mouse is over the canvas rect (p5 tracks the pointer on window, so the
     pointer-events:none wrapper does not matter), bars within 150px scale up to 1.3x, go fully
     opaque and lerp toward a different palette colour.
   - Canvas is created at the container's offsetWidth × offsetHeight and rebuilt on window resize. */
const COLUMN_WIDTH = 12
const HEIGHTS = [20, 25, 15, 35]

function sketch(container, fromBottom) {
  return (p) => {
    let cols
    let bars = []
    let colors

    p.setup = () => {
      const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight)
      canvas.parent(container)
      canvas.style('display', 'block')
      initColors()
      p.randomSeed(42 + Math.random() * 1000)
      initializeBars()
      p.randomSeed()
    }

    p.draw = () => {
      p.clear()
      const hovering = p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height
      for (const bar of bars) {
        if (hovering) bar.reactToMouse(p.mouseX, p.mouseY)
        else bar.updateNaturalAnimation(p.frameCount)
        bar.updateColor()
        bar.display()
      }
    }

    p.windowResized = () => {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight)
      initializeBars()
    }

    function initColors() {
      colors = [p.color('#D9FADA'), p.color('#F5FEF6'), p.color('#ECFDEC')]
    }

    function initializeBars() {
      bars = []
      const gap = 4
      cols = Math.floor((p.width + gap) / (COLUMN_WIDTH + gap))
      const containerHeight = p.height
      for (let i = 0; i < cols; i++) {
        const x = i * (COLUMN_WIDTH + gap)
        if (!fromBottom) {
          let currentY = 0
          while (currentY < containerHeight) {
            const height = HEIGHTS[Math.floor(p.random(HEIGHTS.length))]
            if (currentY + height <= containerHeight) {
              bars.push(new Bar(x, currentY, COLUMN_WIDTH, height, i))
              currentY += height + gap
            } else break
          }
        } else {
          let currentY = containerHeight
          while (currentY > 0) {
            const height = HEIGHTS[Math.floor(p.random(HEIGHTS.length))]
            if (currentY - height >= 0) {
              bars.push(new Bar(x, currentY - height, COLUMN_WIDTH, height, i))
              currentY -= height + gap
            } else break
          }
        }
      }
    }

    class Bar {
      constructor(x, y, w, h, col) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.col = col
        this.baseX = x
        this.baseY = y
        this.baseW = w
        this.baseH = h
        this.scale = 1
        this.opacity = p.random(150, 255)
        this.colorIndex = Math.floor(p.random(colors.length))
        this.nextColorIndex = Math.floor(p.random(colors.length))
        this.colorLerpT = p.random()
        this.colorSpeed = p.random(0.01, 0.02)
        this.pulsePhase = p.random(p.TWO_PI)
        this.pulseFrequency = p.random(0.02, 0.04)
      }

      updateColor() {
        this.colorLerpT += this.colorSpeed
        if (this.colorLerpT > 1) {
          this.colorLerpT = 0
          this.colorIndex = this.nextColorIndex
          this.nextColorIndex = Math.floor(p.random(colors.length))
        }
        this.currentColor = p.lerpColor(colors[this.colorIndex], colors[this.nextColorIndex], this.colorLerpT)
      }

      updateNaturalAnimation(t) {
        const pulse = p.sin(t * this.pulseFrequency + this.pulsePhase)
        this.opacity = p.map(pulse, -1, 1, 120, 255)
      }

      reactToMouse(mx, my) {
        const centerX = this.baseX + this.baseW / 2
        const centerY = this.baseY + this.baseH / 2
        const d = p.dist(mx, my, centerX, centerY)
        const maxInfluence = 150
        const influence = p.constrain(1 - d / maxInfluence, 0, 1)
        if (influence > 0) {
          this.scale = 1 + influence * 0.3
          this.opacity = 255
          if (!this.hoverColorIndex) {
            let newColorIndex
            do {
              newColorIndex = Math.floor(p.random(colors.length))
            } while (newColorIndex === this.colorIndex)
            this.hoverColorIndex = newColorIndex
          }
          this.currentColor = p.lerpColor(this.currentColor, colors[this.hoverColorIndex], influence * 0.6)
        } else {
          this.scale = p.lerp(this.scale, 1, 0.1)
          this.hoverColorIndex = null
        }
      }

      display() {
        p.push()
        const centerX = this.baseX + this.baseW / 2
        const centerY = this.baseY + this.baseH / 2
        p.translate(centerX, centerY)
        p.scale(this.scale)
        p.translate(-this.baseW / 2, -this.baseH / 2)
        const c = this.currentColor
        c.setAlpha(this.opacity)
        p.noStroke()
        p.fill(c)
        p.rect(0, 0, this.baseW, this.baseH)
        p.pop()
      }
    }
  }
}

export default function BarCanvas({ variant, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const instance = new p5(sketch(ref.current, variant === 'footer'))
    return () => instance.remove()
  }, [variant])
  return <div ref={ref} className={className} data-canvas={variant} />
}
