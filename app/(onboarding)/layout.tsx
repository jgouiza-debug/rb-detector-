export const dynamic = "force-dynamic";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="pt-safe pb-safe px-safe min-h-[100dvh] bg-bg">{children}</div>;
}
