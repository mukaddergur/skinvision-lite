export const FACE_MODEL_SRC = '/faces/face-model.jpg';
export const FACE_ASPECT = '639 / 1024';

const MARKERS = {
  forehead: [
    { left: 24, top: 13, w: 52, h: 14, fill: 'rgba(251,113,133,0.28)', border: '#fb7185' },
  ],
  cheeks: [
    { left: 22, top: 44, w: 18, h: 17, fill: 'rgba(56,189,248,0.28)', border: '#38bdf8' },
    { left: 60, top: 44, w: 18, h: 17, fill: 'rgba(56,189,248,0.28)', border: '#38bdf8' },
  ],
  underEye: [
    { left: 26, top: 36, w: 14, h: 9, fill: 'rgba(129,140,248,0.28)', border: '#818cf8' },
    { left: 60, top: 36, w: 14, h: 9, fill: 'rgba(129,140,248,0.28)', border: '#818cf8' },
  ],
  redness: [
    { left: 24, top: 13, w: 52, h: 14, fill: 'rgba(239,68,68,0.2)', border: '#ef4444' },
    { left: 22, top: 44, w: 18, h: 17, fill: 'rgba(239,68,68,0.28)', border: '#ef4444' },
    { left: 60, top: 44, w: 18, h: 17, fill: 'rgba(239,68,68,0.28)', border: '#ef4444' },
  ],
  chin: [
    { left: 28, top: 58, w: 44, h: 15, fill: 'rgba(74,222,128,0.28)', border: '#4ade80' },
  ],
  tzone: [
    { left: 33, top: 15, w: 34, h: 13, fill: 'rgba(251,146,60,0.28)', border: '#fb923c' },
    { left: 40, top: 30, w: 20, h: 34, fill: 'rgba(251,146,60,0.24)', border: '#fb923c' },
  ],
  tzonePurple: [
    { left: 33, top: 15, w: 34, h: 13, fill: 'rgba(167,139,250,0.28)', border: '#a78bfa' },
    { left: 40, top: 30, w: 20, h: 34, fill: 'rgba(167,139,250,0.24)', border: '#a78bfa' },
  ],
  dryCheeks: [
    { left: 22, top: 44, w: 18, h: 17, fill: 'rgba(244,114,182,0.28)', border: '#f472b6' },
    { left: 60, top: 44, w: 18, h: 17, fill: 'rgba(244,114,182,0.28)', border: '#f472b6' },
  ],
  balanced: [
    { left: 14, top: 10, w: 72, h: 80, fill: 'rgba(52,211,153,0.14)', border: '#34d399' },
  ],
  sensitive: [
    { left: 20, top: 16, w: 60, h: 58, fill: 'rgba(244,114,182,0.2)', border: '#f472b6' },
  ],
  combination: [
    { left: 33, top: 15, w: 34, h: 13, fill: 'rgba(251,146,60,0.26)', border: '#fb923c' },
    { left: 40, top: 30, w: 20, h: 34, fill: 'rgba(251,146,60,0.22)', border: '#fb923c' },
    { left: 22, top: 44, w: 18, h: 17, fill: 'rgba(167,139,250,0.26)', border: '#a78bfa' },
    { left: 60, top: 44, w: 18, h: 17, fill: 'rgba(167,139,250,0.26)', border: '#a78bfa' },
  ],
};

export const SKIN_TYPE_MARKERS = {
  normal: [],
  dry: MARKERS.dryCheeks,
  oily: MARKERS.tzone,
  combination: MARKERS.combination,
  sensitive: MARKERS.sensitive,
};

export const ZONE_MARKERS = {
  forehead: MARKERS.forehead,
  cheeks: MARKERS.cheeks,
  nose: MARKERS.tzonePurple,
  chin: MARKERS.chin,
  underEye: MARKERS.underEye,
  redness: MARKERS.redness,
};

function RegionRing({ marker }) {
  return (
    <div
      className="absolute pointer-events-none border-2"
      style={{
        left: `${marker.left}%`,
        top: `${marker.top}%`,
        width: `${marker.w}%`,
        height: `${marker.h}%`,
        borderRadius: '50%',
        borderColor: marker.border,
        backgroundColor: marker.fill,
      }}
    />
  );
}

export default function FaceRegionPhoto({
  markers,
  skinType,
  zone,
  className = '',
}) {
  const rings = (() => {
    if (markers) return markers;
    if (skinType != null && skinType in SKIN_TYPE_MARKERS) {
      return SKIN_TYPE_MARKERS[skinType];
    }
    if (zone && ZONE_MARKERS[zone]) return ZONE_MARKERS[zone];
    return [];
  })();

  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={FACE_MODEL_SRC}
        alt=""
        width={639}
        height={1024}
        className="block w-full h-full object-contain object-center"
        draggable={false}
      />
      <div className="absolute inset-0">
        {rings.map((marker, i) => (
          <RegionRing key={`${marker.border}-${marker.left}-${i}`} marker={marker} />
        ))}
      </div>
    </div>
  );
}
