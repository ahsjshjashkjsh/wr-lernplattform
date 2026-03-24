'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Shuffle, Zap, CheckCircle2, XCircle, Trophy, RotateCcw, Layers } from 'lucide-react'

type Eintrag  = { fall: string; satz: string }
type Kategorie = { label: string; color: string; icon: string; eintraege: Eintrag[] }

// ─── DATA ────────────────────────────────────────────────────────────────────
const KATEGORIEN: Kategorie[] = [
  { label: 'Warenkonten', color: 'blue', icon: '📦', eintraege: [
    { fall: 'Lagerzunahme', satz: 'Warenbestand / Warenaufwand' },
    { fall: 'Lagerabnahme', satz: 'Warenaufwand / Warenbestand' },
    { fall: 'Rechnung an Kunden inkl. MwSt. – Warenertrag', satz: 'FLL / WaE' },
    { fall: 'Rechnung an Kunden inkl. MwSt. – MwSt.', satz: 'FLL / Verb. MwSt.' },
    { fall: 'Rücksendung Kunde – Warenertrag', satz: 'Warenertrag / FLL' },
    { fall: 'Rücksendung Kunde – MwSt.-Korrektur', satz: 'Verbindlichk. MwSt / FLL' },
  ]},
  { label: 'MWST', color: 'violet', icon: '🧾', eintraege: [
    { fall: 'Rechnung Lieferant 8.1% – NICHT Investitionen (1. BS)', satz: 'WaA / VLL' },
    { fall: 'Rechnung Lieferant 8.1% – NICHT Investitionen (2. BS – Vorsteuer)', satz: 'Vorst. 1170 / VLL' },
    { fall: 'Rechnung Lieferant 8.1% – INVESTITIONEN (1. BS)', satz: 'WaA / VLL' },
    { fall: 'Rechnung Lieferant 8.1% – INVESTITIONEN (2. BS – Vorsteuer)', satz: 'Vorst. 1177 / VLL' },
    { fall: 'Verrechnung der MwSt.', satz: 'Verb. MwSt. / Vorst. 1170' },
    { fall: 'Banküberweisung der MwSt.', satz: 'Verb. MwSt. / Bank' },
  ]},
  { label: 'Verrechnungssteuer', color: 'amber', icon: '💰', eintraege: [
    { fall: 'Kapitalerträge VST – Bruttomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (100%)' },
    { fall: 'Kapitalerträge VST – Bruttomethode (2. BS – VST)', satz: 'Ford. VST / Bank  (35%)' },
    { fall: 'Kapitalerträge VST – Nettomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (65%)' },
    { fall: 'Kapitalerträge VST – Nettomethode (2. BS – VST)', satz: 'Ford. VST / Finanzertrag  (35%)' },
    { fall: '50 Aktien Nennwert CHF 200, Dividende 8% – Nettobetrag', satz: 'Bank / Finanzertrag  (800 × 65%)' },
    { fall: '50 Aktien Nennwert CHF 200, Dividende 8% – VST', satz: 'Ford. VST / Finanzertrag  (800 × 35%)' },
    { fall: 'Bankgutschrift Nettodividende CHF 1\'300 – VST rückrechnen', satz: 'Ford. VST / Finanzertrag  (1\'300 / 65 × 35)' },
  ]},
  { label: 'Delkredere / Verluste', color: 'red', icon: '⚠️', eintraege: [
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
  ]},
  { label: 'Abschreibungen', color: 'slate', icon: '📉', eintraege: [
    { fall: 'Abschreibung direkt', satz: 'Abs / Mob' },
    { fall: 'Abschreibung indirekt', satz: 'Abs / WB Mob' },
    { fall: 'Verkaufserlös – Verkauf AV direkte Methode', satz: 'Kasse / Mob' },
    { fall: 'Veräusserungsverlust – Verkauf AV direkte Methode', satz: 'a.o. A / Mob' },
    { fall: 'Veräusserungsgewinn – Verkauf AV direkte Methode', satz: '(Mob / a.o. E)' },
    { fall: 'Verkaufserlös – Verkauf AV indirekte Methode', satz: 'Kasse / Mob' },
    { fall: 'Auflösung WB – Verkauf AV indirekte Methode', satz: 'WB Mob / Mob' },
    { fall: 'Veräusserungsverlust – Verkauf AV indirekte Methode', satz: 'a.o. A / Mob' },
    { fall: 'Veräusserungsgewinn – Verkauf AV indirekte Methode', satz: '(Mob / a.o. E)' },
  ]},
  { label: 'Rückstellungen', color: 'orange', icon: '🔒', eintraege: [
    { fall: 'Bildung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess' },
    { fall: 'Abschluss Konto Rückstellung', satz: 'Rückstellung Prozess / SB' },
    { fall: 'Zahlung Anwaltskosten (Rückstellung)', satz: 'Rückstellung Prozess / Bank' },
    { fall: 'Anpassung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess' },
  ]},
  { label: 'Abgrenzungen', color: 'teal', icon: '⏳', eintraege: [
    { fall: 'Geldguthaben (vorausbezahlter Aufwand / noch nicht erhaltener Ertrag)', satz: 'Aktiv Ra / (Aufwand oder Ertrag)' },
    { fall: 'Leistungsguthaben (erbrachte Leistung noch nicht verrechnet)', satz: 'Aktiv Ra / (Aufwand oder Ertrag)' },
    { fall: 'Geldschuld (erhaltenes Geld für noch nicht erbrachte Leistung)', satz: '(Aufwand oder Ertrag) / Passiv Ra' },
    { fall: 'Leistungsschuld (Aufwand entstanden, noch nicht bezahlt)', satz: '(Aufwand oder Ertrag) / Passiv Ra' },
  ]},
  { label: 'Löhne', color: 'green', icon: '👷', eintraege: [
    { fall: 'Arbeitnehmerbeiträge (AN-Beiträge)', satz: 'LohnA / Verb. Sozialvers.' },
    { fall: 'Arbeitgeberbeiträge (AG-Beiträge)', satz: 'Sozialvers.A / Verb. Sozialvers.' },
    { fall: 'Nettolohn – Auszahlung per Bank', satz: 'LohnA / Bank' },
    { fall: 'Bruttolohn', satz: 'Kein Buchungssatz' },
    { fall: 'Lohnvorschuss aus Geschäftskasse', satz: 'LohnA / Kasse' },
    { fall: 'Spesenentschädigung per Banküberweisung', satz: 'Übr. PersonalA / Bank' },
    { fall: 'Weiterbildungsrechnung', satz: 'Übr. PersonalA / VLL' },
  ]},
  { label: 'Stille Reserven', color: 'indigo', icon: '🔮', eintraege: [
    { fall: 'Unterbewertung Warenvorrat – Bildung', satz: 'Warenaufwand / Warenvorrat' },
    { fall: 'Unterbewertung Anlagevermögen – Bildung', satz: 'Abschreibung / Anlagevermögen' },
    { fall: 'Überbewertung Rückstellungen – Bildung', satz: 'Sonst. BA / Rückstellungen' },
    { fall: 'Auflösung stille Reserven – Warenvorrat', satz: 'Warenvorrat / Warenaufwand' },
    { fall: 'Auflösung stille Reserven – Anlagevermögen', satz: 'Anlagevermögen / Abschreibung' },
    { fall: 'Auflösung stille Reserven – Rückstellungen', satz: 'Rückstellung / Sonst. BA' },
  ]},
  { label: 'Einzelunternehmen', color: 'cyan', icon: '🧑‍💼', eintraege: [
    { fall: 'Private Rechnung', satz: 'Privat / (Bank / Kasse / Post)' },
    { fall: 'Privatanteil Fahrzeug', satz: 'Privat / Fahrzeugaufwand' },
    { fall: 'Gutschrift Eigenlohn', satz: 'Lohnaufwand / Privat' },
    { fall: 'Gutschrift Eigenzins', satz: 'Finanzaufwand / Privat' },
    { fall: 'Gutschrift Reisespesen', satz: 'Übriger PersonalA / Privat' },
    { fall: 'Kapitalrückzug', satz: 'Eigenkapital / Bank' },
    { fall: 'Sacheinlage Fahrzeug', satz: 'Fahrzeug / Eigenkapital' },
    { fall: 'Übertrag Privatkonto (Jahresabschluss)', satz: 'Privat / Eigenkapital' },
    { fall: 'Verlustvortrag (1. Geschäftsjahr)', satz: 'Eigenkapital / Jahresverlust' },
  ]},
  { label: 'Aktiengesellschaft (AG)', color: 'purple', icon: '🏢', eintraege: [
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
  ]},
  { label: 'Immobilien / Liegenschaften', color: 'emerald', icon: '🏠', eintraege: [
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
  ]},
  { label: 'Fremde Währungen', color: 'pink', icon: '💱', eintraege: [
    { fall: 'Kauf EUR 10\'150 zu Buchkurs 1.08', satz: 'Warenaufwand / VLL  (EUR 10\'150 × 1.08 = CHF 10\'962)' },
    { fall: 'Zahlung VLL – Kursverlust (Tageskurs > Buchkurs)', satz: 'VLL / Post  +  Warenaufwand / VLL  (Differenz)' },
    { fall: 'Zahlung VLL – Kursgewinn (Tageskurs < Buchkurs)', satz: 'VLL / Bank  +  VLL / Warenaufwand  (Differenz)' },
    { fall: 'Rabatt auf Einkauf in Fremdwährung zum Buchkurs', satz: 'VLL / Warenaufwand  (EUR Rabatt × Buchkurs)' },
    { fall: 'Zinszahlung Hypothek CHF 350\'000 zu 2% – letztes Vierteljahr', satz: 'LgA / Bank  (350\'000 × 2% × 3/12 = CHF 1\'750)' },
    { fall: 'Teilrückzahlung Hypothek CHF 50\'000', satz: 'Hypotheken / Bank  (CHF 50\'000)' },
  ]},
  { label: 'Formeln Liegenschaften', color: 'yellow', icon: '📐', eintraege: [
    { fall: 'Finanzierung', satz: 'Kaufpreis − Hypothek = Eigene Mittel' },
    { fall: 'Liegenschaftserfolg', satz: 'Mietzinseinnahmen − Hypothekarzinsen − Unterhaltskosten = Liegenschaftsgewinn' },
    { fall: 'Bruttorendite', satz: '(Liegenschaftserfolg × 100) / Kaufpreis' },
    { fall: 'Nettorendite', satz: '(Liegenschaftsgewinn × 100) / Eigene Mittel' },
    { fall: 'Ertragswert', satz: '(Liegenschaftserfolg × 100) / Bruttorendite in %' },
  ]},
  { label: 'Unterbilanz & Überschuldung', color: 'rose', icon: '🚨', eintraege: [
    { fall: 'Unterbilanz OHNE gesetzliche Folgen', satz: 'Aktiven decken FK + mindestens ½ EK (Aktienkapital + ges. Reserven)' },
    { fall: 'Unterbilanz MIT gesetzlichen Folgen', satz: 'Aktiven decken FK, aber weniger als ½ EK' },
    { fall: 'Überschuldung', satz: 'Aktiven < FK → kein EK mehr, Bilanzverlust übersteigt gesamtes EK' },
  ]},
]

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C: Record<string, { a: string; b: string; border: string; text: string; soft: string; glow: string }> = {
  blue:    { a: '#1d4ed8', b: '#1e3a8a', border: 'rgba(59,130,246,0.5)',   text: '#93c5fd', soft: 'rgba(59,130,246,0.12)',   glow: '59,130,246' },
  violet:  { a: '#7c3aed', b: '#4c1d95', border: 'rgba(139,92,246,0.5)',   text: '#c4b5fd', soft: 'rgba(139,92,246,0.12)',   glow: '139,92,246' },
  amber:   { a: '#d97706', b: '#78350f', border: 'rgba(245,158,11,0.5)',   text: '#fcd34d', soft: 'rgba(245,158,11,0.12)',   glow: '245,158,11' },
  red:     { a: '#dc2626', b: '#7f1d1d', border: 'rgba(239,68,68,0.5)',    text: '#fca5a5', soft: 'rgba(239,68,68,0.12)',    glow: '239,68,68' },
  slate:   { a: '#475569', b: '#1e293b', border: 'rgba(100,116,139,0.5)',  text: '#cbd5e1', soft: 'rgba(100,116,139,0.12)',  glow: '100,116,139' },
  orange:  { a: '#ea580c', b: '#7c2d12', border: 'rgba(249,115,22,0.5)',   text: '#fdba74', soft: 'rgba(249,115,22,0.12)',   glow: '249,115,22' },
  teal:    { a: '#0d9488', b: '#134e4a', border: 'rgba(20,184,166,0.5)',   text: '#5eead4', soft: 'rgba(20,184,166,0.12)',   glow: '20,184,166' },
  green:   { a: '#16a34a', b: '#14532d', border: 'rgba(34,197,94,0.5)',    text: '#86efac', soft: 'rgba(34,197,94,0.12)',    glow: '34,197,94' },
  indigo:  { a: '#4f46e5', b: '#312e81', border: 'rgba(99,102,241,0.5)',   text: '#a5b4fc', soft: 'rgba(99,102,241,0.12)',   glow: '99,102,241' },
  cyan:    { a: '#0891b2', b: '#164e63', border: 'rgba(6,182,212,0.5)',    text: '#67e8f9', soft: 'rgba(6,182,212,0.12)',    glow: '6,182,212' },
  purple:  { a: '#9333ea', b: '#581c87', border: 'rgba(168,85,247,0.5)',   text: '#d8b4fe', soft: 'rgba(168,85,247,0.12)',   glow: '168,85,247' },
  emerald: { a: '#059669', b: '#064e3b', border: 'rgba(16,185,129,0.5)',   text: '#6ee7b7', soft: 'rgba(16,185,129,0.12)',   glow: '16,185,129' },
  pink:    { a: '#db2777', b: '#831843', border: 'rgba(236,72,153,0.5)',   text: '#f9a8d4', soft: 'rgba(236,72,153,0.12)',   glow: '236,72,153' },
  yellow:  { a: '#ca8a04', b: '#713f12', border: 'rgba(234,179,8,0.5)',    text: '#fde047', soft: 'rgba(234,179,8,0.12)',    glow: '234,179,8' },
  rose:    { a: '#e11d48', b: '#881337', border: 'rgba(244,63,94,0.5)',    text: '#fda4af', soft: 'rgba(244,63,94,0.12)',    glow: '244,63,94' },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── STUDY MODE ───────────────────────────────────────────────────────────────
function StudyMode({ kat, onBack }: { kat: Kategorie; onBack: () => void }) {
  const c = C[kat.color] ?? C.blue
  const [cards, setCards]   = useState<Eintrag[]>(() => shuffle(kat.eintraege))
  const [index, setIndex]   = useState(0)
  const [flipped, setFlip]  = useState(false)
  const [done, setDone]     = useState(false)
  const [leaving, setLeave] = useState(false)

  const current = cards[index]

  const goNext = useCallback(() => {
    if (leaving) return
    setLeave(true)
    setTimeout(() => {
      setLeave(false)
      setFlip(false)
      if (index + 1 >= cards.length) setDone(true)
      else setIndex(i => i + 1)
    }, 220)
  }, [index, cards.length, leaving])

  const goPrev = useCallback(() => {
    if (index === 0 || leaving) return
    setLeave(true)
    setTimeout(() => { setLeave(false); setFlip(false); setIndex(i => i - 1) }, 220)
  }, [index, leaving])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlip(v => !v) }
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  function restart() { setCards(shuffle(kat.eintraege)); setIndex(0); setFlip(false); setDone(false) }

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 fade-in">
      <div className="relative">
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
          style={{ background: `linear-gradient(135deg,${c.a},${c.b})`, boxShadow: `0 0 60px rgba(${c.glow},0.5)`, border: `2px solid ${c.border}` }}>
          🎉
        </div>
        <div className="absolute -inset-3 rounded-full animate-ping opacity-20"
          style={{ background: `rgba(${c.glow},0.3)`, animationDuration: '2s' }} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white">Alle {cards.length} Karten!</h2>
        <p style={{ color: c.text }}>{kat.icon} {kat.label}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={restart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(135deg,${c.a},${c.b})`, boxShadow: `0 8px 24px rgba(${c.glow},0.4)`, color: '#fff' }}>
          <Shuffle size={15}/> Nochmal
        </button>
        <button onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 bg-white/[0.06] border border-white/10 text-slate-300">
          <ArrowLeft size={15}/> Zurück
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.06] text-slate-500 hover:text-slate-300">
          <ArrowLeft size={13}/> Themen
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{kat.icon}</span>
          <span className="text-xs font-semibold" style={{ color: c.text }}>{kat.label}</span>
        </div>
        <button onClick={restart} className="text-slate-600 hover:text-slate-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
          <Shuffle size={14}/>
        </button>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>{index + 1} / {cards.length}</span>
          <span>{Math.round((index / cards.length) * 100)}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(index / cards.length) * 100}%`, background: `linear-gradient(90deg,${c.a},${c.text})` }}/>
        </div>
      </div>

      {/* Card */}
      <div className="flex justify-center" style={{ perspective: '1400px' }}>
        <div
          onClick={() => setFlip(v => !v)}
          className="w-full cursor-pointer select-none"
          style={{ maxWidth: 560, height: 280, transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.23,1,0.32,1)',
            transform: leaving ? 'translateX(60px) opacity(0)' : flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-5 p-8"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              background: `linear-gradient(135deg, rgba(${c.glow},0.15) 0%, rgba(15,23,42,0.95) 100%)`,
              border: `1px solid ${c.border}`,
              boxShadow: `0 24px 80px -12px rgba(${c.glow},0.35), inset 0 1px 0 rgba(255,255,255,0.08)` }}>
            <div className="absolute top-5 left-6 text-[10px] uppercase tracking-widest font-bold text-slate-600">Buchungsfall</div>
            <p className="text-center text-lg sm:text-xl font-semibold text-white leading-snug">{current.fall}</p>
            <div className="absolute bottom-5 flex items-center gap-4 text-[10px] text-slate-700">
              <span>↵ Aufdecken</span><span>→ Weiter</span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-5 p-8"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
              background: `linear-gradient(135deg, ${c.b} 0%, rgba(15,23,42,0.98) 100%)`,
              border: `1px solid ${c.border}`,
              boxShadow: `0 24px 80px -12px rgba(${c.glow},0.5), inset 0 1px 0 rgba(255,255,255,0.1)` }}>
            <div className="absolute top-5 left-6 text-[10px] uppercase tracking-widest font-bold text-slate-600">Buchungssatz</div>
            <p className="text-center font-mono font-black leading-relaxed tracking-wide"
              style={{ color: c.text, fontSize: 'clamp(1rem, 4vw, 1.6rem)', textShadow: `0 0 30px rgba(${c.glow},0.6)` }}>
              {current.satz}
            </p>
            <div className="absolute bottom-5 flex items-center gap-4 text-[10px] text-slate-700">
              <span>↵ Zurück</span><span>→ Nächste</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={goPrev} disabled={index === 0}
          className="w-11 h-11 rounded-2xl flex items-center justify-center border transition-all hover:scale-110 active:scale-95 disabled:opacity-25 bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/20">
          <ArrowLeft size={16}/>
        </button>

        <button onClick={() => setFlip(v => !v)}
          className="px-10 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: flipped ? `linear-gradient(135deg,${c.a},${c.b})` : `rgba(${c.glow},0.12)`,
            border: `1px solid ${c.border}`, color: c.text,
            boxShadow: flipped ? `0 8px 24px rgba(${c.glow},0.35)` : 'none' }}>
          {flipped ? '← Zurück' : 'Aufdecken'}
        </button>

        <button onClick={goNext}
          className="w-11 h-11 rounded-2xl flex items-center justify-center border transition-all hover:scale-110 active:scale-95 bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/20">
          <ArrowRight size={16}/>
        </button>
      </div>

      {/* Dot track */}
      <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto">
        {cards.map((_, i) => (
          <button key={i} onClick={() => { setFlip(false); setIndex(i) }}
            className="rounded-full transition-all"
            style={{ width: i === index ? 20 : 6, height: 6,
              background: i < index ? c.text : i === index ? c.a : 'rgba(255,255,255,0.1)' }}/>
        ))}
      </div>
    </div>
  )
}

