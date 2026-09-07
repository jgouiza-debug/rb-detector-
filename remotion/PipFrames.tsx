import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import { PIP_FRAMES } from "@/lib/breath/frames";

/** Seconds each cut frame is held in the contact-sheet composition. */
export const FRAME_HOLD_SECONDS = 2;

/**
 * The three frames cut from the reference sheet, shown one after another with
 * a label. A quick way to eyeball the cuts and the keyed edges in Remotion
 * Studio without the breath animation on top.
 */
export const PipFrames: React.FC = () => {
  const { fps, width, height } = useVideoConfig();
  const hold = FRAME_HOLD_SECONDS * fps;
  const side = Math.min(width, height) * 0.8;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF9ED", alignItems: "center", justifyContent: "center" }}>
      {PIP_FRAMES.map((f, i) => (
        <Sequence key={f.key} from={i * hold} durationInFrames={hold} name={f.label}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Img src={staticFile(f.src)} alt="" style={{ width: side, height: side }} />
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: side * 0.07, color: "#2B2620", opacity: 0.7 }}>
              {i + 1} / {PIP_FRAMES.length} · {f.label}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
