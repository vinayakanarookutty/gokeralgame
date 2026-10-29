/**
 * Icons.jsx
 * Bespoke, resolution-independent SVG vector iconography for GoKeralam.
 * Designed with a classy Kerala cultural aesthetic: Kasavu gold, monsoon greens,
 * sacred temple motifs, and minimalist modern gaming geometry.
 * Completely replaces low-fidelity system emojis with elegant, unified vector art.
 */

import React from 'react';

// ─── 1. Kerala Cultural Collectibles ───

/** Kasavu Gold Coin - Intricate dual-ring coin with traditional Kerala chakra / sunburst core */
export const KasavuCoinIcon = ({ size = 20, color = '#ffd700', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.6" fill="rgba(212, 175, 55, 0.15)" />
    <circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth="1" strokeDasharray="1.5 1.5" />
    <path
      d="M12 7V17M7 12H17M8.5 8.5L15.5 15.5M8.5 15.5L15.5 8.5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

/** Tender Coconut - Clean stylized tropical coconut husk with drinking palm reed */
export const CoconutIcon = ({ size = 20, color = '#6ee7b7', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {/* Coconut Body */}
    <ellipse cx="12" cy="13.5" rx="8" ry="7.5" fill="rgba(110, 231, 183, 0.18)" stroke={color} strokeWidth="1.6" />
    {/* Crown cut */}
    <path
      d="M7.5 9.5C8.8 8 10.3 7.2 12 7.2C13.7 7.2 15.2 8 16.5 9.5"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Husk texture ribs */}
    <path
      d="M12 9.5V20M8 12C8 16 9.5 19 12 20M16 12C16 16 14.5 19 12 20"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.6"
      strokeLinecap="round"
    />
    {/* Palm straw reed */}
    <path
      d="M13 7.5L16.5 3"
      stroke="#ffd700"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/** Vitality Heart - Classical contoured heart with refined gold inner trim */
export const VitalityHeartIcon = ({ size = 20, filled = true, color = '#ef4444', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'none'}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      filter: filled ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.45))' : 'none',
      opacity: filled ? 1 : 0.3,
    }}
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke={filled ? '#ffd700' : '#888'}
      strokeWidth="1.2"
    />
  </svg>
);

// ─── 2. Gesture & Movement Icons ───

/** Athletic Runner Silhouette */
export const RunnerIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {/* Head */}
    <circle cx="14.5" cy="5" r="2.2" fill={color} />
    {/* Torso & limbs */}
    <path
      d="M10 10.5L13.5 8.5L16.5 10.5L19.5 9.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 8.5L11 14L8 16L5 15.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 14L14.5 17.5L16 21.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 10.5L7 11.5L4.5 10"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Full Body Stance (Upper / Half Body Mode) */
export const BodyStanceIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <circle cx="12" cy="5" r="2.4" stroke={color} strokeWidth="1.6" />
    <path
      d="M6.5 11L9.5 8.5C10.2 7.9 11.1 7.6 12 7.6C12.9 7.6 13.8 7.9 14.5 8.5L17.5 11"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 9V16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M9.5 21L11.5 16H12.5L14.5 21"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Seated / Head-Only Profile */
export const HeadMotionIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <circle cx="12" cy="8" r="4.2" stroke={color} strokeWidth="1.6" fill="rgba(255,255,255,0.06)" />
    <path
      d="M5.5 20C5.5 16.5 8.4 14.2 12 14.2C15.6 14.2 18.5 16.5 18.5 20"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M9 20H15"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/** Palm / Air Gesture Controller */
