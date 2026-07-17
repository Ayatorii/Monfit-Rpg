import { Link } from "wouter";
import { Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">

        <div className="flex items-center justify-center">
          <Swords className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display font-black text-4xl text-foreground leading-none">
            404
          </h1>
          <p className="font-semibold text-base text-foreground">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground">
            This page doesn't exist. Did you forget to add it to the router?
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 font-display font-bold text-base text-primary-text uppercase tracking-wide transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          ← Back to Train
        </Link>

      </div>
    </div>
  );
}
