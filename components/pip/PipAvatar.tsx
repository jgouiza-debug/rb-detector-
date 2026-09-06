import { PipMascot } from "./PipMascot";
import type { PipExpression } from "./expressions";

/** Small non-animated Pip for message groups, top bars, and signatures. */
export function PipAvatar({ size = 28, expression = "listening", className }: { size?: number; expression?: PipExpression; className?: string }) {
  return <PipMascot size={size} expression={expression} idle={false} className={className} title="pip" />;
}
