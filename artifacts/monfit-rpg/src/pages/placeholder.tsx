import { LucideIcon } from "lucide-react";

export default function PlaceholderTab({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="flex items-center gap-3 font-display font-black text-3xl text-foreground text-balance mb-2">
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
        {title}
      </h1>
      <p className="text-muted-foreground text-sm max-w-[280px] text-pretty">
        This tab is on the way. Check back in a future update.
      </p>
    </div>
  );
}
