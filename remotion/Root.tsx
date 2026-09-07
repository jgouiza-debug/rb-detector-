import { Composition, Folder } from "remotion";
import { cycleSeconds, PATTERNS } from "@/lib/breath/patterns";
import { PIP_FRAMES } from "@/lib/breath/frames";
import { PipBreath } from "./PipBreath";
import { FRAME_HOLD_SECONDS, PipFrames } from "./PipFrames";

/** Shared timing/size for the in-app Player and CLI renders. */
export const PIP_BREATH_FPS = 30;
export const PIP_BREATH_SIZE = 480;

/** Composition id for a pattern, e.g. `PipBreath-box`. */
export const pipBreathId = (key: keyof typeof PATTERNS) => `PipBreath-${key}`;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="meditation">
      {Object.values(PATTERNS).map((p) => (
        <Composition
          key={p.key}
          id={pipBreathId(p.key)}
          component={PipBreath}
          durationInFrames={cycleSeconds(p) * PIP_BREATH_FPS}
          fps={PIP_BREATH_FPS}
          width={PIP_BREATH_SIZE}
          height={PIP_BREATH_SIZE}
          defaultProps={{ patternKey: p.key, glow: true, idle: true }}
        />
      ))}
      <Composition
        id="PipFrames"
        component={PipFrames}
        durationInFrames={PIP_FRAMES.length * FRAME_HOLD_SECONDS * PIP_BREATH_FPS}
        fps={PIP_BREATH_FPS}
        width={PIP_BREATH_SIZE}
        height={PIP_BREATH_SIZE}
      />
    </Folder>
  </>
);
