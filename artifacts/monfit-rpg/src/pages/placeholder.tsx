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
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--primary) / 0.18) 0%, transparent 75%)",
          border: "1px solid hsl(var(--surface-border))",
        }}
      >
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>
      <h1 className="font-display font-black text-3xl text-white mb-2">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm max-w-[280px]">
        This tab is on the way. Check back in a future update.
      </p>
    </div>
  );
}
