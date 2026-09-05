import React from 'react'

// An original illustration for the post-purchase "Ayubowan" greeting —
// stylized joined palms (the traditional Sri Lankan greeting gesture)
// resting inside a lotus bloom, drawn from scratch in the brand's own
// palette. Not a reproduction of any existing artwork or photograph.
export default function AyubowanGraphic({ className = '' }) {
  return (
    <svg viewBox="0 0 220 220" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="108" fill="#f4ecd8" stroke="#c9a35c" strokeWidth="1.5" />

      {/* Lotus petals */}
      <g fill="none" stroke="#2f6b4f" strokeWidth="2.5" strokeLinecap="round">
        <path d="M110 168 C 78 150, 62 118, 78 92" />
        <path d="M110 168 C 142 150, 158 118, 142 92" />
        <path d="M110 168 C 92 142, 88 112, 100 88" />
        <path d="M110 168 C 128 142, 132 112, 120 88" />
        <path d="M110 168 C 108 138, 108 108, 110 82" />
      </g>

      {/* Joined palms */}
      <g fill="#154430">
        <path d="M110 60
                 C 104 60 100 66 100 74
                 L 100 108
                 C 100 116 104 122 110 122
                 C 116 122 120 116 120 108
                 L 120 74
                 C 120 66 116 60 110 60 Z" />
        <path d="M96 70
                 C 90 72 87 80 89 88
                 L 96 112
                 C 98 119 104 123 109 121
                 C 114 119 116 112 114 105
                 L 105 76
                 C 103 70 100 68 96 70 Z"
              opacity="0.85" />
        <path d="M124 70
                 C 130 72 133 80 131 88
                 L 124 112
                 C 122 119 116 123 111 121
                 C 106 119 104 112 106 105
                 L 115 76
                 C 117 70 120 68 124 70 Z"
              opacity="0.85" />
      </g>

      {/* Wrist / cuff line */}
      <path d="M92 118 Q 110 132 128 118" fill="none" stroke="#c9a35c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
