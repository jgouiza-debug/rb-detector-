import { HeartHandshake } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { BackLink } from "@/components/ui/BackLink";
import { PrimaryResource, ResourceRows } from "@/components/safety/ResourceList";
import { CRISIS_RESOURCES, EMERGENCY_NOTE } from "@/lib/safety/resources";

export const metadata = { title: "get help now" };

/** Public, unauthenticated, offline-precached. Reachable no matter the session state. */
export default function HelpPage() {
  const primary = CRISIS_RESOURCES.find((r) => r.tel) ?? CRISIS_RESOURCES[0];
  const rest = CRISIS_RESOURCES.filter((r) => r !== primary);
  return (
    <main id="main" className="pt-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-6">
      <BackLink href="/thread" className="mb-4">back</BackLink>
      <h1 className="mb-2 flex items-center gap-2 font-display text-3xl">
        <Icon icon={HeartHandshake} size={28} /> you&apos;re not alone
      </h1>
      <p className="mb-6 text-fg-soft">pip is a companion, not a crisis service. if you&apos;re struggling, these are real people who can help, any time.</p>
      <ResourceRows resources={rest} ground="surface" />
      <p className="mt-6 text-sm text-fg-soft">{EMERGENCY_NOTE}</p>
      <div className="pb-safe sticky bottom-0 mt-auto bg-bg pt-6">
        <PrimaryResource resource={primary} ground="surface" />
      </div>
    </main>
  );
}