// ─── QUIZ GENERATOR ───────────────────────────────────────────────────────────
type QuizFrage = { fall: string; richtig: string; optionen: string[]; katColor: string }

function genQuiz(pool: Eintrag[], alleAntworten: string[], anzahl: number, katColor: string): QuizFrage[] {
  return shuffle(pool).slice(0, anzahl).map(e => ({
    fall: e.fall, richtig: e.satz, katColor,
    optionen: shuffle([e.satz, ...shuffle(alleAntworten.filter(s => s !== e.satz)).slice(0, 3)]),
  }))
}

function QuizGenerator({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'result'>('setup')
  const [selectedKats, setSelectedKats] = useState<Set<string>>(new Set(KATEGORIEN.map(k => k.label)))
  const [anzahl, setAnzahl] = useState(10)
  const [fragen, setFragen] = useState<QuizFrage[]>([])
  const [index, setIndex] = useState(0)
  const [gewählt, setGewählt] = useState<string | null>(null)
  const [richtig, setRichtig] = useState(0)
  const [falsch, setFalsch] = useState<QuizFrage[]>([])

  function toggleKat(l: string) {
    setSelectedKats(p => { const n = new Set(p); n.has(l) ? (n.size > 1 && n.delete(l)) : n.add(l); return n })
  }

  function starten() {
    const kats = KATEGORIEN.filter(k => selectedKats.has(k.label))
    const pool = kats.flatMap(k => k.eintraege)
    const alleAntworten = KATEGORIEN.flatMap(k => k.eintraege).map(e => e.satz)
    const q = kats.flatMap(k => genQuiz(k.eintraege, alleAntworten, Math.ceil(Math.min(anzahl, pool.length) / kats.length), k.color))
    setFragen(shuffle(q).slice(0, anzahl)); setIndex(0); setGewählt(null); setRichtig(0); setFalsch([])
    setPhase('quiz')
  }

  function antworten(opt: string) {
    if (gewählt) return
    setGewählt(opt)
    if (opt === fragen[index].richtig) setRichtig(r => r + 1)
    else setFalsch(f => [...f, fragen[index]])
  }

  function weiter() {
    if (index + 1 >= fragen.length) { setPhase('result'); return }
    setIndex(i => i + 1); setGewählt(null)
  }

  const score = fragen.length > 0 ? Math.round((richtig / fragen.length) * 100) : 0

  if (phase === 'setup') return (
    <div className="space-y-5 max-w-2xl mx-auto fade-in">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all hover:scale-105">
          <ArrowLeft size={15}/>
        </button>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Zap size={16} className="text-amber-400"/> Quiz-Generator</h2>
          <p className="text-xs text-slate-500">Wähle Themen & Anzahl — Karten werden gemischt</p>
        </div>
      </div>

      {/* Kategorie-Auswahl */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200">Kategorien</span>
          <button onClick={() => setSelectedKats(new Set(KATEGORIEN.map(k => k.label)))}
            className="text-xs font-medium px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
            Alle
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KATEGORIEN.map(k => {
            const c = C[k.color] ?? C.blue
            const on = selectedKats.has(k.label)
            return (
              <button key={k.label} onClick={() => toggleKat(k.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border text-left group"
                style={{ background: on ? c.soft : 'transparent', borderColor: on ? c.border : 'rgba(255,255,255,0.06)', color: on ? c.text : '#475569' }}>
                <span className="text-base leading-none">{k.icon}</span>
                <span className="truncate leading-tight">{k.label}</span>
                {on && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.text }}/>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Anzahl */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-sm font-semibold text-slate-200">Anzahl Fragen</span>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 15, 20, 30].map(n => (
            <button key={n} onClick={() => setAnzahl(n)}
              className="w-14 h-14 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 border"
              style={{ background: anzahl === n ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.04)',
                borderColor: anzahl === n ? 'transparent' : 'rgba(255,255,255,0.08)',
                color: anzahl === n ? '#fff' : '#64748b',
                boxShadow: anzahl === n ? '0 8px 20px rgba(99,102,241,0.4)' : 'none' }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button onClick={starten}
        className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.99]"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', boxShadow: '0 12px 40px rgba(239,68,68,0.35)', color: '#fff' }}>
        <Zap size={18}/> Quiz starten
      </button>
    </div>
  )

  if (phase === 'result') {
    const emoji = score >= 90 ? '🏆' : score >= 70 ? '🎉' : score >= 50 ? '💪' : '📚'
    const scoreColor = score >= 70 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171'
    return (
      <div className="flex flex-col items-center gap-8 min-h-[70vh] justify-center max-w-xl mx-auto fade-in">
        <div className="text-7xl">{emoji}</div>
        <div className="text-center space-y-2">
          <div className="text-6xl font-black" style={{ color: scoreColor }}>{score}%</div>
          <p className="text-slate-400">{richtig} von {fragen.length} richtig</p>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColor}88)` }}/>
        </div>

        {falsch.length > 0 && (
          <div className="w-full rounded-2xl p-5 space-y-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-bold text-red-400 flex items-center gap-2"><XCircle size={15}/> Falsch beantwortet</p>
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {falsch.map((f, i) => {
                const c = C[f.katColor] ?? C.blue
                return (
                  <div key={i} className="text-xs space-y-1 pb-2.5 border-b border-white/[0.05] last:border-0 last:pb-0">
                    <p className="text-slate-500">{f.fall}</p>
                    <p className="font-mono font-bold" style={{ color: c.text }}>{f.richtig}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button onClick={starten}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}>
            <Zap size={14}/> Nochmal
          </button>
          <button onClick={() => setPhase('setup')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] text-slate-300 transition-all hover:scale-105">
            Einstellungen
          </button>
          <button onClick={onBack}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] text-slate-400 transition-all hover:scale-105">
            <ArrowLeft size={14}/>
          </button>
        </div>
      </div>
    )
  }

  const frage = fragen[index]
  const c = C[frage.katColor] ?? C.blue
  const isCorrect = gewählt === frage.richtig

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto fade-in">
      {/* HUD */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-500 hover:text-slate-300 transition-all">
          <ArrowLeft size={13}/>
        </button>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(index / fragen.length) * 100}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }}/>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">{index + 1}/{fragen.length}</span>
          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{richtig} ✓</span>
        </div>
      </div>

      {/* Frage */}
      <div className="rounded-2xl p-7 text-center min-h-[110px] flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, rgba(${c.glow},0.08), rgba(15,23,42,0.95))`, border: `1px solid ${c.border}` }}>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-600">Buchungsfall</p>
          <p className="text-base sm:text-lg font-semibold text-white leading-snug">{frage.fall}</p>
        </div>
      </div>

      {/* Optionen */}
      <div className="grid grid-cols-1 gap-2.5">
        {frage.optionen.map((opt, i) => {
          const letter = ['A', 'B', 'C', 'D'][i]
          let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)', color = '#94a3b8'
          if (gewählt) {
            if (opt === frage.richtig)   { bg = 'rgba(34,197,94,0.12)';  border = 'rgba(34,197,94,0.5)';  color = '#86efac' }
            else if (opt === gewählt)    { bg = 'rgba(239,68,68,0.12)';  border = 'rgba(239,68,68,0.5)';  color = '#fca5a5' }
          }
          return (
            <button key={i} onClick={() => antworten(opt)} disabled={!!gewählt}
              className="w-full text-left px-4 py-4 rounded-2xl border text-sm font-mono font-medium transition-all disabled:cursor-default hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: bg, borderColor: border, color }}>
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-lg text-[11px] font-bold mr-3 font-sans shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>{letter}</span>
              {opt}
            </button>
          )
        })}
      </div>

      {gewählt && (
        <div className="space-y-2.5 fade-in">
          <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold ${isCorrect ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/25' : 'text-red-300 bg-red-500/10 border border-red-500/25'}`}>
            {isCorrect ? <CheckCircle2 size={17} className="shrink-0 mt-0.5"/> : <XCircle size={17} className="shrink-0 mt-0.5"/>}
            <span>{isCorrect ? 'Richtig!' : <><span className="text-slate-400 font-normal">Richtig wäre: </span>{frage.richtig}</>}</span>
          </div>
          <button onClick={weiter}
            className="w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', color: '#fff' }}>
            {index + 1 >= fragen.length ? <><Trophy size={15}/> Ergebnis</> : <>Weiter <ArrowRight size={15}/></>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
type View = { type: 'home' } | { type: 'study'; kat: Kategorie } | { type: 'quiz' }

export default function BuchungssaetzePage() {
  const [view, setView] = useState<View>({ type: 'home' })
  const total = KATEGORIEN.reduce((s, k) => s + k.eintraege.length, 0)

  if (view.type === 'study') return <StudyMode kat={view.kat} onBack={() => setView({ type: 'home' })}/>
  if (view.type === 'quiz')  return <QuizGenerator onBack={() => setView({ type: 'home' })}/>

  return (
    <div className="space-y-8 fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
        style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.15) 0%,rgba(99,102,241,0.1) 50%,rgba(168,85,247,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }}/>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-blue-400"/>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Kontenrahmen KMU · HEP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Buchungssätze</h1>
            <p className="text-slate-400 text-sm">{KATEGORIEN.length} Themen · <span className="text-slate-300 font-semibold">{total} Karten</span> · Lerne mit Flip-Karten oder teste dich im Quiz</p>
          </div>
          <button onClick={() => setView({ type: 'quiz' })}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', boxShadow: '0 12px 32px rgba(239,68,68,0.35)', color: '#fff' }}>
            <Zap size={16}/> Quiz starten
          </button>
        </div>
      </div>

      {/* Grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">Thema wählen</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KATEGORIEN.map(kat => {
            const c = C[kat.color] ?? C.blue
            return (
              <button key={kat.label} onClick={() => setView({ type: 'study', kat })}
                className="group relative text-left rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden"
                style={{ background: `rgba(${c.glow},0.07)`, border: `1px solid rgba(${c.glow},0.2)` }}>
                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left,rgba(${c.glow},0.15) 0%,transparent 60%)` }}/>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{kat.icon}</span>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                      style={{ background: c.soft, color: c.text, border: `1px solid rgba(${c.glow},0.25)` }}>
                      {kat.eintraege.length}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-200 mb-1 text-sm">{kat.label}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-1 leading-relaxed">{kat.eintraege[0].fall}</p>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold transition-all duration-200 group-hover:translate-x-1"
                    style={{ color: c.text }}>
                    Lernen →
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
