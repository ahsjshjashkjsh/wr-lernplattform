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
            Diese Plattform wurde von einem Schüler der HMS Handelsmittelschule Zürich, Klasse H3b,
            als privates Lernwerkzeug entwickelt — mit dem Ziel, das Lernen für Mitschülerinnen
            und Mitschüler einfacher und strukturierter zu gestalten.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Zweck</h2>
          <p>
            Die HMS-Plattform dient der Prüfungsvorbereitung für die Abschlussprüfungen 2026
            im Fach Wirtschaft & Recht (WR) sowie Finanz- und Rechnungswesen (FRW).
            Sie ist kein offizielles Angebot der Schule.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Quellen & Urheberrecht</h2>
          <p>
            Die Lerninhalte dieser Plattform basieren auf offiziellen Unterrichtsmaterialien
            und wurden für die digitale Aufbereitung zusammengefasst. Die Quellen im Überblick:
          </p>
          <ul className="space-y-2 mt-3">
            <li className="flex gap-2">
              <span className="text-blue-400 font-semibold shrink-0">WR</span>
              <span>
                Wirtschaft &amp; Recht — basiert auf den Handouts und Unterrichtsmaterialien
                der <strong className="text-slate-300">Kantonsschule Hottingen, Zürich</strong>,
                erstellt von <strong className="text-slate-300">P. Wörner</strong>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400 font-semibold shrink-0">FRW</span>
              <span>
                Finanz- und Rechnungswesen — basiert auf dem Lehrmittel{' '}
                <strong className="text-slate-300">«Finanz- und Rechnungswesen 3»</strong>{' '}
                des <strong className="text-slate-300">HEP Verlags</strong>.
                Die Inhalte wurden für diese Plattform didaktisch aufbereitet,
                vereinfacht und teilweise ergänzt. Es handelt sich nicht um eine
                wörtliche Reproduktion, sondern um eine eigenständige Überarbeitung
                zum Zweck der Prüfungsvorbereitung.
              </span>
            </li>
          </ul>
          <p className="mt-3">
            Die Urheberrechte an den Originalunterlagen liegen bei den jeweiligen Autoren,
            Verlagen und der Kantonsschule Hottingen. Diese Plattform verwendet die Inhalte
            ausschliesslich zu privaten, nicht-kommerziellen Lernzwecken.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Plattform wurden mit grosser Sorgfalt erstellt, jedoch
            <strong className="text-slate-300"> bisher nicht von einer Lehrperson geprüft oder freigegeben</strong>.
            Es kann daher nicht garantiert werden, dass alle Inhalte vollständig korrekt sind.
            Die Plattform ersetzt keine offizielle Lernunterlage und keine Lehrperson.
            Die Nutzung erfolgt auf eigene Verantwortung.
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
