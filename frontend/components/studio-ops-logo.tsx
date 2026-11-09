import React from 'react'

export interface StudioOpsLogoProps {
  variant?: 'emblem' | 'horizontal' | 'full'
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  className?: string
  animated?: boolean
}

const TOP_SWOOSH_PATH =
  'M 105.00 30.00 C 106.26 29.82, 109.74 29.82, 111.00 30.00 C 112.26 30.18, 111.82 29.56, 112.00 31.00 C 112.18 32.44, 111.28 36.20, 112.00 38.00 C 112.72 39.80, 114.02 40.46, 116.00 41.00 C 117.98 41.54, 121.56 41.18, 123.00 41.00 C 124.44 40.82, 122.02 40.36, 124.00 40.00 C 125.98 39.64, 132.02 39.36, 134.00 39.00 C 135.98 38.64, 133.56 38.18, 135.00 38.00 C 136.44 37.82, 140.56 38.18, 142.00 38.00 C 143.44 37.82, 138.14 37.18, 143.00 37.00 C 147.86 36.82, 164.14 36.82, 169.00 37.00 C 173.86 37.18, 167.84 37.64, 170.00 38.00 C 172.16 38.36, 175.96 37.92, 181.00 39.00 C 186.04 40.08, 198.36 43.10, 198.00 44.00 C 197.64 44.90, 182.60 43.82, 179.00 44.00 C 175.40 44.18, 182.50 44.64, 178.00 45.00 C 173.50 45.36, 158.50 45.64, 154.00 46.00 C 149.50 46.36, 154.98 46.64, 153.00 47.00 C 151.02 47.36, 149.30 46.56, 143.00 48.00 C 136.70 49.44, 126.10 52.12, 118.00 55.00 C 109.90 57.88, 104.30 60.76, 98.00 64.00 C 91.70 67.24, 88.40 69.22, 83.00 73.00 C 77.60 76.78, 72.68 80.50, 68.00 85.00 C 63.32 89.50, 59.34 96.20, 57.00 98.00 C 54.66 99.80, 55.36 96.62, 55.00 95.00 C 54.64 93.38, 55.18 90.26, 55.00 89.00 C 54.82 87.74, 54.00 88.54, 54.00 88.00 C 54.00 87.46, 54.82 87.44, 55.00 86.00 C 55.18 84.56, 54.46 82.70, 55.00 80.00 C 55.54 77.30, 56.38 74.60, 58.00 71.00 C 59.62 67.40, 62.38 62.70, 64.00 60.00 C 65.62 57.30, 63.40 59.60, 67.00 56.00 C 70.60 52.40, 78.78 44.14, 84.00 40.00 C 89.22 35.86, 93.48 34.26, 96.00 33.00 C 98.52 31.74, 97.10 33.36, 98.00 33.00 C 98.90 32.64, 99.92 31.36, 101.00 31.00 C 102.08 30.64, 103.28 31.18, 104.00 31.00 C 104.72 30.82, 103.74 30.18, 105.00 30.00 Z'

