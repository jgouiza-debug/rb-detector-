import { notFound } from "next/navigation";
import { assertLocalMode, NotLocalModeError } from "@/lib/ports";
import { PIP_EXPRESSIONS, expressionLabel } from "@/components/pip/expressions";
import { PipMascot } from "@/components/pip/PipMascot";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { moodTokens, type MoodTag } from "@/lib/theme/tokens";
import { moodIcon } from "@/lib/theme/moodIcons";

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  try {
    assertLocalMode();
  } catch (e) {
    if (e instanceof NotLocalModeError) notFound();
    throw e;
  }
  return (
    <main id="main" className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <h1 className="font-display text-3xl">pip gallery</h1>
      <section>
        <h2 className="mb-4 font-display text-lg">expressions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {PIP_EXPRESSIONS.map((e) => (
            <figure key={e} className="flex flex-col items-center gap-2 rounded-card bg-surface p-4" data-testid={`pip-${e}`}>
              <PipMascot expression={e} size={88} />
              <figcaption className="text-sm text-fg-soft">{expressionLabel[e]}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg">type</h2>
        <p className="font-display text-3xl">hey, i&apos;m pip</p>
        <p className="font-ui text-base">Nunito Sans for everything functional: chat, buttons, settings.</p>
        <p className="font-reading text-lg">Fraunces for the keepsake. Started in quiet morning light with steam rising beside the succulent.</p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg">buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>let&apos;s go</Button>
          <Button variant="strong">keep it all · $4.99/mo</Button>
          <Button variant="soft">not now</Button>
          <Button variant="ghost">skip</Button>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg">moods</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(moodTokens).map(([k, t]) => (
            <Pill key={k} style={{ background: t.bg, color: t.fg }}>
              <Icon icon={moodIcon[k as MoodTag]} size={13} /> {t.label}
            </Pill>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg">bubbles</h2>
        <div className="flex flex-col gap-2">
          <div className="bubble-pip max-w-[80%] self-start bg-bubble-pip px-4 py-2 text-bubble-pip-fg">that sounds like a lot to carry today.</div>
          <div className="bubble-pip no-tail max-w-[80%] self-start bg-bubble-pip px-4 py-2 text-bubble-pip-fg">do you want to get into it, or just let it out?</div>
          <div className="bubble-user max-w-[80%] self-end bg-bubble-user px-4 py-2 text-bubble-user-fg">honestly just let it out for a sec</div>
        </div>
      </section>
    </main>
  );
}
