export default function ImpressumPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Impressum</h1>
        <p className="text-sm text-slate-500">Stand: März 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Betreiber</h2>
          <p>
            Diese Plattform wird von einem Schüler der HMS Handelsmittelschule Zürich, Klasse H3b,
            als privates, nicht-kommerzielles Schulprojekt betrieben.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Schule</h2>
          <p>
            HMS Handelsmittelschule Zürich<br />
            Zürich, Schweiz
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Zweck</h2>
          <p>
            Die HMS-Plattform dient der Prüfungsvorbereitung für die Abschlussprüfungen 2026
            im Fach Wirtschaft & Recht (WR) sowie Finanz- und Rechnungswesen (FRW).
            Sie steht ausgewählten Schülerinnen und Schülern zur Verfügung.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Plattform wurden sorgfältig erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.
            Die Plattform ersetzt keine offizielle Lernunterlage oder Lehrperson.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Technologie</h2>
          <p>
            Hosting: Vercel (EU)<br />
            Datenbank: Supabase (EU)<br />
            KI-Assistent: OpenAI API
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Kontakt</h2>
          <p>
            Für Fragen oder Anliegen nutze das Feedback-Formular auf der Plattform.
          </p>
        </section>
      </div>
    </div>
  )
}
