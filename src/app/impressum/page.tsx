export default function ImpressumPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Impressum & Nutzungsbedingungen</h1>
        <p className="text-sm text-slate-500">Stand: März 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-400 leading-relaxed">

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Anbieter</h2>
          <p>
            Diese Plattform wird von einer Privatperson (Schüler, HMS Handelsmittelschule Zürich)
            als eigenständiges Bildungsprodukt betrieben. Sie ist kein offizielles Angebot der
            Schule oder einer anderen Institution.
          </p>
          <p>
            <strong className="text-slate-300">Kontakt:</strong> Über das Feedback-Formular auf der Plattform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Dienstleistung & Nutzungsgebühr</h2>
          <p>
            Die Plattform bietet digitale Lernhilfen zur Vorbereitung auf die Abschlussprüfungen
            im Fach Wirtschaft & Recht (WR) sowie Finanz- und Rechnungswesen (FRW) an.
          </p>
          <p>
            Für den vollen Zugang (Premium) wird eine monatliche Nutzungsgebühr von{' '}
            <strong className="text-slate-300">CHF 5.00</strong> erhoben. Diese Gebühr dient zur
            Deckung der Betriebskosten (Server, KI-Dienste, Wartung) und der Weiterentwicklung
            der Inhalte. Es handelt sich um eine freiwillige Unterstützung für ein von einer
            Privatperson betriebenes Bildungsangebot.
          </p>
          <p>
            Die Zahlung erfolgt über Twint. Es besteht kein automatisches Abonnement —
            jede Verlängerung erfordert eine neue manuelle Anfrage. Eine Rückerstattung bereits
            geleisteter Zahlungen ist grundsätzlich ausgeschlossen, da der Zugang unmittelbar
            nach Zahlung aktiviert wird (digitale Dienstleistung, sofort verfügbar).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Inhalte & Quellen</h2>
          <p>
            Die Lerninhalte dieser Plattform wurden vom Betreiber eigenständig erarbeitet,
            didaktisch aufbereitet und durch eigene Erklärungen, Beispiele und Quizfragen
            ergänzt. Als inhaltliche Orientierung dienten dabei:
          </p>
          <ul className="space-y-2 mt-3">
            <li className="flex gap-2">
              <span className="text-blue-400 font-semibold shrink-0">WR</span>
              <span>
                Wirtschaft &amp; Recht — orientiert an Unterrichtsinhalten und allgemeinem
                Lehrplanstoff der HMS Zürich. Die Texte wurden eigenständig formuliert
                und sind keine wörtliche Reproduktion.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400 font-semibold shrink-0">FRW</span>
              <span>
                Finanz- und Rechnungswesen — inhaltlich orientiert am Lehrplanstoff,
                u.a. auf Basis des Lehrmittels{' '}
                <strong className="text-slate-300">«Finanz- und Rechnungswesen»</strong>{' '}
                des <strong className="text-slate-300">HEP Verlags</strong>.
                Die Inhalte wurden vollständig eigenständig überarbeitet, vereinfacht
                und neu formuliert. Es handelt sich um keine wörtliche Übernahme
                urheberrechtlich geschützter Formulierungen.
              </span>
            </li>
          </ul>
          <p className="mt-3">
            Die auf dieser Plattform publizierten Texte, Quizfragen und Strukturen
            sind das geistige Eigentum des Betreibers und dürfen ohne Genehmigung
            nicht vervielfältigt oder weitergegeben werden.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Haftungsausschluss</h2>
          <p>
            Die Lerninhalte wurden nach bestem Wissen und Gewissen erstellt, jedoch{' '}
            <strong className="text-slate-300">ohne Gewähr auf Vollständigkeit, Richtigkeit
            oder Aktualität</strong>. Die Plattform wurde nicht von Lehrpersonen, der Schule
            oder offiziellen Stellen geprüft oder freigegeben.
          </p>
          <p>
            Der Anbieter haftet nicht für:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Fehler, Unvollständigkeiten oder Ungenauigkeiten in den Lerninhalten</li>
            <li>Prüfungsergebnisse, die durch die Nutzung der Plattform beeinflusst werden</li>
            <li>Technische Ausfälle, Datenverluste oder Unterbrüche des Dienstes</li>
            <li>Schäden, die sich aus der Nutzung oder Nichtnutzung der bereitgestellten
                Informationen ergeben</li>
          </ul>
          <p>
            Die Nutzung der Plattform erfolgt vollständig auf eigene Verantwortung der
            Nutzerinnen und Nutzer. Die Plattform ersetzt keine offizielle Lernunterlage,
            keine Lehrperson und keine Nachhilfe.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Datenschutz</h2>
          <p>
            Die vollständige Datenschutzerklärung ist unter{' '}
            <a href="/datenschutz" className="text-blue-400 hover:underline">/datenschutz</a>{' '}
            abrufbar.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">Technologie</h2>
          <p>
            Hosting: Vercel (EU) · Datenbank: Supabase (EU) · KI-Assistent: Anthropic Claude API
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-slate-600">
            Durch die Registrierung und Nutzung dieser Plattform erklären sich Nutzerinnen und
            Nutzer mit diesen Nutzungsbedingungen einverstanden. Der Anbieter behält sich vor,
            diese Bedingungen jederzeit anzupassen. Änderungen werden auf der Plattform
            kommuniziert.
          </p>
        </section>

      </div>
    </div>
  )
}
