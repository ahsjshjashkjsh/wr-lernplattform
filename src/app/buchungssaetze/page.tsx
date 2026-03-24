'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight, BookMarked, Shuffle, Zap, CheckCircle2, XCircle, Trophy } from 'lucide-react'

type Eintrag = { fall: string; satz: string }
type Kategorie = { label: string; color: string; icon: string; eintraege: Eintrag[] }

const KATEGORIEN: Kategorie[] = [
  {
    label: 'Warenkonten',
    color: 'blue',
    icon: '📦',
    eintraege: [
      { fall: 'Lagerzunahme', satz: 'Warenbestand / Warenaufwand' },
      { fall: 'Lagerabnahme', satz: 'Warenaufwand / Warenbestand' },
      { fall: 'Rechnung an Kunden inkl. MwSt. – Warenertrag', satz: 'FLL / WaE' },
      { fall: 'Rechnung an Kunden inkl. MwSt. – MwSt.', satz: 'FLL / Verb. MwSt.' },
      { fall: 'Rücksendung Kunde – Warenertrag', satz: 'Warenertrag / FLL' },
      { fall: 'Rücksendung Kunde – MwSt.-Korrektur', satz: 'Verbindlichk. MwSt / FLL' },
    ],
  },
  {
    label: 'MWST',
    color: 'violet',
    icon: '🧾',
    eintraege: [
      { fall: 'Rechnung Lieferant 8.1% MwSt. – NICHT Investitionen (1. Buchungssatz)', satz: 'WaA / VLL' },
      { fall: 'Rechnung Lieferant 8.1% MwSt. – NICHT Investitionen (2. Buchungssatz – Vorsteuer)', satz: 'Vorst. 1170 / VLL' },
      { fall: 'Rechnung Lieferant 8.1% MwSt. – INVESTITIONEN (1. Buchungssatz)', satz: 'WaA / VLL' },
      { fall: 'Rechnung Lieferant 8.1% MwSt. – INVESTITIONEN (2. Buchungssatz – Vorsteuer)', satz: 'Vorst. 1177 / VLL' },
      { fall: 'Verrechnung der MwSt.', satz: 'Verb. MwSt. / Vorst. 1170' },
      { fall: 'Banküberweisung der MwSt.', satz: 'Verb. MwSt. / Bank' },
    ],
  },
  {
    label: 'Verrechnungssteuer',
    color: 'amber',
    icon: '💰',
    eintraege: [
      { fall: 'Kapitalerträge VST – Bruttomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (100%)' },
      { fall: 'Kapitalerträge VST – Bruttomethode (2. Buchungssatz – VST)', satz: 'Ford. VST / Bank  (35%)' },
      { fall: 'Kapitalerträge VST – Nettomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (65%)' },
      { fall: 'Kapitalerträge VST – Nettomethode (2. Buchungssatz – VST)', satz: 'Ford. VST / Finanzertrag  (35%)' },
      { fall: '50 Aktien, Nennwert CHF 200, Dividende 8% – Nettobetrag', satz: 'Bank / Finanzertrag  (800 × 65%)' },
      { fall: '50 Aktien, Nennwert CHF 200, Dividende 8% – VST', satz: 'Ford. VST / Finanzertrag  (800 × 35%)' },
      { fall: 'Bankgutschrift Nettodividende CHF 1\'300 – VST rückrechnen', satz: 'Ford. VST / Finanzertrag  (1\'300 / 65 × 35)' },
    ],
  },
  {
    label: 'Delkredere / Verluste',
    color: 'red',
    icon: '⚠️',
    eintraege: [
      { fall: 'Forderung entsteht', satz: 'FLL / WaE' },
      { fall: 'Kunde zahlt nicht', satz: 'Kein Buchungssatz' },
      { fall: '3. Mahnung mit Verzugszins', satz: 'FLL / FinanzE' },
      { fall: 'Start Betreibungsverfahren', satz: 'FLL / Kasse' },
      { fall: 'Konkursdividende – Verfahren abgeschlossen', satz: 'Post / FLL' },
      { fall: 'Verlustschein – Verfahren abgeschlossen', satz: 'Verl. Ford. / FLL' },
      { fall: 'Nachträgliche Bezahlung – gleiches Rechnungsjahr', satz: 'Bank / Verl. Ford.' },
      { fall: 'Nachträgliche Bezahlung – späteres Rechnungsjahr', satz: 'Bank / A.o. E' },
      { fall: 'Bildung Wertberichtigung Forderungen (Delkredere)', satz: 'Verl. Ford. / WB Ford.' },
      { fall: 'WB Forderungen verkleinern', satz: 'WB Ford. / Verl. Ford.' },
    ],
  },
  {
    label: 'Abschreibungen',
    color: 'slate',
    icon: '📉',
    eintraege: [
      { fall: 'Abschreibung direkt', satz: 'Abs / Mob' },
      { fall: 'Abschreibung indirekt', satz: 'Abs / WB Mob' },
      { fall: 'Verkaufserlös – Verkauf AV (direkte Methode)', satz: 'Kasse / Mob' },
      { fall: 'Veräusserungsverlust – Verkauf AV (direkte Methode)', satz: 'a.o. A / Mob' },
      { fall: 'Veräusserungsgewinn – Verkauf AV (direkte Methode)', satz: '(Mob / a.o. E)' },
      { fall: 'Verkaufserlös – Verkauf AV (indirekte Methode)', satz: 'Kasse / Mob' },
      { fall: 'Auflösung WB – Verkauf AV (indirekte Methode)', satz: 'WB Mob / Mob' },
      { fall: 'Veräusserungsverlust – Verkauf AV (indirekte Methode)', satz: 'a.o. A / Mob' },
      { fall: 'Veräusserungsgewinn – Verkauf AV (indirekte Methode)', satz: '(Mob / a.o. E)' },
    ],
  },
  {
    label: 'Rückstellungen',
    color: 'orange',
    icon: '🔒',
    eintraege: [
      { fall: 'Bildung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess' },
      { fall: 'Abschluss Konto Rückstellung', satz: 'Rückstellung Prozess / SB' },
      { fall: 'Zahlung Anwaltskosten (Rückstellung)', satz: 'Rückstellung Prozess / Bank' },
      { fall: 'Anpassung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess' },
    ],
  },
  {
    label: 'Abgrenzungen',
    color: 'teal',
    icon: '⏳',
    eintraege: [
      { fall: 'Geldguthaben (vorausbezahlter Aufwand oder noch nicht erhaltener Ertrag)', satz: 'Aktiv Ra / (Aufwand oder Ertrag)' },
      { fall: 'Leistungsguthaben (erbrachte Leistung noch nicht verrechnet)', satz: 'Aktiv Ra / (Aufwand oder Ertrag)' },
      { fall: 'Geldschuld (erhaltenes Geld für noch nicht erbrachte Leistung)', satz: '(Aufwand oder Ertrag) / Passiv Ra' },
      { fall: 'Leistungsschuld (Aufwand entstanden aber noch nicht bezahlt)', satz: '(Aufwand oder Ertrag) / Passiv Ra' },
    ],
  },
  {
    label: 'Löhne',
    color: 'green',
    icon: '👷',
    eintraege: [
      { fall: 'Arbeitnehmerbeiträge (AN-Beiträge)', satz: 'LohnA / Verb. Sozialvers.' },
      { fall: 'Arbeitgeberbeiträge (AG-Beiträge)', satz: 'Sozialvers.A / Verb. Sozialvers.' },
      { fall: 'Nettolohn (Auszahlung per Bank)', satz: 'LohnA / Bank' },
      { fall: 'Bruttolohn', satz: 'Kein Buchungssatz' },
      { fall: 'Lohnvorschuss aus Geschäftskasse', satz: 'LohnA / Kasse' },
      { fall: 'Spesenentschädigung per Banküberweisung', satz: 'Übr. PersonalA / Bank' },
      { fall: 'Weiterbildungsrechnung', satz: 'Übr. PersonalA / VLL' },
    ],
  },
  {
    label: 'Stille Reserven',
    color: 'indigo',
    icon: '🔮',
    eintraege: [
      { fall: 'Unterbewertung Warenvorrat – Bildung', satz: 'Warenaufwand / Warenvorrat' },
      { fall: 'Unterbewertung Anlagevermögen – Bildung', satz: 'Abschreibung / Anlagevermögen' },
      { fall: 'Überbewertung Rückstellungen – Bildung', satz: 'Sonst. BA / Rückstellungen' },
      { fall: 'Auflösung stille Reserven – Warenvorrat', satz: 'Warenvorrat / Warenaufwand' },
      { fall: 'Auflösung stille Reserven – Anlagevermögen', satz: 'Anlagevermögen / Abschreibung' },
      { fall: 'Auflösung stille Reserven – Rückstellungen', satz: 'Rückstellung / Sonst. BA' },
    ],
  },
  {
    label: 'Einzelunternehmen',
    color: 'cyan',
    icon: '🧑‍💼',
    eintraege: [
      { fall: 'Private Rechnung', satz: 'Privat / (Bank / Kasse / Post)' },
      { fall: 'Privatanteil Fahrzeug', satz: 'Privat / Fahrzeugaufwand' },
      { fall: 'Gutschrift Eigenlohn', satz: 'Lohnaufwand / Privat' },
      { fall: 'Gutschrift Eigenzins', satz: 'Finanzaufwand / Privat' },
      { fall: 'Gutschrift Reisespesen', satz: 'Übriger PersonalA / Privat' },
      { fall: 'Kapitalrückzug', satz: 'Eigenkapital / Bank' },
      { fall: 'Sacheinlage Fahrzeug', satz: 'Fahrzeug / Eigenkapital' },
      { fall: 'Übertrag Privatkonto (Jahresabschluss)', satz: 'Privat / Eigenkapital' },
      { fall: 'Verlustvortrag (1. Geschäftsjahr)', satz: 'Eigenkapital / Jahresverlust' },
    ],
  },
  {
    label: 'Aktiengesellschaft (AG)',
    color: 'purple',
    icon: '🏢',
    eintraege: [
      { fall: 'Kapitalverpflichtung (Gründung)', satz: 'Ford. Aktionäre / Aktienkapital' },
      { fall: 'Einbringung Kasse', satz: 'Kasse / Ford. Aktionäre' },
      { fall: 'Einbringung VLL', satz: 'Ford. Aktionäre / VLL' },
      { fall: 'Einzahlung Restbetrag', satz: 'Bank / Ford. Aktionäre' },
      { fall: 'Anfangsbestand Gewinnvortrag', satz: 'ER / Gewinnvortrag' },
      { fall: 'Übertrag Jahresgewinn', satz: 'ER / Jahresgewinn' },
      { fall: 'Verbuchung Jahresgewinn', satz: 'Jahresgewinn / Gewinnvortrag' },
      { fall: 'Zuweisung Ges. Gewinnreserve', satz: 'Gewinnvortrag / Ges. Gewinnreserve' },
      { fall: 'Zuweisung Dividenden', satz: 'Gewinnvortrag / Dividenden' },
      { fall: 'Auszahlung Nettodividende (65%)', satz: 'Dividenden / Bank' },
      { fall: 'Abzug Verrechnungssteuer (35%)', satz: 'Dividenden / Verbindlichkeit VST' },
      { fall: 'Überweisung Verrechnungssteuer an ESTV', satz: 'Verbindlichkeit VST / Bank' },
      { fall: 'Übertrag Jahresverlust', satz: 'Jahresverlust / ER' },
      { fall: 'Verbuchung Jahresverlust', satz: 'Verlustvortrag / Jahresverlust' },
      { fall: 'Verwendung Gewinnvortrag zum Verlustausgleich', satz: 'Gewinnvortrag / Verlustvortrag' },
      { fall: 'Auflösung Ges. Gewinnreserve', satz: 'Ges. Gewinnreserve / Verlustvortrag' },
      { fall: 'Erhöhung Aktienkapital', satz: 'Bank / Aktienkapital' },
      { fall: 'Agio (Ausgabe über Nennwert)', satz: 'Bank / Gesetzliche Kapitalreserve' },
    ],
  },
  {
    label: 'Immobilien / Liegenschaften',
    color: 'emerald',
    icon: '🏠',
    eintraege: [
      { fall: 'Mietzinseinnahmen', satz: 'Bank / Liegenschaftsertrag' },
      { fall: 'Mietwert Geschäftsräume (eigene Liegenschaft)', satz: 'Raumaufwand / Liegenschaftsertrag' },
      { fall: 'Mietwert Privatwohnung', satz: 'Privat / Liegenschaftsertrag' },
      { fall: 'Rechnung Malarbeiten', satz: 'Liegenschaftsaufwand / VLL' },
      { fall: 'Barzahlung kleine Reparaturen', satz: 'Liegenschaftsaufwand / Kasse' },
      { fall: 'Bankbelastung Hypothekarzins', satz: 'Liegenschaftsaufwand / Bank' },
      { fall: 'Bankbelastung Abzahlung Hypothek', satz: 'Hypothek / Bank' },
      { fall: 'Abschreibung der Liegenschaft', satz: 'Liegenschaftsaufwand / Immobilien' },
      { fall: 'Kaufpreis Liegenschaft (Käufer) – via Abrechnungskonto', satz: 'Immobilien / VLL' },
      { fall: 'Handänderungskosten (Käufer)', satz: 'Immobilien / Bank' },
      { fall: 'Übernahme Hypothek (Käufer)', satz: 'VLL / Hypotheken' },
      { fall: 'Übernahme Heizölvorrat (Käufer)', satz: 'Liegenschaftsaufwand / VLL' },
      { fall: 'Verrechnung Mietzins (Käufer)', satz: 'VLL / Liegenschaftsertrag' },
      { fall: 'Banküberweisung Restbetrag (Käufer)', satz: 'VLL / Bank' },
      { fall: 'Kaufpreis Liegenschaft (Verkäufer)', satz: 'FLL / Immobilien' },
      { fall: 'Handänderungskosten (Verkäufer)', satz: 'A.o. Ertrag / Bank' },
      { fall: 'Übernahme Hypothek (Verkäufer)', satz: 'Hypotheken / FLL' },
      { fall: 'Übernahme Heizölvorrat (Verkäufer)', satz: 'FLL / Liegenschaftsaufwand' },
      { fall: 'Verrechnung Mietzins (Verkäufer)', satz: 'Liegenschaftsertrag / FLL' },
      { fall: 'Banküberweisung Restbetrag (Verkäufer)', satz: 'Bank / FLL' },
      { fall: 'Verkaufsgewinn Liegenschaft', satz: 'Immobilien / A.o. Ertrag' },
    ],
  },
  {
    label: 'Fremde Währungen',
    color: 'pink',
    icon: '💱',
    eintraege: [
      { fall: 'Kauf EUR 10\'150 zu Buchkurs 1.08 (Buchung Warenaufwand)', satz: 'Warenaufwand / VLL  (EUR 10\'150 × 1.08 = CHF 10\'962)' },
      { fall: 'Zahlung VLL zu Tageskurs – Kursverlust (Tageskurs > Buchkurs)', satz: 'VLL / Post  +  Warenaufwand / VLL  (Differenz)' },
      { fall: 'Zahlung VLL zu Tageskurs – Kursgewinn (Tageskurs < Buchkurs)', satz: 'VLL / Bank  +  VLL / Warenaufwand  (Differenz)' },
      { fall: 'Rabatt auf Einkauf in Fremdwährung zum Buchkurs', satz: 'VLL / Warenaufwand  (EUR Rabatt × Buchkurs)' },
      { fall: 'Zinszahlung Hypothek CHF 350\'000 zu 2% – letztes Vierteljahr', satz: 'LgA / Bank  (350\'000 × 2% × 3/12 = CHF 1\'750)' },
      { fall: 'Teilrückzahlung Hypothek CHF 50\'000', satz: 'Hypotheken / Bank  (CHF 50\'000)' },
    ],
  },
  {
    label: 'Formeln Liegenschaften',
    color: 'yellow',
    icon: '📐',
    eintraege: [
      { fall: 'Finanzierung', satz: 'Kaufpreis − Hypothek = Eigene Mittel' },
      { fall: 'Liegenschaftserfolg', satz: 'Mietzinseinnahmen − Hypothekarzinsen − Unterhaltskosten = Liegenschaftsgewinn' },
      { fall: 'Bruttorendite', satz: '(Liegenschaftserfolg × 100) / Kaufpreis' },
      { fall: 'Nettorendite', satz: '(Liegenschaftsgewinn × 100) / Eigene Mittel' },
      { fall: 'Ertragswert', satz: '(Liegenschaftserfolg × 100) / Bruttorendite in %' },
    ],
  },
  {
    label: 'Unterbilanz & Überschuldung',
    color: 'rose',
    icon: '🚨',
    eintraege: [
      { fall: 'Wann liegt eine Unterbilanz OHNE gesetzliche Folgen vor?', satz: 'Aktiven decken Fremdkapital + mindestens ½ EK (Aktienkapital + gesetzliche Reserven)' },
      { fall: 'Wann liegt eine Unterbilanz MIT gesetzlichen Folgen vor?', satz: 'Aktiven decken Fremdkapital, aber weniger als ½ EK' },
      { fall: 'Wann liegt eine Überschuldung vor?', satz: 'Aktiven < Fremdkapital → kein EK mehr, Bilanzverlust übersteigt gesamtes EK' },
    ],
  },
]

