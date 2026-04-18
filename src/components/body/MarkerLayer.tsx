"use client";

import { Marker } from "@/lib/types";

interface MarkerLayerProps {
  markers: Marker[];
  onMarkerClick: (marker: Marker) => void;
}

const colorMap = {
  red: { fill: "#EF4444", ping: "#FCA5A5" },
  orange: { fill: "#F97316", ping: "#FDBA74" },
  yellow: { fill: "#EAB308", ping: "#FDE047" },
};

export default function MarkerLayer({ markers, onMarkerClick }: MarkerLayerProps) {
  return (
    <svg
      viewBox="0 0 300 455"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {markers.map((marker) => {
        const colors = colorMap[marker.color];
        return (
          <g key={marker.id} className="pointer-events-auto cursor-pointer" onClick={() => onMarkerClick(marker)}>
            <circle cx={marker.x} cy={marker.y} r={8} fill={colors.ping} opacity={0.4}>
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={marker.x} cy={marker.y} r={5} fill={colors.fill} stroke="white" strokeWidth={1.5} />
            {marker.label && (
              <text
                x={marker.x}
                y={marker.y - 10}
                textAnchor="middle"
                className="text-[8px] fill-gray-600 font-medium"
              >
                {marker.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
