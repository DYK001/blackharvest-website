import Link from "next/link";
import { recoveryEn, recoveryKo } from "@/i18n/recovery";

export function RecoveryPage({ locale = "en", retry }: { locale?: "en" | "ko"; retry?: () => void }) {
  const copy = locale === "ko" ? recoveryKo : recoveryEn;
  return <div className="locale-root" data-locale={locale} lang={locale}>
    <main className="shell recovery-page">
      <p className="eyebrow">Black Harvest / {retry ? "—" : "404"}</p>
      <h1>{retry ? copy.error : copy.notFound}</h1>
      <p>{retry ? copy.failed : copy.missing}</p>
      {retry ? <button className="button button--primary" onClick={retry}>{copy.retry}</button> : null}
      <Link className="text-link" href={locale === "ko" ? "/ko" : "/"}>{copy.home} <span aria-hidden="true">↗</span></Link>
    </main>
  </div>;
}
