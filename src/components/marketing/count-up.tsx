'use client'
import { useEffect, useRef, useState } from 'react'

export function CountUp({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let frame = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        const start = performance.now()
        const tick = (t: number) => {
          const p = Math.min((t - start) / 1400, 1)
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
          if (p < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        io.unobserve(el)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(frame) }
  }, [value])

  return <span ref={ref} className={className}><span className="sr-only">{value.toLocaleString('id-ID')}</span><span aria-hidden="true">{display.toLocaleString('id-ID')}</span></span>
}
