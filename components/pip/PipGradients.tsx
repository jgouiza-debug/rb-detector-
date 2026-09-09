/**
 * Pip's two gradients, defined once for the whole app. They never vary by
 * expression, so every PipMascot can reference these fixed ids instead of
 * minting per-instance ones — which is what forced PipMascot to be a client
 * component (useId) and pulled ~12.7KB of JS onto four otherwise-static pages.
 * Mounted once in the root layout; the sprite paints nothing itself.
 */
export function PipGradients() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute" }}
    >
      <defs>
        <radialGradient id="pip-body" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFE8A0" />
          <stop offset="60%" stopColor="#FFDE7A" />
          <stop offset="100%" stopColor="#F5B841" />
        </radialGradient>
        <radialGradient id="pip-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFDE7A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFDE7A" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
