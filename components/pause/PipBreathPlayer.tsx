"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { Player, type PlayerRef } from "@remotion/player";
import type { BreathState } from "@/lib/breath/engine";
import { cycleSeconds, type BreathPattern } from "@/lib/breath/patterns";
import { dominantFrame, PIP_FRAME_SIZE } from "@/lib/breath/frames";
import { PipBreath } from "@/remotion/PipBreath";
import { PIP_BREATH_FPS, PIP_BREATH_SIZE } from "@/remotion/Root";

const noop = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/**
 * Pip breathing, rendered by the Remotion composition inside `@remotion/player`.
 * The Player never runs its own clock: the pacer's breath engine owns time and
 * we seek to the matching frame, so haptics, the phase word, and Pip's eyes all
 * agree. Under reduced motion (or before hydration) it falls back to the single
 * cut frame that best matches the phase.
 */
export function PipBreathPlayer({
  state,
  pattern,
  size,
  reduceMotion = false,
}: {
  state: BreathState;
  pattern: BreathPattern;
  size: number;
  reduceMotion?: boolean;
}) {
  const ref = useRef<PlayerRef>(null);
  const mounted = useMounted();
  const durationInFrames = cycleSeconds(pattern) * PIP_BREATH_FPS;
  const frame = Math.min(durationInFrames - 1, Math.round(state.cycleProgress * durationInFrames));
  const live = mounted && !reduceMotion;

  useEffect(() => {
    if (!live) return;
    const player = ref.current;
    if (player && player.getCurrentFrame() !== frame) player.seekTo(frame);
  }, [frame, live]);

  if (!live) {
    const f = dominantFrame(state);
    return (
      <Image
        src={`/${f.src}`}
        alt={`pip, ${f.label}`}
        width={PIP_FRAME_SIZE}
        height={PIP_FRAME_SIZE}
        style={{ width: size, height: size }}
        unoptimized
        priority
        draggable={false}
      />
    );
  }

  return (
    <div role="img" aria-label="pip, breathing with you" style={{ width: size, height: size }}>
      <Player
        ref={ref}
        component={PipBreath}
        inputProps={{ patternKey: pattern.key, glow: true, idle: true }}
        durationInFrames={durationInFrames}
        fps={PIP_BREATH_FPS}
        compositionWidth={PIP_BREATH_SIZE}
        compositionHeight={PIP_BREATH_SIZE}
        initialFrame={frame}
        style={{ width: size, height: size }}
        controls={false}
        autoPlay={false}
        loop={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
