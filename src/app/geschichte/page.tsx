import { Clock, Landmark, BookOpen, FileText, CheckCircle, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const EXPIRY = new Date('2026-04-11T00:00:00')

// ─── Daten ──────────────────────────────────────────────────────────────────

const LERNZIELE = [
  'Geschichte der Ukraine & Unabhängigkeit von der UdSSR (1991)',
  'Konfliktpunkte seit dem Zerfall der Sowjetunion — NATO-Osterweiterung (Vorwurf Russlands)',
  'Was ist die NATO? Beistandsklausel, Gründung, Osterweiterung',
  'Budapester Memorandum — Vorwurf der Ukraine an Russland (Nichteinhaltung)',
  'Krieg in der Ukraine & mögliche Lösungsansätze (Minsker Abkommen)',
]

const SECTIONS = [
  {
    nr: '1',
    title: 'Ukraine: Geschichte & Unabhängigkeit',
    blocks: [
      {
        heading: 'Lage & Bedeutung',
        points: [
          'Grosses Land in Osteuropa mit Brückenlage zwischen Ost und West — genau diese Lage ist der Schlüssel zum Konflikt.',
          'Die Ukraine ist kein "Anhängsel" Russlands, sondern ein Land mit eigener Geschichte, Sprache, Kultur und nationaler Identität.',
          'Historisch oft fremdbeherrscht → deshalb sind Fragen nach Souveränität, Identität und Selbstbestimmung besonders stark.',
        ],
      },
      {
        heading: 'Ukraine in der Sowjetunion',
        points: [
          'Als Ukrainische Sowjetrepublik (UkrSSR) formal Teil der UdSSR, real stark von Moskau abhängig.',
          'Trotzdem blieb ein ukrainisches Nationalbewusstsein bestehen. Lenin anerkannte die Ukraine als eigene Nation innerhalb der UdSSR.',
          'Verschiedene Regionen hatten unterschiedliche Erfahrungen: West-Ukraine eher mitteleuropäisch geprägt, Ost/Süd stärker russisch beeinflusst.',
        ],
      },
      {
        heading: 'Unabhängigkeit 1991',
        points: [
          '24. August 1991: Ukraine erklärt Unabhängigkeit nach gescheitertem Putschversuch gegen Gorbatschow.',
          '1. Dezember 1991: Referendum mit über 90 % Zustimmung bestätigt die Unabhängigkeit.',
          'Grosse Hoffnungen auf Freiheit, Demokratie und wirtschaftlichen Aufschwung.',
        ],
      },
      {
        heading: '"Land mit zwei Gesichtern" — Schwierigkeiten nach 1991',
        points: [
          'Wirtschaftliche Krise: Sowjetische Wirtschaftsbeziehungen brachen weg → Produktionsrückgang, Hyperinflation, sinkender Lebensstandard.',
          'Unvollständige Transformation: Alte Elite (Nomenklatura) bewahrte Macht in neuer Form → Klientelismus, Korruption statt Rechtsstaat.',
          'Oligarchen: Sehr reiche Unternehmer bereicherten sich durch Privatisierungen und erlangten grossen politischen Einfluss.',
          'Orientierungsfrage: Sollte sich die Ukraine nach Europa oder nach Russland orientieren? → Kern des späteren Konflikts.',
        ],
      },
    ],
  },
  {
    nr: '2',
    title: 'NATO & die Frage der Osterweiterung',
    blocks: [
      {
        heading: 'Was ist die NATO?',
        points: [
          'North Atlantic Treaty Organization — gegründet am 4. April 1949 als westliches Verteidigungsbündnis (heute 32 Staaten).',
          'Kern: Beistandsklausel Artikel 5 — ein Angriff auf ein Mitglied gilt als Angriff auf alle.',
          'Im Kalten Krieg Gegengewicht zur Sowjetunion (Gegenstück: Warschauer Pakt). Bekennt sich zu Frieden, Demokratie, Freiheit, Rechtsstaatlichkeit.',
          'Die Ukraine ist kein NATO-Mitglied → Artikel 5 gilt für sie nicht.',
        ],
      },
      {
        heading: 'NATO-Osterweiterung nach 1990',
        points: [
          'Nach Ende des Kalten Krieges traten viele osteuropäische Staaten der NATO bei — aus deren Sicht für Sicherheit und Westanbindung.',
          'Aus russischer Sicht: Machtverschiebung gegen Russlands Sicherheitsinteressen.',
          'Wichtig: Die NATO-Osterweiterung ist eine Ursache für Spannungen, aber keine alleinige Erklärung für den Krieg.',
        ],
      },
      {
        heading: 'Das angebliche Versprechen: "Not one inch"',
        points: [
          'Russland behauptet: Im Zuge der deutschen Wiedervereinigung 1990 versprachen westliche Politiker, die NATO nicht nach Osten auszudehnen.',
          'Berühmte Aussage: US-Aussenminister Baker — "not one inch eastward". Ähnlich: Genscher (D).',
          'Westliche Position: Es gab keine schriftliche, rechtsverbindliche Zusage. Nur politische Gesprächssignale, kein Vertrag.',
          'Zwei-plus-Vier-Vertrag (1990) regelte die deutsche Einheit — enthielt Regelungen für das Gebiet der ehemaligen DDR, aber kein allgemeines Verbot der NATO-Erweiterung auf andere Staaten.',
        ],
      },
    ],
  },
  {
    nr: '3',
    title: 'Budapester Memorandum (1994)',
    blocks: [
      {
        heading: 'Ausgangslage & Inhalt',
        points: [
          'Nach 1991 befanden sich auf ukrainischem Gebiet sowjetische Atomwaffen — das drittgrösste Arsenal der Welt (~1\'800 strategische + ~2\'500 taktische Sprengköpfe).',
          '5. Dezember 1994: Ukraine, Russland, USA und Grossbritannien unterzeichnen das Memorandum.',
          'Ukraine: Gibt Atomwaffen ab und tritt dem Atomwaffensperrvertrag bei.',
          'Gegenzug: Unterzeichner versprechen, die Grenzen der Ukraine zu achten, auf Gewalt und wirtschaftlichen Druck zu verzichten, bei Konflikten den UN-Sicherheitsrat einzuschalten.',
        ],
      },
      {
        heading: 'Kritische Schwachstelle & Bedeutung heute',
        points: [
          'Das Memorandum enthielt keine militärische Beistandsgarantie — nur politische Zusicherungen.',
          'Russland verletzte diese Vereinbarungen fundamental: Krim-Annexion 2014 und Krieg sind direkter Bruch der zugesicherten territorialen Integrität.',
          'Für die Ukraine: schwerer Vertrauensbruch. Sie gab Atomwaffen ab und erhielt dafür keine wirksamen Sicherheitsgarantien.',
          'Formulierung für Prüfung: "Die Ukraine verzichtete auf Atomwaffen gegen Sicherheitszusicherungen — Russlands spätere Politik untergrub diese Vereinbarungen fundamental."',
        ],
      },
    ],
  },
  {
    nr: '4',
    title: 'Eskalation: Euromaidan, Krim & Donbas',
    blocks: [
      {
        heading: 'Orange Revolution (2004) & Euromaidan (2013/14)',
        points: [
          '2004: Orange Revolution — Proteste gegen Wahlfälschung und für demokratischere Verhältnisse. Zeigte Wunsch nach Mitbestimmung und Rechtsstaatlichkeit.',
          '2013/14 Euromaidan: Präsident Janukowytsch lehnte unter russischem Druck das EU-Assoziierungsabkommen ab → Massenproteste auf dem Maidan in Kiew.',
          'Februar 2014: Janukowytsch floh — Opposition übernahm die Macht.',
        ],
      },
      {
        heading: 'Krim-Annexion & Donbas-Krieg (2014)',
        points: [
          'März 2014: Russland besetzte die Krim mit Soldaten ohne Hoheitsabzeichen ("grüne Männchen") und gliederte sie nach einem völkerrechtlich nicht anerkannten Referendum ein.',
          'Putin bezeichnete es als "Wiedervereinigung" — Ukraine und Westen: Verletzung der Souveränität und territorialen Integrität.',
          'Gleichzeitig: Beginn des Krieges im Donbas (Donezk, Luhansk) — russisch unterstützte Separatisten riefen "Volksrepubliken" aus.',
          'Juli 2014: Abschuss des Passagierflugzeugs MH17 — Konflikt bekam internationale Dimension.',
          '2014 ist der eigentliche Wendepunkt: Seit diesem Zeitpunkt war die territoriale Integrität der Ukraine offen verletzt.',
        ],
      },
    ],
  },
  {
    nr: '5',
    title: 'Minsker Abkommen & Lösungsansätze',
    blocks: [
      {
        heading: 'Minsk I & II',
        points: [
          'Minsk I (September 2014): 12-Punkte-Plan (Waffenstillstand, Gefangenenaustausch) — scheiterte nach wenigen Wochen.',
          'Minsk II (Februar 2015): Vermittelt durch Merkel (D) und Hollande (F) mit Putin & Poroschenko. 13 Punkte u. a.:',
          '→ Sofortiger Waffenstillstand & Abzug schwerer Waffen (Sicherheitszone 50–140 km)',
          '→ OSZE-Überwachung, Amnestie für Kämpfer',
          '→ Ukrainische Verfassungsreform für Sonderstatus des Donbas',
        ],
      },
      {
        heading: 'Warum scheiterten sie?',
        points: [
          'Beide Seiten warfen sich gegenseitig Verstösse vor, Sicherheitslage blieb instabil.',
          'Kernwiderspruch: Ukraine wollte erst Grenzkontrolle zurück — Russland wollte erst Wahlen und Sonderstatus im Donbas.',
          'Minsk war eher ein Versuch, den Krieg einzufrieren, als ihn dauerhaft zu lösen.',
          '24. Februar 2022: Russischer Grossangriff — Putin erklärte die Abkommen für gescheitert.',
        ],
      },
      {
        heading: '2022: Grossangriff',
        points: [
          '21./22. Februar 2022: Russland erkennt die "Volksrepubliken" an — USA/EU verhängen erste Sanktionen.',
          '24. Februar 2022: Beginn des russischen Grossangriffs auf die gesamte Ukraine.',
          'Aus ukrainischer/westlicher Sicht: klarer Bruch des Völkerrechts und Angriff auf die Souveränität der Ukraine.',
          'Der Krieg 2022 ist keine neue Situation, sondern die massive Eskalation eines seit 2014 laufenden Konflikts.',
        ],
      },
    ],
  },
]

const BEGRIFFE = [
  { term: 'Souveränität', def: 'Das Recht eines Staates, selbst über sein Gebiet und seine Politik zu entscheiden. Die Ukraine ist seit 1991 ein souveräner Staat.' },
  { term: 'Territoriale Integrität', def: 'Die Grenzen eines Staates dürfen nicht gewaltsam verändert werden. Durch Krim-Annexion und Krieg verletzt.' },
  { term: 'Artikel 5 (NATO)', def: 'Beistandsklausel: Ein Angriff auf ein NATO-Mitglied gilt als Angriff auf alle. Gilt nur für Mitglieder — die Ukraine ist keines.' },
  { term: '"Not one inch"', def: 'Aussage von US-Aussenminister Baker (1990): NATO nicht "keinen Zoll" nach Osten. Russland: gebrochenes Versprechen. Westen: keine schriftliche Zusage.' },
  { term: 'Budapester Memorandum', def: 'Abkommen 1994: Ukraine gibt Atomwaffen ab, erhält Sicherheitszusicherungen (keine Beistandspflicht). Von Russland später gebrochen.' },
  { term: 'Oligarchen', def: 'Sehr reiche, politisch mächtige Unternehmer, die durch Privatisierungen nach 1991 entstanden. Grosser Einfluss auf Staat und Politik.' },
  { term: 'Nomenklatura', def: 'Sowjetische Elite, die nach 1991 ihre Macht in neuer Form bewahrte. Verhinderte echte demokratische Transformation.' },
  { term: 'Euromaidan', def: 'Massenproteste 2013/14 in Kiew, nachdem Janukowytsch das EU-Abkommen ablehnte. Führte zu seinem Sturz und zur Krim-Annexion.' },
  { term: '"Grüne Männchen"', def: 'Soldaten ohne Hoheitsabzeichen, die Russland 2014 zur Besetzung der Krim einsetzte. Russland bestritt zunächst ihre Herkunft.' },
  { term: 'Minsker Abkommen', def: 'Diplomatische Versuche (2014/15) zur Deeskalation im Donbas. Scheiterten an fehlendem Vertrauen und anhaltender Gewalt.' },
  { term: 'Zwei-plus-Vier-Vertrag', def: 'Vertrag 1990 zur deutschen Wiedervereinigung. Regelte Bedingungen für die ehemalige DDR — kein allgemeines NATO-Erweiterungsverbot.' },
  { term: 'OSZE', def: 'Organisation für Sicherheit und Zusammenarbeit in Europa. Sollte Minsker Abkommen überwachen — ohne Durchsetzungsmacht.' },
]

const TIMELINE = [
  { year: '1991', event: 'Ukraine erklärt Unabhängigkeit (24.8.) — Referendum bestätigt mit >90 % (1.12.)' },
  { year: '1994', event: 'Budapester Memorandum: Ukraine gibt Atomwaffen ab' },
  { year: '2004', event: 'Orange Revolution gegen Wahlfälschung' },
  { year: '2010', event: 'Wahl von Wiktor Janukowytsch' },
  { year: '2013/14', event: 'Euromaidan: Janukowytsch lehnt EU-Abkommen ab → Massenproteste' },
  { year: 'Feb. 2014', event: 'Janukowytsch flieht — Opposition übernimmt Macht' },
  { year: 'Mär. 2014', event: 'Krim-Annexion durch Russland ("grüne Männchen")' },
  { year: '2014', event: 'Beginn des Krieges im Donbas + Abschuss MH17' },
  { year: '2014/15', event: 'Minsker Abkommen I & II — scheitern beide' },
  { year: '2019', event: 'Wolodymyr Selenskyj wird Präsident' },
  { year: '21.2.2022', event: 'Russland erkennt "Volksrepubliken" an — Sanktionen folgen' },
  { year: '24.2.2022', event: 'Russischer Grossangriff auf die Ukraine' },
]

// ─── Komponente ─────────────────────────────────────────────────────────────

export default function GeschichtePage() {
  if (new Date() >= EXPIRY) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <Clock size={24} className="text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Sektion nicht mehr verfügbar
          </p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Die Geschichte-Sektion war nur für die Prüfungsvorbereitung am 9./10. April 2026 verfügbar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Landmark size={18} className="text-amber-400" />
          <span className="text-xs font-medium text-amber-400 uppercase tracking-widest">Geschichte</span>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Russland-Ukraine-Konflikt
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Prüfungsstoff · Prüfung 10. April 2026
        </p>
      </div>

      {/* Banner */}
      <div
        className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <span className="text-amber-400 text-base shrink-0">⏰</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-semibold text-amber-400">Nur heute &amp; morgen verfügbar.</span>
          {' '}Diese Sektion enthält den Prüfungsstoff für die Prüfung Geschichte vom 10. April 2026.
        </p>
      </div>

      {/* Video */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Video-Zusammenfassung
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
          <video controls className="w-full" style={{ display: 'block', background: '#000' }}>
            <source src="/Wurzeln_eines_Konflikts.mp4" type="video/mp4" />
            Dein Browser unterstützt kein Video.
          </video>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Wurzeln eines Konflikts</p>
      </div>

      {/* Lernziele */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Lernziele (laut OneNote)
          </h2>
        </div>
        <ul className="space-y-2">
          {LERNZIELE.map((z, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              {z}
            </li>
          ))}
        </ul>
      </div>

      {/* Theorieblöcke */}
      {SECTIONS.map(section => (
        <div key={section.nr} className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
            >
              {section.nr}
            </span>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
            <div className="flex-1 h-px" style={{ background: 'rgba(245,158,11,0.2)' }} />
          </div>

          {/* Blocks */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-color)' }}
          >
            {section.blocks.map((block, bi) => (
              <div
                key={bi}
                className="p-5 space-y-3"
                style={{ borderTop: bi > 0 ? '1px solid var(--border-color)' : 'none', background: 'var(--card-bg)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {block.heading}
                </h3>
                <ul className="space-y-2">
                  {block.points.map((point, pi) => (
                    <li
                      key={pi}
                      className="flex items-start gap-2.5 text-sm leading-relaxed"
                      style={{ color: point.startsWith('→') ? 'var(--text-muted)' : 'var(--text-secondary)' }}
                    >
                      {!point.startsWith('→') && (
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: 'rgba(245,158,11,0.6)' }}
                        />
                      )}
                      {point.startsWith('→') && (
                        <ChevronRight size={13} className="text-amber-400 mt-0.5 shrink-0" />
                      )}
                      <span>{point.startsWith('→') ? point.slice(2) : point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Chronologie */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
          >
            ⏱
          </span>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Chronologie (auswendig lernen!)</h2>
          <div className="flex-1 h-px" style={{ background: 'rgba(245,158,11,0.2)' }} />
        </div>
        <div
          className="rounded-2xl overflow-hidden divide-y"
          style={{ border: '1px solid var(--border-color)', divideColor: 'var(--border-color)' }}
        >
          {TIMELINE.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-3.5"
              style={{ background: 'var(--card-bg)', borderTop: i > 0 ? '1px solid var(--border-color)' : 'none' }}
            >
              <span
                className="text-xs font-bold shrink-0 w-20"
                style={{ color: '#fbbf24' }}
              >
                {e.year}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {e.event}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Begriffe */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
          >
            <FileText size={13} />
          </span>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Schlüsselbegriffe</h2>
          <div className="flex-1 h-px" style={{ background: 'rgba(245,158,11,0.2)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BEGRIFFE.map((b, i) => (
            <div
              key={i}
              className="p-4 rounded-xl space-y-1"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{b.term}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{b.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mini-Lernzettel */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Mini-Lernzettel — das Wichtigste auf einen Blick
        </h2>
        <ul className="space-y-1.5">
          {[
            '1991 — Ukraine unabhängig, grosse Hoffnungen, aber Wirtschaftskrise + Oligarchen',
            '1994 — Budapester Memorandum: Atomwaffen gegen Sicherheitszusicherungen (keine Beistandspflicht!)',
            'NATO — Artikel 5 Beistandsklausel; "not one inch" war keine schriftliche Zusage',
            '2004 — Orange Revolution (Demokratiehoffnung, weitgehend enttäuscht)',
            '2013/14 — Euromaidan → Janukowytschs Flucht',
            '2014 — Krim-Annexion + Beginn Donbas-Krieg = eigentlicher Wendepunkt',
            '2014/15 — Minsk I & II scheitern an gegenseitigem Misstrauen',
            '2019 — Selenskyj Präsident',
            '24.2.2022 — Russischer Grossangriff = massive Eskalation eines seit 2014 laufenden Krieges',
            'Kernformel: Konflikt = historische Verflechtung + Souveränitätsfrage + NATO + Memorandum + Eskalation 2014–2022',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