const BOT_SWOOSH_PATH =
  'M 192.00 76.00 C 192.54 76.00, 193.46 76.28, 194.00 77.00 C 194.54 77.72, 194.82 76.94, 195.00 80.00 C 195.18 83.06, 196.08 88.78, 195.00 94.00 C 193.92 99.22, 191.34 104.50, 189.00 109.00 C 186.66 113.50, 185.06 115.40, 182.00 119.00 C 178.94 122.60, 175.78 125.76, 172.00 129.00 C 168.22 132.24, 165.14 134.48, 161.00 137.00 C 156.86 139.52, 152.42 141.56, 149.00 143.00 C 145.58 144.44, 143.98 144.82, 142.00 145.00 C 140.02 145.18, 138.72 145.44, 138.00 144.00 C 137.28 142.56, 138.90 138.98, 138.00 137.00 C 137.10 135.02, 134.80 133.72, 133.00 133.00 C 131.20 132.28, 129.08 132.82, 128.00 133.00 C 126.92 133.18, 128.08 133.82, 127.00 134.00 C 125.92 134.18, 124.16 133.64, 122.00 134.00 C 119.84 134.36, 117.34 135.64, 115.00 136.00 C 112.66 136.36, 110.26 135.82, 109.00 136.00 C 107.74 136.18, 110.34 136.82, 108.00 137.00 C 105.66 137.18, 98.52 136.82, 96.00 137.00 C 93.48 137.18, 94.54 138.00, 94.00 138.00 C 93.46 138.00, 96.60 137.36, 93.00 137.00 C 89.40 136.64, 77.60 136.36, 74.00 136.00 C 70.40 135.64, 74.80 135.36, 73.00 135.00 C 71.20 134.64, 66.88 134.72, 64.00 134.00 C 61.12 133.28, 59.34 131.72, 57.00 131.00 C 54.66 130.28, 46.86 130.18, 51.00 130.00 C 55.14 129.82, 74.60 130.18, 80.00 130.00 C 85.40 129.82, 77.94 129.36, 81.00 129.00 C 84.06 128.64, 93.94 128.36, 97.00 128.00 C 100.06 127.64, 96.92 127.18, 98.00 127.00 C 99.08 126.82, 101.92 127.18, 103.00 127.00 C 104.08 126.82, 103.10 126.18, 104.00 126.00 C 104.90 125.82, 107.10 126.18, 108.00 126.00 C 108.90 125.82, 106.12 125.72, 109.00 125.00 C 111.88 124.28, 119.68 123.26, 124.00 122.00 C 128.32 120.74, 130.48 118.90, 133.00 118.00 C 135.52 117.10, 134.22 118.62, 138.00 117.00 C 141.78 115.38, 148.06 112.42, 154.00 109.00 C 159.94 105.58, 164.70 103.04, 171.00 98.00 C 177.30 92.96, 185.40 84.78, 189.00 81.00 C 192.60 77.22, 190.46 77.90, 191.00 77.00 C 191.54 76.10, 191.46 76.00, 192.00 76.00 Z'

const TOP_DROP_PATH =
  'M 141.00 19.00 C 141.36 19.00, 141.10 19.82, 142.00 20.00 C 142.90 20.18, 144.92 19.82, 146.00 20.00 C 147.08 20.18, 147.64 20.28, 148.00 21.00 C 148.36 21.72, 148.36 23.10, 148.00 24.00 C 147.64 24.90, 147.08 25.28, 146.00 26.00 C 144.92 26.72, 144.16 27.64, 142.00 28.00 C 139.84 28.36, 135.62 27.82, 134.00 28.00 C 132.38 28.18, 134.08 28.82, 133.00 29.00 C 131.92 29.18, 129.08 29.18, 128.00 29.00 C 126.92 28.82, 127.72 28.18, 127.00 28.00 C 126.28 27.82, 124.72 28.36, 124.00 28.00 C 123.28 27.64, 122.82 26.72, 123.00 26.00 C 123.18 25.28, 123.56 24.90, 125.00 24.00 C 126.44 23.10, 129.56 21.54, 131.00 21.00 C 132.44 20.46, 132.46 21.18, 133.00 21.00 C 133.54 20.82, 132.74 20.18, 134.00 20.00 C 135.26 19.82, 138.74 20.18, 140.00 20.00 C 141.26 19.82, 140.64 19.00, 141.00 19.00 Z'

const BOT_DROP_PATH =
  'M 109.00 146.00 C 112.24 145.82, 122.76 145.64, 126.00 146.00 C 129.24 146.36, 127.72 146.92, 127.00 148.00 C 126.28 149.08, 123.26 151.28, 122.00 152.00 C 120.74 152.72, 121.08 151.64, 120.00 152.00 C 118.92 152.36, 117.26 153.64, 116.00 154.00 C 114.74 154.36, 113.72 153.82, 113.00 154.00 C 112.28 154.18, 112.72 154.82, 112.00 155.00 C 111.28 155.18, 109.72 155.18, 109.00 155.00 C 108.28 154.82, 109.08 154.18, 108.00 154.00 C 106.92 153.82, 104.26 154.36, 103.00 154.00 C 101.74 153.64, 101.36 152.54, 101.00 152.00 C 100.64 151.46, 100.46 151.72, 101.00 151.00 C 101.54 150.28, 102.74 148.72, 104.00 148.00 C 105.26 147.28, 107.10 147.36, 108.00 147.00 C 108.90 146.64, 105.76 146.18, 109.00 146.00 Z'