export const PalmGestureIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M8.5 11.5V6C8.5 5.2 9.1 4.5 9.9 4.5C10.7 4.5 11.3 5.2 11.3 6V11M11.3 6V4C11.3 3.2 11.9 2.5 12.7 2.5C13.5 2.5 14.1 3.2 14.1 4V11M14.1 6V5C14.1 4.2 14.7 3.5 15.5 3.5C16.3 3.5 16.9 4.2 16.9 5V12.5M16.9 9C16.9 8.2 17.5 7.5 18.3 7.5C19.1 7.5 19.7 8.2 19.7 9V14.5C19.7 18 17 21 13.5 21C9.9 21 6.5 18 6.5 14.5V11C6.5 10.2 7.1 9.5 7.9 9.5C8.7 9.5 9.3 10.2 9.3 11"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── 3. Navigation & Actions ───

/** Classical Trophy & Laurel Wreath (Leaderboard) */
export const TrophyIcon = ({ size = 20, color = '#ffd700', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M7 4H17V9C17 11.8 14.8 14 12 14C9.2 14 7 11.8 7 9V4Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="rgba(212, 175, 55, 0.12)"
    />
    <path
      d="M7 6H4C3.4 6 3 6.4 3 7C3 9.2 4.8 11 7 11V6ZM17 6H20C20.6 6 21 6.4 21 7C21 9.2 19.2 11 17 11V6Z"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M12 14V18M8 21H16M9 18H15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** Antique Compass & Kerala Map */
export const CompassMapIcon = ({ size = 20, color = '#ffd700', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.2" fill={color} />
    <path
      d="M15.5 8.5L12 12L8.5 15.5L10 10L15.5 8.5Z"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
      fill="rgba(212, 175, 55, 0.25)"
    />
    <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** Precision Calibration / Tuning Sliders */
export const CalibrationSlidersIcon = ({ size = 20, color = '#ffd700', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M4 7H14M18 7H20M14 5V9M4 17H8M12 17H20M8 15V19" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="16" cy="7" r="2" stroke={color} strokeWidth="1.6" />
    <circle cx="10" cy="17" r="2" stroke={color} strokeWidth="1.6" />
  </svg>
);

/** Audio Speaker / Mute */
export const AudioVolumeIcon = ({ size = 20, muted = false, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M11 5L6 9H3C2.4 9 2 9.4 2 10V14C2 14.6 2.4 15 3 15H6L11 19V5Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="rgba(255,255,255,0.08)"
    />
    {muted ? (
      <path d="M16 9L21 14M21 9L16 14" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
    ) : (
      <path
        d="M15.5 8.5C16.8 9.8 17.5 11.5 17.5 12C17.5 12.5 16.8 14.2 15.5 15.5M18.5 5.5C20.8 7.8 22 10.8 22 12C22 13.2 20.8 16.2 18.5 18.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    )}
  </svg>
);

/** Pause Bars */
export const PauseIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <rect x="6" y="5" width="3.5" height="14" rx="1.5" fill={color} />
    <rect x="14.5" y="5" width="3.5" height="14" rx="1.5" fill={color} />
  </svg>
);

/** Play Chevron */
export const PlayIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M7 5.2C7 4.4 7.9 3.9 8.6 4.3L18.8 10.8C19.4 11.2 19.4 12.1 18.8 12.5L8.6 19C7.9 19.4 7 18.9 7 18.1V5.2Z"
      fill={color}
    />
  </svg>
);

/** Close / Dismiss '✕' */
export const CloseIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Refresh Circular Arrows */
export const RefreshIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M20 11C19.5 7 16 4 12 4C8.2 4 5 6.6 4.2 10.2M4 13C4.5 17 8 20 12 20C15.8 20 19 17.4 19.8 13.8"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M20 4V11H13M4 20V13H11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── 4. Directional Cues ───

export const ChevronLeftIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowUpIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 19V5M5 12L12 5L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowDownIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 5V19M5 12L12 19L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── 5. Kerala Cultural Motifs ───

/** Sacred Kerala Lotus & Kasavu Filigree Ornament */
export const KeralaLotusOrnament = ({ size = 24, color = '#ffd700' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M12 3C12 7 9 9 9 13C9 16 10.5 18 12 19C13.5 18 15 16 15 13C15 9 12 3 12 3Z"
      fill="rgba(212, 175, 55, 0.3)"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M7 9C8 12 6.5 14.5 5 15.5C6.5 17 9 17.5 10 16.5C8.5 15 8 12.5 7 9Z"
      fill="rgba(212, 175, 55, 0.2)"
      stroke={color}
      strokeWidth="1"
    />
    <path
      d="M17 9C16 12 17.5 14.5 19 15.5C17.5 17 15 17.5 14 16.5C15.5 15 16 12.5 17 9Z"
      fill="rgba(212, 175, 55, 0.2)"
      stroke={color}
      strokeWidth="1"
    />
    <circle cx="12" cy="19.5" r="1.5" fill={color} />
  </svg>
);

/** Snake Boat / Kettuvallam (Alappuzha Backwaters) */
export const SnakeBoatIcon = ({ size = 22, color = '#ffd700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path
      d="M2 15C5 15 8 13.5 12 13.5C16 13.5 19 15 22 15C19.5 18 15 19 12 19C8 19 4 18 2 15Z"
      fill="rgba(212, 175, 55, 0.2)"
      stroke={color}
      strokeWidth="1.5"
    />
    <path d="M22 15C22.5 12.5 22 9.5 21 7.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 12V14M10 11.5V14M14 11.5V14M18 12V14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M1 20C4 20 6 21 12 21C18 21 20 20 23 20" stroke="#38b2a3" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** Royal Temple Elephant Heraldry / Nettipattam (Thrissur Pooram) */
export const TempleElephantIcon = ({ size = 22, color = '#ffd700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    {/* Head crown */}
    <path
      d="M6 13C6 8.5 9 5 13.5 5C17.5 5 20.5 8 20.5 12C20.5 15.5 18.5 18 16 19V15C16 13 15 12 13 12H10"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Trunk curl */}
    <path
      d="M6 13C5.5 15.5 5.5 18.5 7.5 20C8.5 20.8 10 20 10.5 18.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Tusk */}
    <path d="M9 16C10.5 16.5 12 16.2 13 15.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    {/* Nettipattam gold forehead gem */}
    <polygon points="13.5,6.5 15,8.5 13.5,10.5 12,8.5" fill={color} />
  </svg>
);

/** Western Ghats Tea Hills (Munnar) */
export const TeaHillsIcon = ({ size = 22, color = '#6ee7b7' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path
      d="M3 19L8.5 10L14 19"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(110, 231, 183, 0.15)"
    />
    <path
      d="M11 19L15.5 12L21 19"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(110, 231, 183, 0.25)"
    />
    <path d="M6 14C8 13.5 11 14 13 14" stroke={color} strokeWidth="1" strokeDasharray="1.5 1.5" />
  </svg>
);

/** Arabian Sea Coast Waves (Fort Kochi / Kovalam) */
export const CoastWavesIcon = ({ size = 22, color = '#38b2a3' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path
      d="M2 10C5 7 8 13 12 10C16 7 19 13 22 10M2 15C5 12 8 18 12 15C16 12 19 18 22 15"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/** Chenda Percussion Beats / Pandi Melam Wave */
export const ChendaMelamIcon = ({ size = 20, color = '#ffd700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    {/* Chenda Drum Cylinder */}
    <ellipse cx="12" cy="7" rx="7" ry="2.8" stroke={color} strokeWidth="1.5" fill="rgba(212,175,55,0.2)" />
    <path d="M5 7V17C5 18.5 8.1 20 12 20C15.9 20 19 18.5 19 17V7" stroke={color} strokeWidth="1.5" />
    <ellipse cx="12" cy="17" rx="7" ry="2.8" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />
    {/* Rhythmic tension ropes */}
    <path d="M6.5 9L10 18.5M10.5 8.5L14 18.5M14.5 8.5L17.5 17.5" stroke={color} strokeWidth="1" strokeOpacity="0.7" />
  </svg>
);

