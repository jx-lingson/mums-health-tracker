"use client";

interface BodySvgProps {
  selectedPart: string | null;
  onPartClick: (partId: string) => void;
  isPlacingMarker: boolean;
  onMarkerPlace: (x: number, y: number) => void;
  markerCounts?: Record<string, number>;
}

interface BodyRegion {
  id: string;
  label: string;
  d: string;
}

const bodyRegions: BodyRegion[] = [
  {
    id: "head",
    label: "Head",
    d: "M150,15 C133,15 120,30 119,48 C118,62 122,73 130,80 C136,85 142,88 150,90 C158,88 164,85 170,80 C178,73 182,62 181,48 C180,30 167,15 150,15 Z",
  },
  {
    id: "neck",
    label: "Neck",
    d: "M140,90 L140,104 L160,104 L160,90 C157,91 153,92 150,92 C147,92 143,91 140,90 Z",
  },
  {
    id: "left-shoulder",
    label: "Left Shoulder",
    d: "M110,104 L140,104 L140,118 L110,118 C106,116 104,112 104,108 Z",
  },
  {
    id: "right-shoulder",
    label: "Right Shoulder",
    d: "M160,104 L190,104 C196,108 196,112 194,116 L190,118 L160,118 Z",
  },
  {
    id: "chest",
    label: "Chest",
    d: "M118,118 L182,118 L182,172 L118,172 Z",
  },
  {
    id: "abdomen",
    label: "Abdomen",
    d: "M120,172 L180,172 L176,228 C172,234 162,238 150,238 C138,238 128,234 124,228 Z",
  },
  {
    id: "left-upper-arm",
    label: "Left Upper Arm",
    d: "M104,108 L110,118 L118,118 L118,172 L112,172 L100,172 C98,158 96,140 100,120 Z",
  },
  {
    id: "right-upper-arm",
    label: "Right Upper Arm",
    d: "M196,108 L190,118 L182,118 L182,172 L188,172 L200,172 C202,158 204,140 200,120 Z",
  },
  {
    id: "left-forearm",
    label: "Left Forearm",
    d: "M100,172 L112,172 L108,248 L94,248 Z",
  },
  {
    id: "right-forearm",
    label: "Right Forearm",
    d: "M188,172 L200,172 L206,248 L192,248 Z",
  },
  {
    id: "left-hand",
    label: "Left Hand",
    d: "M94,248 L108,248 L106,272 C105,278 100,282 96,280 C90,276 88,268 90,260 Z",
  },
  {
    id: "right-hand",
    label: "Right Hand",
    d: "M192,248 L206,248 L210,260 C212,268 210,276 204,280 C200,282 195,278 194,272 Z",
  },
  {
    id: "left-upper-leg",
    label: "Left Upper Leg",
    d: "M124,228 C128,234 138,238 150,238 L149,324 L121,324 C119,290 118,258 124,228 Z",
  },
  {
    id: "right-upper-leg",
    label: "Right Upper Leg",
    d: "M176,228 C172,234 162,238 150,238 L151,324 L179,324 C181,290 182,258 176,228 Z",
  },
  {
    id: "left-lower-leg",
    label: "Left Lower Leg",
    d: "M121,324 L149,324 L145,416 L125,416 Z",
  },
  {
    id: "right-lower-leg",
    label: "Right Lower Leg",
    d: "M151,324 L179,324 L175,416 L155,416 Z",
  },
  {
    id: "left-foot",
    label: "Left Foot",
    d: "M125,416 L145,416 L144,428 C142,434 136,438 126,438 C118,438 116,432 118,426 Z",
  },
  {
    id: "right-foot",
    label: "Right Foot",
    d: "M155,416 L175,416 L182,426 C184,432 182,438 174,438 C164,438 158,434 156,428 Z",
  },
];

export default function BodySvg({ selectedPart, onPartClick, isPlacingMarker, onMarkerPlace, markerCounts }: BodySvgProps) {
  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!isPlacingMarker) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 455;
    onMarkerPlace(x, y);
  }

  return (
    <svg
      viewBox="0 0 300 455"
      className={`w-full max-w-[280px] h-auto ${isPlacingMarker ? "cursor-crosshair" : ""}`}
      onClick={handleSvgClick}
    >
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d6d3d1" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
        <linearGradient id="bodyGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fdba74" />
        </linearGradient>
        <linearGradient id="bodyGradientSelected" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {bodyRegions.map((region) => {
        const hasMarkers = markerCounts && markerCounts[region.id] > 0;
        return (
          <path
            key={region.id}
            d={region.d}
            fill={
              selectedPart === region.id
                ? "url(#bodyGradientSelected)"
                : hasMarkers
                ? "#d6d3d1"
                : "url(#bodyGradient)"
            }
            className={`
              transition-colors duration-150
              ${selectedPart === region.id ? "stroke-orange-600" : hasMarkers ? "stroke-orange-300" : "stroke-stone-400"}
              ${isPlacingMarker ? "pointer-events-none" : "cursor-pointer"}
            `}
            strokeWidth={selectedPart === region.id ? 1.5 : 0.5}
            strokeLinejoin="round"
            onMouseEnter={(e) => {
              if (!isPlacingMarker && selectedPart !== region.id) {
                e.currentTarget.setAttribute("fill", "url(#bodyGradientHover)");
              }
            }}
            onMouseLeave={(e) => {
              if (!isPlacingMarker && selectedPart !== region.id) {
                e.currentTarget.setAttribute("fill", hasMarkers ? "#d6d3d1" : "url(#bodyGradient)");
              }
            }}
            onClick={(e) => {
              if (isPlacingMarker) return;
              e.stopPropagation();
              onPartClick(region.id);
            }}
          >
            <title>{region.label}</title>
          </path>
        );
      })}
    </svg>
  );
}