export function StudioOpsLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  animated = false,
}: StudioOpsLogoProps) {
  const sizeMap = {
    sm: { height: 26, width: variant === 'emblem' ? 26 : 140 },
    md: { height: 34, width: variant === 'emblem' ? 34 : 175 },
    lg: { height: 48, width: variant === 'emblem' ? 48 : 230 },
    xl: { height: 80, width: variant === 'emblem' ? 80 : 320 },
  }

  const dimensions =
    typeof size === 'number'
      ? { height: size, width: variant === 'emblem' ? size : size * 4.5 }
      : sizeMap[size] || sizeMap.md

  // Emblem Only Component
  const renderEmblem = (emblemSize: number = dimensions.height) => (
    <svg
      viewBox="40 12 170 150"
      width={emblemSize}
      height={emblemSize}
      className={`studio-ops-emblem-svg ${animated ? 'so-pulse-hover' : ''}`}
      aria-label="StudioOps Emblem"
      fill="none"
    >
      <defs>
        <linearGradient id="soGradTopComp" x1="0%" y1="75%" x2="100%" y2="25%">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="30%" stopColor="#00d2ff" />
          <stop offset="70%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        <linearGradient id="soGradBotComp" x1="0%" y1="25%" x2="100%" y2="75%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="35%" stopColor="#6366f1" />
          <stop offset="75%" stopColor="#00d2ff" />
          <stop offset="100%" stopColor="#00f5d4" />
        </linearGradient>

        <linearGradient id="soGradDropComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        <filter id="soNeonGlowComp" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="soTextGlowComp" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#00f5d4" floodOpacity="0.95" />
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00e5ff" floodOpacity="0.7" />
        </filter>
      </defs>

      <g className="so-emblem-shapes">
        <path d={TOP_DROP_PATH} fill="url(#soGradDropComp)" />
        <path
          d={TOP_SWOOSH_PATH}
          fill="url(#soGradTopComp)"
          filter="url(#soNeonGlowComp)"
        />
        <path
          d={BOT_SWOOSH_PATH}
          fill="url(#soGradBotComp)"
          filter="url(#soNeonGlowComp)"
        />
        <path d={BOT_DROP_PATH} fill="url(#soGradDropComp)" />

        <text
          x="126"
          y="93"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, Bahnschrift, 'Segoe UI', Montserrat, sans-serif"
          fontSize="29"
          fontWeight="900"
          letterSpacing="-0.02em"
          filter="url(#soTextGlowComp)"
        >
          SO
        </text>
      </g>
    </svg>
  )

  if (variant === 'emblem') {
    return (
      <div
        className={`studio-ops-logo-wrap emblem-only ${className}`}
        style={{ width: dimensions.height, height: dimensions.height }}
      >
        {renderEmblem(dimensions.height)}
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className={`studio-ops-logo-full ${className}`}>
        {renderEmblem(typeof dimensions.height === 'number' ? dimensions.height * 1.4 : 64)}
        <span className="studio-ops-logo-text-stacked">
          STUDIO <span className="so-accent-neon">OPS</span>
        </span>
      </div>
    )
  }

  // Default: Horizontal
  return (
    <div className={`studio-ops-logo-horizontal ${className}`}>
      {renderEmblem(dimensions.height)}
      <span className="studio-ops-brand-name">
        studio<span className="so-brand-ops">ops</span>
      </span>
    </div>
  )
}

export default StudioOpsLogo
