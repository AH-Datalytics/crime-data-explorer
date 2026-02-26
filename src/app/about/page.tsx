import { PageHeader } from "@/components/shared/page-header";
import { SITE_NAME } from "@/lib/config";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <PageHeader
        title="About"
        description={`How ${SITE_NAME} works, where the data comes from, and important caveats.`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Sources */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="font-serif text-base font-bold text-navy">Data Sources</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              All crime data is sourced from the FBI&apos;s <strong>Crime Data Explorer (CDE)</strong> API,
              which provides access to the Uniform Crime Reporting (UCR) Program data.
            </p>
            <p>
              The UCR Program collects crime statistics from over 18,000 law enforcement agencies
              across the United States. The FBI estimates national figures based on reported data
              and population coverage.
            </p>
            <dl className="mt-4 space-y-2">
              <div>
                <dt className="font-mono text-xs font-medium text-navy">Crime Trends</dt>
                <dd>Summary Reporting System (SRS) and National Incident-Based Reporting System (NIBRS) data, 1985–2023</dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-medium text-navy">Arrests</dt>
                <dd>Arrest data reported by participating agencies, 2000–2023</dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-medium text-navy">Hate Crime</dt>
                <dd>Hate Crime Statistics collected under the Hate Crime Statistics Act, 2000–2023</dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-medium text-navy">Expanded Homicide</dt>
                <dd>Supplementary Homicide Report (SHR) data with details on circumstances, weapons, and demographics</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Methodology */}
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="font-serif text-base font-bold text-navy">Methodology</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong>Estimated Totals:</strong> The FBI generates estimates for agencies that do not
              report or only partially report. National and state-level totals are estimated values.
            </p>
            <p>
              <strong>Rate Calculations:</strong> Crime rates are calculated per 100,000 population
              using Census Bureau population estimates for each reporting year.
            </p>
            <p>
              <strong>NIBRS Transition:</strong> In 2021, the FBI transitioned fully to NIBRS.
              This transition may cause apparent changes in crime data that reflect methodology
              changes rather than actual crime trends.
            </p>
            <p>
              <strong>Reporting Coverage:</strong> Not all agencies report every year. The FBI
              uses statistical methods to impute missing data, but coverage varies. In 2021,
              NIBRS coverage was approximately 63% of the U.S. population.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-lg border border-border bg-white p-6 lg:col-span-2">
          <h2 className="font-serif text-base font-bold text-navy">Frequently Asked Questions</h2>
          <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-navy">Why is there a gap in some data around 2021?</h3>
              <p className="mt-1">
                The FBI fully transitioned to NIBRS in 2021, and many agencies were unable to report
                during the transition. This resulted in lower reporting coverage for 2021 data.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-navy">What&apos;s the difference between violent crime and property crime?</h3>
              <p className="mt-1">
                <strong>Violent crime</strong> includes murder, rape, robbery, and aggravated assault —
                offenses involving force or threat. <strong>Property crime</strong> includes burglary,
                larceny-theft, motor vehicle theft, and arson.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-navy">How current is the data?</h3>
              <p className="mt-1">
                The FBI typically releases annual data in the fall following the reporting year.
                The most recent complete data available is from 2023.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-navy">Can I download the data?</h3>
              <p className="mt-1">
                Yes. Every chart and table in {SITE_NAME} has a download button. Click the download
                icon to export data as CSV or save charts as images.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-navy">Is this an official FBI website?</h3>
              <p className="mt-1">
                No. {SITE_NAME} is an independent tool built by AH Datalytics. It uses publicly
                available FBI Crime Data Explorer APIs but is not affiliated with, endorsed by, or
                maintained by the FBI or Department of Justice.
              </p>
            </div>
          </div>
        </section>

        {/* API Information */}
        <section className="rounded-lg border border-border bg-white p-6 lg:col-span-2">
          <h2 className="font-serif text-base font-bold text-navy">API &amp; Technical Details</h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              This application uses the FBI Crime Data Explorer API. The API is publicly available
              and documentation can be found at the FBI&apos;s CDE website.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="https://crime-data-explorer.fr.cloud.gov/pages/docApi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-navy hover:bg-muted transition-colors"
              >
                FBI CDE API Documentation
              </a>
              <a
                href="https://cde.ucr.cjis.gov/LATEST"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-navy hover:bg-muted transition-colors"
              >
                FBI Crime Data Explorer
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
