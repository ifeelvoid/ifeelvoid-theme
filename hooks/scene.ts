// Signal Bleed: scanlines drift down wide edge bands, a faint roll bar sweeps the screen,
// and purple tears cut across the margins every ~9–14s. The middle stays readable.
export const SIGNAL_BLEED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4" fill="#9d4edd" opacity="0.17"/></pattern>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000000"/><stop offset="0.6" stop-color="#060408"/><stop offset="1" stop-color="#22102f"/>
  </linearGradient>
  <linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="fadeR" x1="1" x2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="roll" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9d4edd" stop-opacity="0"/><stop offset="0.5" stop-color="#9d4edd" stop-opacity="0.07"/><stop offset="1" stop-color="#9d4edd" stop-opacity="0"/>
  </linearGradient>
  <mask id="edgeL"><rect width="480" height="1000" fill="url(#fadeL)"/></mask>
  <mask id="edgeR"><rect x="1120" width="480" height="1000" fill="url(#fadeR)"/></mask>
</defs>
<style>
  .drift { animation: drift 5s linear infinite; }
  @keyframes drift { from { transform: translateY(0); } to { transform: translateY(40px); } }
  .roll { animation: roll 11s linear infinite; }
  @keyframes roll { from { transform: translateY(-200px); } to { transform: translateY(1100px); } }
  .tear { opacity: 0; animation: tear 9s steps(1, end) infinite; }
  .t2 { animation-delay: 3.1s; animation-duration: 12s; }
  .t3 { animation-delay: 6.4s; animation-duration: 14s; }
  .t4 { animation-delay: 1.7s; animation-duration: 17s; }
  @keyframes tear {
    0% { opacity: 0; transform: translateX(0); }
    90% { opacity: 0.9; transform: translateX(-24px); }
    92% { opacity: 0.4; transform: translateX(36px); }
    94% { opacity: 1; transform: translateX(-10px); }
    96% { opacity: 0.6; transform: translateX(18px); }
    98% { opacity: 0; transform: translateX(0); }
  }
  .breathe { animation: breathe 6s ease-in-out infinite; }
  @keyframes breathe { 0%,100% { opacity: 0.45; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .drift, .roll, .tear, .breathe { animation: none; } }
</style>
<rect width="1600" height="1000" fill="url(#ground)"/>
<g mask="url(#edgeL)"><rect class="drift" y="-40" width="480" height="1080" fill="url(#scan)"/></g>
<g mask="url(#edgeR)"><rect class="drift" x="1120" y="-40" width="480" height="1080" fill="url(#scan)"/></g>
<rect class="roll" x="0" y="0" width="1600" height="160" fill="url(#roll)"/>
<rect class="breathe" x="0" y="0" width="4" height="1000" fill="#9d4edd"/>
<rect class="breathe" x="1596" y="0" width="4" height="1000" fill="#9d4edd"/>
<g class="tear"><rect x="0" y="212" width="420" height="5" fill="#9d4edd"/><rect x="60" y="220" width="180" height="2" fill="#efecf3" opacity="0.7"/></g>
<g class="tear t2"><rect x="1180" y="96" width="420" height="4" fill="#9d4edd"/><rect x="1300" y="103" width="140" height="7" fill="#7b2cbf"/></g>
<g class="tear t3"><rect x="0" y="540" width="320" height="4" fill="#9d4edd"/><rect x="1300" y="546" width="300" height="3" fill="#9d4edd"/><rect x="1380" y="552" width="90" height="2" fill="#efecf3" opacity="0.6"/></g>
<g class="tear t4"><rect x="0" y="742" width="260" height="6" fill="#7b2cbf"/><rect x="1240" y="380" width="360" height="3" fill="#9d4edd"/></g>
</svg>`
