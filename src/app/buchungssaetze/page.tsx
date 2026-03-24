'use client'

import { useState } from 'react'
import { BookOpen, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

type Buchungssatz = { fall: string; satz: string }
type Kategorie = { label: string; color: string; eintraege: Buchungssatz[] }

const KATEGORIEN: Kategorie[] = [
  {
    label: 'Warenkonten',
    color: 'blue',
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
    eintraege: [
      { fall: 'Rechnung von Lieferanten inkl. 8.1% MwSt. – NICHT Investitionen (1. Buchungssatz)', satz: 'WaA / VLL' },
      { fall: 'Rechnung von Lieferanten inkl. 8.1% MwSt. – NICHT Investitionen (2. Buchungssatz – Vorsteuer)', satz: 'Vorst. 1170 / VLL' },
      { fall: 'Rechnung von Lieferanten inkl. 8.1% MwSt. – INVESTITIONEN (1. Buchungssatz)', satz: 'WaA / VLL' },
      { fall: 'Rechnung von Lieferanten inkl. 8.1% MwSt. – INVESTITIONEN (2. Buchungssatz – Vorsteuer)', satz: 'Vorst. 1177 / VLL' },
      { fall: 'Verrechnung der MwSt.', satz: 'Verb. MwSt. / Vorst. 1170' },
      { fall: 'Banküberweisung der MwSt.', satz: 'Verb. MwSt. / Bank' },
    ],
  },
  {
    label: 'Verrechnungssteuer (VST)',
    color: 'amber',
    eintraege: [
      { fall: 'Kapitalerträge und VST – Bruttomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (100%)' },
      { fall: 'Kapitalerträge und VST – Bruttomethode (2. Buchungssatz – VST)', satz: 'Ford. VST / Bank  (35%)' },
      { fall: 'Kapitalerträge und VST – Nettomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (65%)' },
      { fall: 'Kapitalerträge und VST – Nettomethode (2. Buchungssatz – VST)', satz: 'Ford. VST / Finanzertrag  (35%)' },
      { fall: '50 Aktien, Nennwert CHF 200, Dividende 8% – Nettobetrag', satz: 'Bank / Finanzertrag  (CHF 800 × 65%)' },
      { fall: '50 Aktien, Nennwert CHF 200, Dividende 8% – VST', satz: 'Ford. VST / Finanzertrag  (CHF 800 × 35%)' },
      { fall: 'Bankgutschrift Nettodividende CHF 1\'300 – VST', satz: 'Ford. VST / Finanzertrag  (1\'300 / 65 × 35)' },
    ],
  },
  {
    label: 'Delkredere / Verluste aus Forderungen',
    color: 'red',
    eintraege: [
      { fall: 'Forderung entsteht', satz: 'FLL / WaE' },
      { fall: 'Kunde zahlt nicht', satz: 'Kein Buchungssatz' },
      { fall: '3. Mahnung mit Verzugszins', satz: 'FLL / FinanzE' },
      { fall: 'Start Betreibungsverfahren', satz: 'FLL / Kasse' },
      { fall: 'Konkursdividende – Verfahren wird abgeschlossen', satz: 'Post / FLL' },
      { fall: 'Verlustschein – Verfahren wird abgeschlossen', satz: 'Verl. Ford. / FLL' },
      { fall: 'Nachträgliche Bezahlung – im gleichen Rechnungsjahr', satz: 'Bank / Verl. Ford.' },
      { fall: 'Nachträgliche Bezahlung – späteres Rechnungsjahr', satz: 'Bank / A.o. E' },
      { fall: 'Bildung Wertberichtigung Forderungen (Delkredere)', satz: 'Verl. Ford. / WB Ford.' },
      { fall: 'WB Forderungen verkleinern', satz: 'WB Ford. / Verl. Ford.' },
    ],
  },
  {
    label: 'Abschreibungen',
    color: 'slate',
    eintraege: [
      { fall: 'Abschreibung direkt', satz: 'Abs / Mob' },
      { fall: 'Abschreibung indirekt', satz: 'Abs / WB Mob' },
      { fall: 'Verkaufserlös – Verkauf von AV (direkte Methode)', satz: 'Kasse / Mob' },
      { fall: 'Veräusserungsverlust – Verkauf von AV (direkte Methode)', satz: 'a.o. A / Mob' },
      { fall: 'Veräusserungsgewinn – Verkauf von AV (direkte Methode)', satz: '(Mob / a.o. E)' },
      { fall: 'Verkaufserlös – Verkauf von AV (indirekte Methode)', satz: 'Kasse / Mob' },
      { fall: 'Auflösung WB – Verkauf von AV (indirekte Methode)', satz: 'WB Mob / Mob' },
      { fall: 'Veräusserungsverlust – Verkauf von AV (indirekte Methode)', satz: 'a.o. A / Mob' },
      { fall: 'Veräusserungsgewinn – Verkauf von AV (indirekte Methode)', satz: '(Mob / a.o. E)' },
    ],
  },
  {
    label: 'Rückstellungen',
    color: 'orange',
    eintraege: [
      { fall: 'Bildung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess' },
      { fall: 'Abschluss Konto Rückstellung', satz: 'Rückstellung Prozess / SB' },
      { fall: 'Zahlung Anwaltskosten (Rückstellung)', satz: 'Rückstellung Prozess / Bank' },
      { fall: 'Anpassung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess' },
    ],
  },
  {
    label: 'Abgrenzungen (Rechnungsabgrenzung)',
    color: 'teal',
    eintraege: [
      { fall: 'Geldguthaben', satz: 'Aktiv Ra / (Aufwand oder Ertrag)' },
      { fall: 'Leistungsguthaben', satz: 'Aktiv Ra / (Aufwand oder Ertrag)' },
      { fall: 'Geldschuld', satz: '(Aufwand oder Ertrag) / Passiv Ra' },
      { fall: 'Leistungsschuld', satz: '(Aufwand oder Ertrag) / Passiv Ra' },
    ],
  },
  {
    label: 'Löhne',
    color: 'green',
    eintraege: [
      { fall: 'Arbeitnehmerbeiträge', satz: 'LohnA / Verb. Sozialvers.' },
      { fall: 'Arbeitgeberbeiträge', satz: 'Sozialvers.A / Verb. Sozialvers.' },
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
    eintraege: [
      { fall: 'Private Rechnung', satz: 'Privat / (Bank / Kasse / Post)' },
      { fall: 'Privatanteil Fahrzeug', satz: 'Privat / Fahrzeugaufwand' },
      { fall: 'Gutschrift Eigenlohn', satz: 'Lohnaufwand / Privat' },
      { fall: 'Gutschrift Eigenzins', satz: 'Finanzaufwand / Privat' },
      { fall: 'Gutschrift Reisespesen', satz: 'Übriger PersonalA / Privat' },
      { fall: 'Kapitalrückzug', satz: 'Eigenkapital / Bank' },
      { fall: 'Sacheinlage Fahrzeug', satz: 'Fahrzeug / Eigenkapital' },
      { fall: 'Übertrag Privatkonto', satz: 'Privat / Eigenkapital' },
      { fall: 'Verlustvortrag (1. Geschäftsjahr)', satz: 'Eigenkapital / Jahresverlust' },
    ],
  },
  {
    label: 'Aktiengesellschaft (AG)',
    color: 'purple',
    eintraege: [
      { fall: 'Kapitalverpflichtung', satz: 'Ford. Aktionäre / Aktienkapital' },
      { fall: 'Einbringung Kasse', satz: 'Kasse / Ford. Aktionäre' },
      { fall: 'Einbringung VLL', satz: 'Ford. Aktionäre / VLL' },
      { fall: 'Einzahlung Restbetrag', satz: 'Bank / Ford. Aktionäre' },
      { fall: 'Anfangsbestand Gewinnvortrag', satz: 'ER / Gewinnvortrag' },
      { fall: 'Übertrag Jahresgewinn', satz: 'ER / Jahresgewinn' },
      { fall: 'Verbuchung Jahresgewinn', satz: 'Jahresgewinn / Gewinnvortrag' },
      { fall: 'Zuweisung Ges. Gewinnreserve', satz: 'Gewinnvortrag / Ges. Gewinnreserve' },
      { fall: 'Zuweisung Dividenden', satz: 'Gewinnvortrag / Dividenden' },
      { fall: 'Abschluss Gewinnvortrag', satz: 'Gewinnvortrag / SB II' },
      { fall: 'Auszahlung Nettodividende (65%)', satz: 'Dividenden / Bank' },
      { fall: 'Abzug Verrechnungssteuer (35%)', satz: 'Dividenden / Verbindlichkeit VST' },
      { fall: 'Überweisung Verrechnungssteuer', satz: 'Verbindlichkeit VST / Bank' },
      { fall: 'Übertrag Jahresverlust', satz: 'Jahresverlust / ER' },
      { fall: 'Verbuchung Jahresverlust', satz: 'Verlustvortrag / Jahresverlust' },
      { fall: 'Verwendung Gewinnvortrag zum Verlustausgleich', satz: 'Gewinnvortrag / Verlustvortrag' },
      { fall: 'Auflösung Ges. Gewinnreserve', satz: 'Ges. Gewinnreserve / Verlustvortrag' },
      { fall: 'Abschluss Verlustvortrag', satz: 'SB II / Verlustvortrag' },
      { fall: 'Erhöhung Aktienkapital', satz: 'Bank / Aktienkapital' },
      { fall: 'Agio (Ausgabe über Nennwert)', satz: 'Bank / Gesetzliche Kapitalreserve' },
    ],
  },
  {
    label: 'Immobilien / Liegenschaften',
    color: 'emerald',
    eintraege: [
      { fall: 'Mietzinseinnahmen', satz: 'Bank / Liegenschaftsertrag' },
      { fall: 'Mietwert Geschäftsräume (eigene Liegenschaft)', satz: 'Raumaufwand / Liegenschaftsertrag' },
      { fall: 'Mietwert Privatwohnung', satz: 'Privat / Liegenschaftsertrag' },
      { fall: 'Rechnung für Malarbeiten an Liegenschaft', satz: 'Liegenschaftsaufwand / VLL' },
      { fall: 'Barzahlung für kleine Reparaturen', satz: 'Liegenschaftsaufwand / Kasse' },
      { fall: 'Bankbelastung Hypothekarzins', satz: 'Liegenschaftsaufwand / Bank' },
      { fall: 'Bankbelastung Abzahlung Hypothek', satz: 'Hypothek / Bank' },
      { fall: 'Rechnung Gebäudeversicherung', satz: 'Liegenschaftsaufwand / VLL' },
      { fall: 'Abschreibung der Liegenschaft', satz: 'Liegenschaftsaufwand / Immobilien' },
      { fall: 'Kaufpreis Liegenschaft (Käufer)', satz: 'Immobilien / VLL' },
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
    eintraege: [
      { fall: 'Kauf EUR 10\'150 zu Buchkurs 1.08', satz: 'Warenaufwand / VLL  (EUR 10\'150 × 1.08)' },
      { fall: 'Zahlung VLL zu Tageskurs 1.12 (höher als Buchkurs 1.08) – Kursverlust', satz: 'Warenaufwand / VLL  (EUR × Kursdifferenz)' },
      { fall: 'Zahlung VLL zu Tageskurs tiefer als Buchkurs – Kursgewinn', satz: 'VLL / Warenaufwand  (EUR × Kursdifferenz)' },
      { fall: 'Einkauf EUR, Buchkurs 1.15, Rabatt 10% – Rabattbuchung', satz: 'VLL / Warenaufwand  (EUR Rabatt × Buchkurs)' },
      { fall: 'Zahlung Rest per Bank zu Tageskurs 1.16 (Kursverlust)', satz: 'VLL + Warenaufwand / Bank' },
    ],
  },
  {
    label: 'Formeln Liegenschaften',
    color: 'yellow',
    eintraege: [
      { fall: 'Finanzierung (Formel)', satz: 'Kaufpreis − Hypothek = Eigene Mittel' },
      { fall: 'Liegenschaftserfolg (Formel)', satz: 'Mietzinseinnahmen − Hypothekarzinsen − Unterhaltskosten = Liegenschaftsgewinn' },
      { fall: 'Bruttorendite (Formel)', satz: '(Liegenschaftserfolg × 100) / Kaufpreis' },
      { fall: 'Nettorendite (Formel)', satz: '(Liegenschaftsgewinn × 100) / Eigene Mittel' },
      { fall: 'Ertragswert (Formel)', satz: '(Liegenschaftserfolg × 100) / Bruttorendite in %' },
    ],
  },
  {
    label: 'Unterbilanz & Überschuldung (AG)',
    color: 'rose',
    eintraege: [
      { fall: 'Unterbilanz OHNE gesetzliche Folgen', satz: 'Aktiven decken Fremdkapital + mindestens ½ EK (Aktienkapital + gesetzliche Reserven)' },
      { fall: 'Unterbilanz MIT gesetzlichen Folgen', satz: 'Aktiven decken Fremdkapital, aber weniger als ½ EK' },
      { fall: 'Überschuldung', satz: 'Aktiven < Fremdkapital → kein EK mehr, Bilanzverlust übersteigt gesamtes EK' },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string; flip: string }> = {
  blue:    { bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.25)',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    text: 'text-blue-300',    flip: 'bg-blue-500/20' },
  violet:  { bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.25)',   badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', text: 'text-violet-300', flip: 'bg-violet-500/20' },
  amber:   { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   text: 'text-amber-300',   flip: 'bg-amber-500/20' },
  red:     { bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.25)',    badge: 'bg-red-500/10 text-red-400 border-red-500/20',        text: 'text-red-300',     flip: 'bg-red-500/20' },
  slate:   { bg: 'rgba(100,116,139,0.08)',  border: 'rgba(100,116,139,0.25)',  badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',   text: 'text-slate-300',   flip: 'bg-slate-500/20' },
  orange:  { bg: 'rgba(249,115,22,0.08)',   border: 'rgba(249,115,22,0.25)',   badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', text: 'text-orange-300',  flip: 'bg-orange-500/20' },
  teal:    { bg: 'rgba(20,184,166,0.08)',   border: 'rgba(20,184,166,0.25)',   badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',      text: 'text-teal-300',    flip: 'bg-teal-500/20' },
  green:   { bg: 'rgba(34,197,94,0.08)',    border: 'rgba(34,197,94,0.25)',    badge: 'bg-green-500/10 text-green-400 border-green-500/20',   text: 'text-green-300',   flip: 'bg-green-500/20' },
  indigo:  { bg: 'rgba(99,102,241,0.08)',   border: 'rgba(99,102,241,0.25)',   badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', text: 'text-indigo-300',  flip: 'bg-indigo-500/20' },
  cyan:    { bg: 'rgba(6,182,212,0.08)',    border: 'rgba(6,182,212,0.25)',    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',      text: 'text-cyan-300',    flip: 'bg-cyan-500/20' },
  purple:  { bg: 'rgba(168,85,247,0.08)',   border: 'rgba(168,85,247,0.25)',   badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-purple-300',  flip: 'bg-purple-500/20' },
  emerald: { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.25)',   badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-300', flip: 'bg-emerald-500/20' },
  pink:    { bg: 'rgba(236,72,153,0.08)',   border: 'rgba(236,72,153,0.25)',   badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',      text: 'text-pink-300',    flip: 'bg-pink-500/20' },
  yellow:  { bg: 'rgba(234,179,8,0.08)',    border: 'rgba(234,179,8,0.25)',    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', text: 'text-yellow-300',  flip: 'bg-yellow-500/20' },
  rose:    { bg: 'rgba(244,63,94,0.08)',    border: 'rgba(244,63,94,0.25)',    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',      text: 'text-rose-300',    flip: 'bg-rose-500/20' },
}

function FlipCard({ fall, satz, color }: { fall: string; satz: string; color: string }) {
  const [flipped, setFlipped] = useState(false)
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue

  return (
    <button
      onClick={() => setFlipped(v => !v)}
      className="w-full text-left rounded-xl p-4 transition-all duration-200 border flex flex-col gap-2 min-h-[90px] group hover:scale-[1.01]"
      style={{ background: flipped ? c.flip : c.bg, borderColor: c.border }}
    >
      {!flipped ? (
        <>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Buchungsfall</span>
          <span className="text-sm font-medium text-slate-200 leading-snug">{fall}</span>
          <span className="text-[11px] text-slate-600 mt-auto">Tippen zum Aufdecken →</span>
        </>
      ) : (
        <>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Buchungssatz</span>
          <span className={`text-base font-bold font-mono leading-snug ${c.text}`}>{satz}</span>
          <span className="text-[11px] text-slate-600 mt-auto">← Tippen zum Zurückblättern</span>
        </>
      )}
    </button>
  )
}

function KategorieSection({ kat }: { kat: Kategorie }) {
  const [open, setOpen] = useState(true)
  const [allFlipped, setAllFlipped] = useState(false)
  const c = COLOR_MAP[kat.color] ?? COLOR_MAP.blue

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: c.border, background: 'rgba(0,0,0,0.2)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>
            {kat.eintraege.length} Einträge
          </span>
          <span className="font-semibold text-slate-200">{kat.label}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kat.eintraege.map((e, i) => (
              <FlipCard key={i} fall={e.fall} satz={e.satz} color={kat.color} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BuchungssaetzePage() {
  const [search, setSearch] = useState('')
  const [activeKat, setActiveKat] = useState<string | null>(null)

  const totalEintraege = KATEGORIEN.reduce((s, k) => s + k.eintraege.length, 0)

  const gefiltert = KATEGORIEN
    .filter(k => activeKat === null || k.label === activeKat)
    .map(k => ({
      ...k,
      eintraege: search.trim()
        ? k.eintraege.filter(e =>
            e.fall.toLowerCase().includes(search.toLowerCase()) ||
            e.satz.toLowerCase().includes(search.toLowerCase())
          )
        : k.eintraege,
    }))
    .filter(k => k.eintraege.length > 0)

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Buchungssätze</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {totalEintraege} Buchungssätze · Kontenrahmen KMU (HEP) · Tippe auf eine Karte zum Aufdecken
          </p>
        </div>
        <input
          type="text"
          placeholder="Suchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 text-sm text-slate-300 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Kategorie-Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveKat(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${activeKat === null ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.05]'}`}
        >
          Alle Kategorien
        </button>
        {KATEGORIEN.map(k => {
          const c = COLOR_MAP[k.color] ?? COLOR_MAP.blue
          const active = activeKat === k.label
          return (
            <button
              key={k.label}
              onClick={() => setActiveKat(active ? null : k.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? `${c.badge}` : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.05]'}`}
            >
              {k.label}
            </button>
          )
        })}
      </div>

      {/* Karten */}
      {gefiltert.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="font-medium text-slate-300">Keine Buchungssätze gefunden</p>
          <button onClick={() => { setSearch(''); setActiveKat(null) }} className="mt-3 text-blue-400 text-sm hover:underline">
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {gefiltert.map(k => (
            <KategorieSection key={k.label} kat={k} />
          ))}
        </div>
      )}

      {/* Legende */}
      <div className="glass rounded-2xl p-4 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400 mb-2">Abkürzungen (Kontenrahmen KMU, HEP)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
          {[
            ['FLL', 'Forderungen aus Lieferungen und Leistungen (= Debitoren)'],
            ['VLL', 'Verbindlichkeiten aus Lieferungen und Leistungen (= Kreditoren)'],
            ['WaA', 'Warenaufwand'],
            ['WaE', 'Warenertrag'],
            ['Mob', 'Mobile Sachanlagen'],
            ['WB Mob', 'Wertberichtigung Mobile Sachanlagen'],
            ['WB Ford.', 'Wertberichtigung Forderungen'],
            ['Verl. Ford.', 'Verluste aus Forderungen'],
            ['Ford. VST', 'Forderung Verrechnungssteuer'],
            ['Verb. MwSt.', 'Verbindlichkeit MWST (Umsatzsteuer)'],
            ['Vorst. 1170', 'Vorsteuer MWST Material, Waren, DL'],
            ['Vorst. 1177', 'Vorsteuer MWST Investitionen'],
            ['LohnA', 'Lohnaufwand'],
            ['Sozialvers.A', 'Sozialversicherungsaufwand'],
            ['Aktiv Ra', 'Aktive Rechnungsabgrenzung (TA)'],
            ['Passiv Ra', 'Passive Rechnungsabgrenzung (TP)'],
            ['a.o. A', 'Ausserordentlicher Aufwand'],
            ['a.o. E', 'Ausserordentlicher Ertrag'],
            ['Abs', 'Abschreibungen'],
            ['SB', 'Schlussbilanz'],
          ].map(([abbr, desc]) => (
            <div key={abbr} className="flex gap-1.5">
              <span className="font-mono font-semibold text-slate-300 shrink-0">{abbr}</span>
              <span className="text-slate-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
