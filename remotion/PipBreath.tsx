import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { breathAt } from "@/lib/breath/engine";
import { cycleSeconds, PATTERNS } from "@/lib/breath/patterns";
import { frameWeights, fullnessAt, layerOpacities, PIP_FRAMES } from "@/lib/breath/frames";

export type PipBreathProps = {
  patternKey: keyof typeof PATTERNS;
  /** Warm halo behind Pip that brightens as the breath fills. */
  glow?: boolean;
  /** Tiny idle float so Pip feels alive between phases. */
  idle?: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 1.18;

/**
 * One full breath cycle of the given pattern, exactly `cycleSeconds * fps`
 * frames long, so it loops seamlessly. The three cut frames crossfade with
 * the eyelids while the whole body scales with the breath. Driven by the same
 * pure engine the app uses, so frame N here matches second N/fps in the pacer.
 */
export const PipBreath: React.FC<PipBreathProps> = ({ patternKey, glow = true, idle = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pattern = PATTERNS[patternKey];
  const cycle = cycleSeconds(pattern);
  const elapsedMs = ((frame / fps) * 1000) % (cycle * 1000);
  const state = breathAt(elapsedMs, pattern, cycle);

  const fullness = fullnessAt(state);
  const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * fullness;
  const opacities = layerOpacities(frameWeights(state));
  const float = idle ? Math.sin((frame / fps) * (Math.PI / 3)) * 1.5 : 0;

  const side = Math.min(width, height);
  const pip = side * 0.82;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: "transparent" }}>
      {glow && (
        <div
          style={{
            position: "absolute",
            width: side * 0.9,
            height: side * 0.9,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,222,122,0.55) 0%, rgba(255,222,122,0) 70%)",
            opacity: 0.35 + 0.65 * fullness,
            transform: `scale(${0.9 + 0.2 * fullness})`,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: pip,
          height: pip,
          transform: `translateY(${float}px) scale(${scale})`,
          transformOrigin: "50% 60%",
        }}
      >
        {PIP_FRAMES.map((f) => (
          <Img
            key={f.key}
            src={staticFile(f.src)}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: opacities[f.key] }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
