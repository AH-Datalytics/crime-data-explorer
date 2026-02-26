import { SITE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-warm-muted">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="text-sm text-muted-foreground">
              {SITE_NAME} — Powered by FBI Crime Data Explorer API
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Data sourced from the FBI&apos;s Uniform Crime Reporting (UCR) Program.
              Not affiliated with the FBI or Department of Justice.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a
              href="https://crime-data-explorer.fr.cloud.gov/pages/docApi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-navy transition-colors"
            >
              FBI API Docs
            </a>
            <span>|</span>
            <span>Built by AH Datalytics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
