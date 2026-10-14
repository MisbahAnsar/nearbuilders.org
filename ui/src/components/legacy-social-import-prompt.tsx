import { ArrowUpRight, Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NEAR_SOCIAL_ONBOARDING_URL,
  needsLegacySocialImport,
  type ResolvedNearProfile,
} from "@/lib/near-social";
import { cn } from "@/lib/utils";

export function LegacySocialImportPrompt({
  profile,
  className,
}: {
  profile: ResolvedNearProfile | null | undefined;
  className?: string;
}) {
  if (!needsLegacySocialImport(profile)) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-brand-accent-border bg-brand-accent-light p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent-border bg-card">
          <Import className="size-4 text-brand-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">Import your near.social profile</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We found your original near.social profile
              {profile?.name ? ` for ${profile.name}` : ""}, but it has not been migrated to the new
              network yet. Import it so avatars, bios, and links stay correct across NearBuilders.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <a href={NEAR_SOCIAL_ONBOARDING_URL} target="_blank" rel="noopener noreferrer">
              Import on near.social
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
