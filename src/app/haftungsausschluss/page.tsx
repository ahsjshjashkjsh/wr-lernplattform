export default function HaftungsausschlussPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Haftungsausschluss</h1>
        <p className="text-sm text-slate-500">Stand: März 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Keine Garantie auf Vollständigkeit und Richtigkeit</h2>
          <p>
            Die Inhalte dieser Plattform wurden mit grosser Sorgfalt erstellt und basieren auf
            offiziellen Lehr- und Unterrichtsmaterialien. Dennoch kann{' '}
            <strong className="text-slate-300">keine Garantie für die Vollständigkeit,
            Richtigkeit oder Aktualität der Inhalte</strong> übernommen werden.
          </p>
          <p>
            Die Lernmaterialien wurden von einem Schüler für Mitschülerinnen und Mitschüler
            aufbereitet und sind{' '}
            <strong className="text-slate-300">nicht von einer Lehrperson geprüft oder
            offiziell freigegeben</strong> worden. Fehler, Unvollständigkeiten oder
            abweichende Formulierungen gegenüber dem Original können nicht ausgeschlossen werden.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Keine Erfolgsgarantie</h2>
          <p>
            Die Nutzung dieser Plattform stellt eine Ergänzung zur eigenen Prüfungsvorbereitung
            dar, ersetzt aber{' '}
            <strong className="text-slate-300">keinen Unterricht, kein offizielles Lehrmittel
            und keine Lernberatung durch eine Lehrperson</strong>.
          </p>
          <p>
            Es wird ausdrücklich keine Garantie gegeben, dass die Nutzung dieser Plattform
            zum Bestehen der Abschlussprüfung führt. Der Lernerfolg hängt von zahlreichen
            individuellen Faktoren ab, die ausserhalb des Einflussbereichs dieser Plattform liegen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Überarbeitete Inhalte</h2>
          <p>
            Die Inhalte für die Bereiche WR (Wirtschaft &amp; Recht) und FRW (Finanz- und
            Rechnungswesen) basieren auf Originalquellen, wurden jedoch für diese Plattform
            eigenständig überarbeitet, vereinfacht und digital aufbereitet. Dabei können
            Abweichungen vom Original entstanden sein. Massgeblich für die Prüfung sind
            stets die offiziellen Lehr- und Unterrichtsmaterialien.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Haftungsbeschränkung</h2>
          <p>
            Für Schäden oder Nachteile, die durch die Nutzung oder Nichtnutzung der auf
            dieser Plattform bereitgestellten Informationen entstehen, wird keinerlei
            Haftung übernommen. Die Nutzung der Plattform erfolgt auf eigene Verantwortung.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Fehler melden</h2>
          <p>
            Wenn du einen Fehler in den Inhalten findest, kannst du ihn über das{' '}
            <strong className="text-slate-300">Feedback-Formular</strong> auf der Plattform
            melden. Gemeldete Fehler werden geprüft und wenn möglich korrigiert.
          </p>
        </section>
      </div>
    </div>
  )
}
