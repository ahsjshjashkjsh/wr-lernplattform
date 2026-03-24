export default function DatenschutzPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Datenschutzerklärung</h1>
        <p className="text-sm text-slate-500">Stand: März 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">1. Verantwortliche Stelle</h2>
          <p>
            Verantwortlich für den Betrieb dieser Plattform ist ein Schüler der HMS Handelsmittelschule Zürich,
            Klasse H3b. Die Plattform dient ausschliesslich der Prüfungsvorbereitung und wird nicht kommerziell betrieben.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">2. Erhobene Daten</h2>
          <p>Bei der Registrierung werden folgende Daten erhoben:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Name</li>
            <li>E-Mail-Adresse</li>
            <li>Passwort (verschlüsselt gespeichert, nicht im Klartext)</li>
          </ul>
          <p className="mt-2">
            Im Rahmen der Nutzung werden Lernfortschritte und Quiz-Ergebnisse gespeichert,
            um deinen persönlichen Fortschritt nachzuverfolgen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">3. Zweck der Datenverarbeitung</h2>
          <p>
            Die erhobenen Daten werden ausschliesslich für den Betrieb der Lernplattform verwendet.
            Es erfolgt keine Weitergabe an Dritte, keine Werbung und kein Tracking durch Drittanbieter.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">4. Datenspeicherung</h2>
          <p>
            Die Daten werden in einer gesicherten Datenbank (Supabase, Schweiz/EU) gespeichert.
            Die Plattform wird über Vercel gehostet (Server in der EU).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">5. KI-Assistent</h2>
          <p>
            Der KI-Assistent verwendet die OpenAI API. Nachrichten, die du an den Assistenten sendest,
            werden an OpenAI übermittelt. Es werden keine Nachrichten dauerhaft gespeichert.
            Weitere Informationen: <span className="text-blue-400">openai.com/privacy</span>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">6. Deine Rechte</h2>
          <p>Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten.
            Wende dich dazu an den Administrator über das Feedback-Formular auf der Plattform.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-200">7. Cookies</h2>
          <p>
            Diese Plattform verwendet ausschliesslich ein funktionales Session-Cookie zur Anmeldung.
            Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
          </p>
        </section>
      </div>
    </div>
  )
}
