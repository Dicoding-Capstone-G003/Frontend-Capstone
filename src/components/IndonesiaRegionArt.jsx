const REGION_SHAPES = [
  { id: 'Sumatra', x: 62, y: 122, width: 76, height: 18, rotate: -26 },
  { id: 'Jawa', x: 138, y: 196, width: 92, height: 12, rotate: -3 },
  { id: 'Kalimantan', x: 214, y: 94, width: 98, height: 76, rotate: 0 },
  { id: 'Sulawesi', x: 340, y: 102, width: 28, height: 72, rotate: 18 },
  { id: 'Nusa Tenggara', x: 246, y: 212, width: 104, height: 10, rotate: 3 },
  { id: 'Maluku', x: 394, y: 144, width: 46, height: 22, rotate: 10 },
  { id: 'Papua', x: 460, y: 116, width: 118, height: 54, rotate: 4 },
];

export function IndonesiaRegionArt({ selectedRegion }) {
  return (
    <div className="map-card">
      <div className="map-card__header">
        <div>
          <p className="eyebrow">Regional focus</p>
          <h3>Indonesia forecast coverage</h3>
        </div>
        <span className="map-card__pill">{selectedRegion || 'Choose a region'}</span>
      </div>

      <svg className="indo-map" viewBox="0 0 620 280" role="img" aria-label="Stylized map of Indonesia">
        <defs>
          <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eff8ff" />
            <stop offset="100%" stopColor="#d8ecff" />
          </linearGradient>
          <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd76a" />
            <stop offset="100%" stopColor="#ff9f5a" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="620" height="280" rx="28" fill="url(#seaGradient)" />
        <circle cx="530" cy="50" r="26" fill="#ffd35e" opacity="0.9" />
        <path
          d="M35 60 C140 22, 246 22, 330 56 S540 96, 590 52"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
          fill="none"
        />

        {REGION_SHAPES.map((shape) => {
          const isActive = selectedRegion === shape.id;

          return (
            <g
              key={shape.id}
              transform={`translate(${shape.x} ${shape.y}) rotate(${shape.rotate})`}
              className={isActive ? 'island active' : 'island'}
            >
              <rect
                x={0}
                y={0}
                rx={shape.height / 2}
                width={shape.width}
                height={shape.height}
                fill="url(#landGradient)"
              />
              <text x={shape.width / 2} y={shape.height + 22} textAnchor="middle">
                {shape.id}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="map-card__note">
        Visual ini adalah representasi desain wilayah Indonesia untuk membantu orientasi region pada MVP.
      </p>
    </div>
  );
}
