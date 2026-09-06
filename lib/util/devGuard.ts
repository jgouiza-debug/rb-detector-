import { assertLocalMode, NotLocalModeError } from "@/lib/ports";
import { jsonError } from "@/lib/util/http";
import type { NextResponse } from "next/server";

/** Returns a 404 response when not in local mode, else null. */
export function devGuard(): NextResponse | null {
  try {
    assertLocalMode();
    return null;
  } catch (e) {
    if (e instanceof NotLocalModeError) return jsonError(404, "not_found");
    throw e;
  }
}
