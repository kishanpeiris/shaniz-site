import React from 'react'

const ITEMS = [
  '100% HERBAL',
  'SRI LANKAN GROWN',
  'SMALL-BATCH BLENDED',
  'NO SULFATES',
  'CRUELTY-FREE',
]

export default function Strip() {
  // Render enough repeats that even an ultra-wide screen never runs out of
  // content mid-loop (the marquee keyframes always translate by exactly
  // -50%, so any even number of copies loops seamlessly).
  const doubled = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS]
  return (
    <div className="overflow-hidden bg-forest py-3">
      <div className="flex w-max animate-marquee gap-20 whitespace-nowrap text-xs uppercase tracking-[0.18em] text-goldLight">
        {doubled.map((item, i) => (
          <span key={i} className="opacity-90">
            {item} ·
          </span>
        ))}
      </div>
    </div>
  )
}
