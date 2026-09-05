import React from 'react'

// Generic card-network indicators — styled to be instantly recognizable
// by shape/color convention without reproducing either company's actual
// trademarked logo artwork.
export function VisaBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-[4px] bg-[#1a1f71] px-2.5 font-serif text-sm font-bold italic tracking-wide text-white ${className}`}
    >
      VISA
    </span>
  )
}

export function MastercardBadge({ className = '' }) {
  return (
    <span className={`inline-flex h-7 items-center gap-[-8px] rounded-[4px] bg-white px-1.5 ${className}`}>
      <span className="relative flex items-center">
        <span className="h-5 w-5 rounded-full bg-[#eb001b]" />
        <span className="-ml-2 h-5 w-5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </span>
    </span>
  )
}

export function CardBrandRow({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <VisaBadge />
      <MastercardBadge />
    </div>
  )
}

// Guesses the network from the first digit — standard card BIN convention
// (4 = Visa, 5 = Mastercard). Client-side display only; never sent
// anywhere as if it were a real verification.
export function guessBrand(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  return null
}
