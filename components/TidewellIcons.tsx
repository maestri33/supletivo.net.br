import React from 'react';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
import { PIXEL_ICONS, PIXEL_PALETTE } from '@/lib/supletivo-data';

export function SupletivoBrandMark() {
  return (
    <span className="sb-brand-lockup">
      <span className="sb-brand-emblem" aria-hidden="true">
        <GraduationCap size={18} strokeWidth={2.2} />
      </span>
      <span className="sb-brand-name">Supletivo Brasil</span>
    </span>
  );
}

export function ArrowIcon() {
  return <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />;
}

export function SparkleIcon() {
  return (
    <Sparkles
      size={28}
      strokeWidth={1.6}
      color="#F6D57A"
      fill="#F6D57A"
      aria-hidden="true"
    />
  );
}

export function PixelIconSvg({ iconIndex }: { iconIndex: number }) {
  const def = PIXEL_ICONS[iconIndex];
  const rects: React.ReactElement[] = [];

  def.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const fill = PIXEL_PALETTE[ch];
      if (!fill) continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1.02}
          height={1.02}
          fill={fill}
        />
      );
    }
  });

  return (
    <svg
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}
