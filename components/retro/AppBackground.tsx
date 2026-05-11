"use client";

import { Grainient } from "@/components/retro/Grainient";

export function AppBackground() {
  return (
    <div aria-hidden="true" className="app-background">
      <Grainient
        color1="#FF9FFC"
        color2="#5227FF"
        color3="#B497CF"
        timeSpeed={0.18}
        colorBalance={-0.08}
        warpStrength={1}
        warpFrequency={4.2}
        warpSpeed={1.35}
        warpAmplitude={58}
        blendAngle={-18}
        blendSoftness={0.08}
        rotationAmount={420}
        noiseScale={1.8}
        grainAmount={0.08}
        grainScale={2.4}
        grainAnimated={false}
        contrast={1.25}
        gamma={1}
        saturation={1.08}
        centerX={0}
        centerY={0}
        zoom={0.88}
      />
    </div>
  );
}
