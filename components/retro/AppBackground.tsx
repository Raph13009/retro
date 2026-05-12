"use client";

import { Grainient } from "@/components/retro/Grainient";

export function AppBackground() {
  return (
    <div aria-hidden="true" className="app-background">
      <Grainient
        color1="#F7F3EA"
        color2="#E7E2EF"
        color3="#DCE5E0"
        timeSpeed={0.08}
        colorBalance={0.06}
        warpStrength={0.44}
        warpFrequency={2.8}
        warpSpeed={0.72}
        warpAmplitude={26}
        blendAngle={-18}
        blendSoftness={0.18}
        rotationAmount={160}
        noiseScale={1.45}
        grainAmount={0.045}
        grainScale={2}
        grainAnimated={false}
        contrast={0.92}
        gamma={1}
        saturation={0.48}
        centerX={0}
        centerY={0}
        zoom={0.96}
      />
    </div>
  );
}