const COLORS: Record<string, { from: string; to: string; border: string; text: string; badge: string; glow: string }> = {
  blue:    { from: '#1e3a5f', to: '#1e293b', border: 'rgba(59,130,246,0.4)',   text: '#93c5fd', badge: 'rgba(59,130,246,0.15)',   glow: 'rgba(59,130,246,0.3)' },
  violet:  { from: '#2e1065', to: '#1e293b', border: 'rgba(139,92,246,0.4)',   text: '#c4b5fd', badge: 'rgba(139,92,246,0.15)',   glow: 'rgba(139,92,246,0.3)' },
  amber:   { from: '#451a03', to: '#1e293b', border: 'rgba(245,158,11,0.4)',   text: '#fcd34d', badge: 'rgba(245,158,11,0.15)',   glow: 'rgba(245,158,11,0.3)' },
  red:     { from: '#450a0a', to: '#1e293b', border: 'rgba(239,68,68,0.4)',    text: '#fca5a5', badge: 'rgba(239,68,68,0.15)',    glow: 'rgba(239,68,68,0.3)' },
  slate:   { from: '#0f172a', to: '#1e293b', border: 'rgba(100,116,139,0.4)',  text: '#cbd5e1', badge: 'rgba(100,116,139,0.15)',  glow: 'rgba(100,116,139,0.3)' },
  orange:  { from: '#431407', to: '#1e293b', border: 'rgba(249,115,22,0.4)',   text: '#fdba74', badge: 'rgba(249,115,22,0.15)',   glow: 'rgba(249,115,22,0.3)' },
  teal:    { from: '#042f2e', to: '#1e293b', border: 'rgba(20,184,166,0.4)',   text: '#5eead4', badge: 'rgba(20,184,166,0.15)',   glow: 'rgba(20,184,166,0.3)' },
  green:   { from: '#052e16', to: '#1e293b', border: 'rgba(34,197,94,0.4)',    text: '#86efac', badge: 'rgba(34,197,94,0.15)',    glow: 'rgba(34,197,94,0.3)' },
  indigo:  { from: '#1e1b4b', to: '#1e293b', border: 'rgba(99,102,241,0.4)',   text: '#a5b4fc', badge: 'rgba(99,102,241,0.15)',   glow: 'rgba(99,102,241,0.3)' },
  cyan:    { from: '#083344', to: '#1e293b', border: 'rgba(6,182,212,0.4)',    text: '#67e8f9', badge: 'rgba(6,182,212,0.15)',    glow: 'rgba(6,182,212,0.3)' },
  purple:  { from: '#2e1065', to: '#1e293b', border: 'rgba(168,85,247,0.4)',   text: '#d8b4fe', badge: 'rgba(168,85,247,0.15)',   glow: 'rgba(168,85,247,0.3)' },
  emerald: { from: '#022c22', to: '#1e293b', border: 'rgba(16,185,129,0.4)',   text: '#6ee7b7', badge: 'rgba(16,185,129,0.15)',   glow: 'rgba(16,185,129,0.3)' },
  pink:    { from: '#500724', to: '#1e293b', border: 'rgba(236,72,153,0.4)',   text: '#f9a8d4', badge: 'rgba(236,72,153,0.15)',   glow: 'rgba(236,72,153,0.3)' },
  yellow:  { from: '#422006', to: '#1e293b', border: 'rgba(234,179,8,0.4)',    text: '#fde047', badge: 'rgba(234,179,8,0.15)',    glow: 'rgba(234,179,8,0.3)' },
  rose:    { from: '#4c0519', to: '#1e293b', border: 'rgba(244,63,94,0.4)',    text: '#fda4af', badge: 'rgba(244,63,94,0.15)',    glow: 'rgba(244,63,94,0.3)' },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Quiz Generator ──────────────────────────────────────────────────────────
type QuizFrage = { fall: string; richtig: string; optionen: string[] }

function genQuiz(alleEintraege: Eintrag[], anzahl: number): QuizFrage[] {
  const pool = shuffle(alleEintraege).slice(0, anzahl)
  const alleAntworten = alleEintraege.map(e => e.satz)
  return pool.map(e => {
    const falsch = shuffle(alleAntworten.filter(s => s !== e.satz)).slice(0, 3)
    return { fall: e.fall, richtig: e.satz, optionen: shuffle([e.satz, ...falsch]) }
  })
}

function QuizGenerator({ onBack }: { onBack: () => void }) {
  // Setup state
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'result'>('setup')
  const [selectedKats, setSelectedKats] = useState<Set<string>>(new Set(KATEGORIEN.map(k => k.label)))
  const [anzahl, setAnzahl] = useState(10)
  const [fragen, setFragen] = useState<QuizFrage[]>([])
  const [index, setIndex] = useState(0)
  const [gewählt, setGewählt] = useState<string | null>(null)
  const [richtigCount, setRichtigCount] = useState(0)
  const [falscheListe, setFalscheListe] = useState<QuizFrage[]>([])

  function toggleKat(label: string) {
    setSelectedKats(prev => {
      const next = new Set(prev)
      if (next.has(label)) { if (next.size > 1) next.delete(label) }
      else next.add(label)
      return next
    })
  }

  function starten() {
    const pool = KATEGORIEN.filter(k => selectedKats.has(k.label)).flatMap(k => k.eintraege)
    const q = genQuiz(pool, Math.min(anzahl, pool.length))
    setFragen(q); setIndex(0); setGewählt(null); setRichtigCount(0); setFalscheListe([])
    setPhase('quiz')
  }

  function antworten(opt: string) {
    if (gewählt) return
    setGewählt(opt)
    const correct = opt === fragen[index].richtig
    if (correct) setRichtigCount(r => r + 1)
    else setFalscheListe(f => [...f, fragen[index]])
  }

  function weiter() {
    if (index + 1 >= fragen.length) { setPhase('result'); return }
    setIndex(i => i + 1); setGewählt(null)
  }

  function restart() { setPhase('setup') }

  const score = fragen.length > 0 ? Math.round((richtigCount / fragen.length) * 100) : 0

  if (phase === 'setup') return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Zap size={18} className="text-amber-400" /> Quiz-Generator</h2>
          <p className="text-slate-500 text-xs mt-0.5">Wähle Themen + Anzahl Fragen — ich mische alles durch</p>
        </div>
      </div>

      {/* Kategorien */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Kategorien</span>
          <button onClick={() => setSelectedKats(new Set(KATEGORIEN.map(k => k.label)))}
            className="text-xs text-blue-400 hover:text-blue-300">Alle auswählen</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KATEGORIEN.map(k => {
            const c = COLORS[k.color] ?? COLORS.blue
            const on = selectedKats.has(k.label)
            return (
              <button key={k.label} onClick={() => toggleKat(k.label)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border text-left"
                style={{
                  background: on ? c.badge : 'rgba(255,255,255,0.03)',
                  borderColor: on ? c.border : 'rgba(255,255,255,0.08)',
                  color: on ? c.text : '#64748b',
                }}>
                <span>{k.icon}</span>
                <span className="truncate">{k.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Anzahl */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <span className="text-sm font-semibold text-slate-300">Anzahl Fragen</span>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 15, 20, 30].map(n => (
            <button key={n} onClick={() => setAnzahl(n)}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{
                background: anzahl === n ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: anzahl === n ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)',
                color: anzahl === n ? '#93c5fd' : '#64748b',
              }}>{n}</button>
          ))}
        </div>
      </div>

      <button onClick={starten}
        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.3))', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
        <Zap size={16} /> Quiz starten · {Math.min(anzahl, KATEGORIEN.filter(k => selectedKats.has(k.label)).flatMap(k => k.eintraege).length)} Fragen
      </button>
    </div>
  )

  if (phase === 'result') {
    const emoji = score >= 90 ? '🏆' : score >= 70 ? '🎉' : score >= 50 ? '💪' : '📚'
    return (
      <div className="flex flex-col items-center gap-6 min-h-[60vh] justify-center fade-in">
        <div className="text-6xl">{emoji}</div>
        <div className="text-center">
          <div className="text-4xl font-black text-white mb-1">{score}%</div>
          <p className="text-slate-400">{richtigCount} von {fragen.length} richtig</p>
        </div>

        {/* Score bar */}
        <div className="w-64 h-3 rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: score >= 70 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : score >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)' }} />
        </div>

        {/* Falsche Antworten */}
        {falscheListe.length > 0 && (
          <div className="w-full max-w-xl glass rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-300 flex items-center gap-2"><XCircle size={14} className="text-red-400" /> Falsch beantwortet</p>
            {falscheListe.map((f, i) => (
              <div key={i} className="text-xs space-y-0.5 border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                <p className="text-slate-400">{f.fall}</p>
                <p className="font-mono font-semibold text-emerald-400">{f.richtig}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={starten}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:scale-105 transition-all">
            <Zap size={14} /> Nochmal
          </button>
          <button onClick={restart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.05] border border-white/10 text-slate-300 hover:scale-105 transition-all">
            <ArrowLeft size={14} /> Einstellungen
          </button>
          <button onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.05] border border-white/10 text-slate-300 hover:scale-105 transition-all">
            Themen
          </button>
        </div>
      </div>
    )
  }

  // Quiz phase
  const frage = fragen[index]
  const progress = (index / fragen.length) * 100
  const correct = gewählt === frage.richtig

  return (
    <div className="flex flex-col gap-5 fade-in max-w-2xl mx-auto">
      {/* Top */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> Beenden
        </button>
        <span className="text-xs text-slate-500">{index + 1} / {fragen.length}</span>
        <span className="text-xs font-semibold text-emerald-400">{richtigCount} ✓</span>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
      </div>

      {/* Frage */}
      <div className="glass rounded-2xl p-6 text-center min-h-[100px] flex items-center justify-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3">Buchungsfall</p>
          <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">{frage.fall}</p>
        </div>
      </div>

      {/* Optionen */}
      <div className="grid grid-cols-1 gap-2.5">
        {frage.optionen.map((opt, i) => {
          let style: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
          if (gewählt) {
            if (opt === frage.richtig) style = { background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.5)', color: '#86efac' }
            else if (opt === gewählt) style = { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.5)', color: '#fca5a5' }
          }
          return (
            <button key={i} onClick={() => antworten(opt)} disabled={!!gewählt}
              className="w-full text-left px-4 py-3.5 rounded-xl border text-sm font-mono font-medium transition-all disabled:cursor-default"
              style={style}>
              <span className="text-slate-600 mr-3 font-sans">{['A', 'B', 'C', 'D'][i]}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback + Weiter */}
      {gewählt && (
        <div className="flex flex-col gap-3 fade-in">
          <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl ${correct ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {correct ? 'Richtig!' : `Falsch — Richtig: ${frage.richtig}`}
          </div>
          <button onClick={weiter}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
            {index + 1 >= fragen.length ? <><Trophy size={15} /> Ergebnis anzeigen</> : <>Weiter <ArrowRight size={15} /></>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Study Mode ──────────────────────────────────────────────────────────────
function StudyMode({ kat, onBack }: { kat: Kategorie; onBack: () => void }) {
  const c = COLORS[kat.color] ?? COLORS.blue
  const [cards, setCards] = useState<Eintrag[]>(() => shuffle(kat.eintraege))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  const current = cards[index]
  const progress = ((index) / cards.length) * 100

  function next() {
    setFlipped(false)
    setTimeout(() => {
      if (index + 1 >= cards.length) setDone(true)
      else setIndex(i => i + 1)
    }, 150)
  }

  function restart() {
    setCards(shuffle(kat.eintraege))
    setIndex(0)
    setFlipped(false)
    setDone(false)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 fade-in">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{ background: `${c.badge}`, border: `2px solid ${c.border}`, boxShadow: `0 0 40px ${c.glow}` }}>
          🎉
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Alle {cards.length} Karten geschafft!</h2>
          <p className="text-slate-400">{kat.label} · {kat.icon}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={restart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: c.badge, border: `1px solid ${c.border}`, color: c.text }}>
            <Shuffle size={15} /> Nochmal (gemischt)
          </button>
          <button onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-white/[0.06] border border-white/10 text-slate-300">
            <ArrowLeft size={15} /> Thema wechseln
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={15} /> Themenauswahl
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: c.text }}>{kat.icon} {kat.label}</span>
          <span className="text-xs text-slate-600">{index + 1} / {cards.length}</span>
        </div>
        <button onClick={restart} className="text-slate-600 hover:text-slate-400 transition-colors" title="Neu mischen">
          <Shuffle size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${c.border}, ${c.text})` }} />
      </div>

      {/* Flip Card */}
      <div className="flex justify-center">
        <div
          onClick={() => setFlipped(v => !v)}
          className="relative cursor-pointer select-none"
          style={{ width: '100%', maxWidth: '600px', height: '300px', perspective: '1200px' }}
        >
          <div
            className="absolute inset-0 transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-8 gap-4"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
                border: `1px solid ${c.border}`,
                boxShadow: `0 20px 60px -10px ${c.glow}, 0 0 0 1px rgba(255,255,255,0.05)`,
              }}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-slate-500">Buchungsfall</span>
              <p className="text-center text-lg sm:text-xl font-semibold text-slate-100 leading-snug">
                {current.fall}
              </p>
              <span className="text-xs text-slate-600 mt-2">Tippen zum Aufdecken</span>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-8 gap-4"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: `linear-gradient(135deg, ${c.to} 0%, ${c.from} 100%)`,
                border: `1px solid ${c.border}`,
                boxShadow: `0 20px 60px -10px ${c.glow}, 0 0 0 1px rgba(255,255,255,0.05)`,
              }}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-slate-500">Buchungssatz</span>
              <p className="text-center font-mono font-bold leading-snug" style={{ color: c.text, fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                {current.satz}
              </p>
              <span className="text-xs text-slate-600 mt-2">Tippen zum Zurückblättern</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => Math.max(0, i - 1)), 150) }}
          disabled={index === 0}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all border disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 bg-white/[0.05] border-white/10 text-slate-300"
        >
          <ArrowLeft size={18} />
        </button>

        {!flipped ? (
          <button onClick={() => setFlipped(true)}
            className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: c.badge, border: `1px solid ${c.border}`, color: c.text }}>
            Aufdecken
          </button>
        ) : (
          <button onClick={next}
            className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: c.badge, border: `1px solid ${c.border}`, color: c.text }}>
            {index + 1 >= cards.length ? 'Fertig 🎉' : 'Weiter'} <ArrowRight size={15} />
          </button>
        )}

        <button
          onClick={next}
          disabled={index + 1 >= cards.length && !flipped}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all border disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 bg-white/[0.05] border-white/10 text-slate-300"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 flex-wrap max-w-sm mx-auto">
        {cards.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full transition-all"
            style={{ background: i < index ? c.text : i === index ? c.border : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
    </div>
  )
}

// ── Category Selection ───────────────────────────────────────────────────────
type View = { type: 'home' } | { type: 'study'; kat: Kategorie } | { type: 'quiz' }

export default function BuchungssaetzePage() {
  const [view, setView] = useState<View>({ type: 'home' })
  const totalCards = KATEGORIEN.reduce((s, k) => s + k.eintraege.length, 0)

  if (view.type === 'study') return <StudyMode kat={view.kat} onBack={() => setView({ type: 'home' })} />
  if (view.type === 'quiz')  return <QuizGenerator onBack={() => setView({ type: 'home' })} />

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Buchungssätze</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {KATEGORIEN.length} Themen · {totalCards} Karten · Kontenrahmen KMU (HEP)
          </p>
        </div>
        <button
          onClick={() => setView({ type: 'quiz' })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.4)', color: '#fcd34d', boxShadow: '0 0 20px rgba(245,158,11,0.15)' }}>
          <Zap size={15} /> Quiz-Generator
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KATEGORIEN.map(kat => {
          const c = COLORS[kat.color] ?? COLORS.blue
          return (
            <button
              key={kat.label}
              onClick={() => setView({ type: 'study', kat })}
              className="group text-left rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${c.from} 0%, rgba(15,23,42,0.8) 100%)`,
                border: `1px solid ${c.border}`,
                boxShadow: `0 4px 24px -4px ${c.glow}`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{kat.icon}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: c.badge, color: c.text, border: `1px solid ${c.border}` }}>
                  {kat.eintraege.length} Karten
                </span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">{kat.label}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{kat.eintraege[0].fall}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors group-hover:translate-x-1 duration-200"
                style={{ color: c.text }}>
                <BookMarked size={12} /> Lernen starten
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
