'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Shuffle, Zap, CheckCircle2, XCircle, Trophy, Layers } from 'lucide-react'

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
    { fall: 'Liberierung (Einzahlung)', satz: 'Bank / Ford. Aktionäre' },
    { fall: 'Dividende beschlossen', satz: 'Jahresgewinn / Verb. Dividende' },
    { fall: 'Dividende ausbezahlt', satz: 'Verb. Dividende / Bank' },
    { fall: 'Gesetzliche Reserven bilden', satz: 'Jahresgewinn / Gesetzliche Reserven' },
    { fall: 'Kapitalerhöhung – neue Aktien', satz: 'Bank / Aktienkapital' },
    { fall: 'Jahresgewinn abschliessen', satz: 'Erfolgsrechnung / Jahresgewinn' },
    { fall: 'Jahresverlust abschliessen', satz: 'Jahresverlust / Erfolgsrechnung' },
  ]},
  { label: 'Immobilien / Liegenschaften', color: 'emerald', icon: '🏠', eintraege: [
    { fall: 'Kauf Liegenschaft (Bankfinanzierung)', satz: 'Liegenschaften / Bank' },
    { fall: 'Hypothekarkredit aufnehmen', satz: 'Bank / Hypothek' },
    { fall: 'Hypothekarzinsen bezahlen', satz: 'Hypoth.Zinsen / Bank' },
    { fall: 'Mieteinnahmen erhalten', satz: 'Bank / Mietzinsertrag' },
    { fall: 'Unterhaltskosten Liegenschaft', satz: 'Liegenschaftsaufwand / Bank' },
    { fall: 'Abschreibung Liegenschaft (direkt)', satz: 'Abs Liegenschaften / Liegenschaften' },
  ]},
  { label: 'Fremde Währungen', color: 'pink', icon: '💱', eintraege: [
    { fall: 'Kursgewinn realisiert (Forderung in Fremdwährung)', satz: 'Bank / Kursgewinn' },
    { fall: 'Kursverlust realisiert (Forderung in Fremdwährung)', satz: 'Kursverlust / Bank' },
    { fall: 'Kursgewinn realisiert (Verbindlichkeit in Fremdwährung)', satz: 'Verb. Fremdwährung / Kursgewinn' },
    { fall: 'Kursverlust realisiert (Verbindlichkeit in Fremdwährung)', satz: 'Kursverlust / Verb. Fremdwährung' },
    { fall: 'Bewertung Jahresende – Kursgewinn (nicht realisiert)', satz: 'FLL / Kursgewinn (passivieren)' },
    { fall: 'Bewertung Jahresende – Kursverlust (nicht realisiert)', satz: 'Kursverlust / FLL (aktivieren)' },
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

// ─── COLORS — refined, muted, professional ────────────────────────────────────
const C: Record<string, { accent: string; text: string; soft: string; border: string }> = {
  blue:    { accent: '#3b82f6', text: '#93c5fd', soft: 'rgba(59,130,246,0.07)',   border: 'rgba(59,130,246,0.3)' },
  violet:  { accent: '#8b5cf6', text: '#c4b5fd', soft: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.3)' },
  amber:   { accent: '#f59e0b', text: '#fcd34d', soft: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.3)' },
  red:     { accent: '#ef4444', text: '#fca5a5', soft: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.3)' },
  slate:   { accent: '#94a3b8', text: '#cbd5e1', soft: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.3)' },
  orange:  { accent: '#f97316', text: '#fdba74', soft: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.3)' },
  teal:    { accent: '#14b8a6', text: '#5eead4', soft: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.3)' },
  green:   { accent: '#22c55e', text: '#86efac', soft: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.3)' },
  indigo:  { accent: '#6366f1', text: '#a5b4fc', soft: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.3)' },
  cyan:    { accent: '#06b6d4', text: '#67e8f9', soft: 'rgba(6,182,212,0.07)',   border: 'rgba(6,182,212,0.3)' },
  purple:  { accent: '#a855f7', text: '#d8b4fe', soft: 'rgba(168,85,247,0.07)',  border: 'rgba(168,85,247,0.3)' },
  emerald: { accent: '#10b981', text: '#6ee7b7', soft: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.3)' },
  pink:    { accent: '#ec4899', text: '#f9a8d4', soft: 'rgba(236,72,153,0.07)',  border: 'rgba(236,72,153,0.3)' },
  yellow:  { accent: '#eab308', text: '#fde047', soft: 'rgba(234,179,8,0.07)',   border: 'rgba(234,179,8,0.3)' },
  rose:    { accent: '#f43f5e', text: '#fda4af', soft: 'rgba(244,63,94,0.07)',   border: 'rgba(244,63,94,0.3)' },
}

// Shared card surface colors
const CARD_BG   = '#0c1526'
const CARD_SURFACE = 'rgba(255,255,255,0.03)'
const CARD_BORDER  = 'rgba(255,255,255,0.07)'

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
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
        style={{ background: CARD_SURFACE, border: `2px solid ${c.accent}` }}
      >
        🎉
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white">Alle {cards.length} Karten gelernt</h2>
        <p className="text-sm" style={{ color: c.text }}>{kat.label}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={restart}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: c.accent, color: '#09090e' }}>
          <Shuffle size={14}/> Nochmal
        </button>
        <button onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80 active:scale-95"
          style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#94a3b8' }}>
          <ArrowLeft size={14}/> Zurück
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ color: '#64748b' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}
        >
          <ArrowLeft size={13}/> Themen
        </button>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: c.text, background: c.soft, border: `1px solid ${c.border}` }}
          >
            {kat.label}
          </span>
        </div>
        <button onClick={restart} style={{ color: '#475569' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#475569'}
          className="p-1.5 rounded-lg transition-colors">
          <Shuffle size={14}/>
        </button>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]" style={{ color: '#3d4d66' }}>
          <span>{index + 1} / {cards.length}</span>
          <span>{Math.round((index / cards.length) * 100)}%</span>
        </div>
        <div className="w-full h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full transition-all duration-500"
            style={{ width: `${(index / cards.length) * 100}%`, background: c.accent }}/>
        </div>
      </div>

      {/* Card */}
      <div className="flex justify-center" style={{ perspective: '1400px' }}>
        <div
          onClick={() => setFlip(v => !v)}
          className="w-full cursor-pointer select-none"
          style={{
            maxWidth: 560,
            height: 280,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1)',
            transform: leaving ? 'translateX(40px)' : flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-4 p-8"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderTop: `3px solid ${c.accent}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
            <div className="absolute top-5 left-6 text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#3d4d66' }}>
              Buchungsfall
            </div>
            <p className="text-center text-lg sm:text-xl font-semibold leading-snug" style={{ color: '#e4e4ed' }}>
              {current.fall}
            </p>
            <div className="absolute bottom-5 flex items-center gap-4 text-[10px]" style={{ color: '#3d4d66' }}>
              <span>Leertaste — Aufdecken</span>
              <span>→ Weiter</span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-4 p-8"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: CARD_BG,
              border: `1px solid ${c.border}`,
              borderTop: `3px solid ${c.accent}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
            <div className="absolute top-5 left-6 text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#3d4d66' }}>
              Buchungssatz
            </div>
            <p className="text-center font-mono font-black leading-relaxed tracking-wide"
              style={{ color: c.text, fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}>
              {current.satz}
            </p>
            <div className="absolute bottom-5 flex items-center gap-4 text-[10px]" style={{ color: '#3d4d66' }}>
              <span>Leertaste — Zurück</span>
              <span>→ Nächste</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={goPrev} disabled={index === 0}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-20"
          style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#64748b' }}>
          <ArrowLeft size={15}/>
        </button>

        <button onClick={() => setFlip(v => !v)}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: flipped ? c.accent : CARD_SURFACE,
            border: `1px solid ${flipped ? c.accent : CARD_BORDER}`,
            color: flipped ? '#09090e' : c.text,
          }}>
          {flipped ? 'Zurückdrehen' : 'Aufdecken'}
        </button>

        <button onClick={goNext}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#64748b' }}>
          <ArrowRight size={15}/>
        </button>
      </div>

      {/* Dot track */}
      <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto">
        {cards.map((_, i) => (
          <button key={i} onClick={() => { setFlip(false); setIndex(i) }}
            className="rounded-full transition-all"
            style={{
              width: i === index ? 18 : 5,
              height: 5,
              background: i < index ? c.accent : i === index ? c.accent : 'rgba(255,255,255,0.1)',
              opacity: i < index ? 0.4 : 1,
            }}/>
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
    <div className="space-y-4 max-w-2xl mx-auto fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#64748b' }}>
          <ArrowLeft size={14}/>
        </button>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={15} style={{ color: '#f59e0b' }}/> Quiz-Generator
          </h2>
          <p className="text-xs" style={{ color: '#3d4d66' }}>Wähle Themen & Anzahl — Karten werden gemischt</p>
        </div>
      </div>

      {/* Kategorie-Auswahl */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#e4e4ed' }}>Kategorien</span>
          <button onClick={() => setSelectedKats(new Set(KATEGORIEN.map(k => k.label)))}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
            style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            Alle
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KATEGORIEN.map(k => {
            const c = C[k.color] ?? C.blue
            const on = selectedKats.has(k.label)
            return (
              <button key={k.label} onClick={() => toggleKat(k.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border text-left"
                style={{
                  background: on ? c.soft : 'transparent',
                  borderColor: on ? c.border : 'rgba(255,255,255,0.05)',
                  color: on ? c.text : '#3d4d66',
                }}>
                <span className="text-sm leading-none">{k.icon}</span>
                <span className="truncate leading-tight">{k.label}</span>
                {on && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.accent }}/>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Anzahl */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
        <span className="text-sm font-semibold" style={{ color: '#e4e4ed' }}>Anzahl Fragen</span>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 15, 20, 30].map(n => (
            <button key={n} onClick={() => setAnzahl(n)}
              className="w-14 h-12 rounded-xl text-sm font-black transition-all border"
              style={{
                background: anzahl === n ? '#3b82f6' : 'transparent',
                borderColor: anzahl === n ? '#3b82f6' : 'rgba(255,255,255,0.07)',
                color: anzahl === n ? '#fff' : '#3d4d66',
              }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button onClick={starten}
        className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-[0.99]"
        style={{ background: '#f59e0b', color: '#09090e' }}>
        <Zap size={17}/> Quiz starten
      </button>
    </div>
  )

  if (phase === 'result') {
    const emoji = score >= 90 ? '🏆' : score >= 70 ? '🎉' : score >= 50 ? '💪' : '📚'
    const scoreColor = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
      <div className="flex flex-col items-center gap-7 min-h-[70vh] justify-center max-w-xl mx-auto fade-in">
        <div className="text-6xl">{emoji}</div>
        <div className="text-center">
          <div className="text-5xl font-black mb-1" style={{ color: scoreColor }}>{score}%</div>
          <p className="text-sm" style={{ color: '#64748b' }}>{richtig} von {fragen.length} richtig</p>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: scoreColor }}/>
        </div>

        {falsch.length > 0 && (
          <div className="w-full rounded-xl p-5 space-y-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)' }}>
            <p className="text-sm font-bold text-red-400 flex items-center gap-2"><XCircle size={14}/> Falsch beantwortet</p>
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {falsch.map((f, i) => {
                const c = C[f.katColor] ?? C.blue
                return (
                  <div key={i} className="text-xs space-y-1 pb-2.5 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#475569' }}>{f.fall}</p>
                    <p className="font-mono font-bold" style={{ color: c.text }}>{f.richtig}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button onClick={starten}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: '#f59e0b', color: '#09090e' }}>
            <Zap size={14}/> Nochmal
          </button>
          <button onClick={() => setPhase('setup')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#94a3b8' }}>
            Einstellungen
          </button>
          <button onClick={onBack}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#64748b' }}>
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
        <button onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#475569' }}>
          <ArrowLeft size={13}/>
        </button>
        <div className="flex-1 h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full transition-all duration-300"
            style={{ width: `${(index / fragen.length) * 100}%`, background: '#3b82f6' }}/>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <span style={{ color: '#3d4d66' }}>{index + 1}/{fragen.length}</span>
          <span className="px-2 py-0.5 rounded-full" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            {richtig} ✓
          </span>
        </div>
      </div>

      {/* Frage */}
      <div className="rounded-xl p-7 text-center min-h-[110px] flex items-center justify-center"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderTop: `3px solid ${c.accent}` }}>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: '#3d4d66' }}>Buchungsfall</p>
          <p className="text-base sm:text-lg font-semibold leading-snug" style={{ color: '#e4e4ed' }}>{frage.fall}</p>
        </div>
      </div>

      {/* Optionen */}
      <div className="grid grid-cols-1 gap-2">
        {frage.optionen.map((opt, i) => {
          const letter = ['A', 'B', 'C', 'D'][i]
          let bg = CARD_SURFACE, border = CARD_BORDER, color = '#64748b'
          if (gewählt) {
            if (opt === frage.richtig)   { bg = 'rgba(34,197,94,0.08)';  border = 'rgba(34,197,94,0.4)';  color = '#86efac' }
            else if (opt === gewählt)    { bg = 'rgba(239,68,68,0.08)';  border = 'rgba(239,68,68,0.4)';  color = '#fca5a5' }
          }
          return (
            <button key={i} onClick={() => antworten(opt)} disabled={!!gewählt}
              className="w-full text-left px-4 py-3.5 rounded-xl border text-sm font-mono font-medium transition-all disabled:cursor-default"
              style={{ background: bg, borderColor: border, color }}>
              <span className="inline-flex w-5 h-5 items-center justify-center rounded text-[10px] font-bold mr-3 font-sans shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>{letter}</span>
              {opt}
            </button>
          )
        })}
      </div>

      {gewählt && (
        <div className="space-y-2 fade-in">
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}
            style={{ background: isCorrect ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {isCorrect ? <CheckCircle2 size={16} className="shrink-0 mt-0.5"/> : <XCircle size={16} className="shrink-0 mt-0.5"/>}
            <span>{isCorrect ? 'Richtig!' : <><span className="font-normal" style={{ color: '#64748b' }}>Richtig wäre: </span>{frage.richtig}</>}</span>
          </div>
          <button onClick={weiter}
            className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: '#3b82f6', color: '#fff' }}>
            {index + 1 >= fragen.length ? <><Trophy size={14}/> Ergebnis</> : <>Weiter <ArrowRight size={14}/></>}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers size={12} style={{ color: '#3d4d66' }}/>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3d4d66' }}>
              Kontenrahmen KMU · HEP
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-1" style={{ color: '#e4e4ed' }}>Buchungssätze</h1>
          <p className="text-sm" style={{ color: '#4a5a78' }}>
            {KATEGORIEN.length} Themen · <span style={{ color: '#8896b0' }}>{total} Karten</span>
          </p>
        </div>
        <button onClick={() => setView({ type: 'quiz' })}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] shrink-0 self-start sm:self-auto"
          style={{ background: '#f59e0b', color: '#09090e' }}>
          <Zap size={15}/> Quiz starten
        </button>
      </div>

      {/* Work-in-progress banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span style={{ color: '#fcd34d' }}>
          <strong>Nicht fertig</strong> – aber kann man schon benutzen. Die Buchungssätze sind vollständig, weitere FRW-Themen (Immobilien, Wertschriften, Geldflussrechnung…) folgen laufend.
        </span>
      </div>

      {/* Grid */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#3d4d66' }}>
          Thema wählen
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {KATEGORIEN.map(kat => {
            const c = C[kat.color] ?? C.blue
            return (
              <button key={kat.label} onClick={() => setView({ type: 'study', kat })}
                className="group text-left rounded-xl p-4 transition-all duration-150 overflow-hidden"
                style={{
                  background: CARD_SURFACE,
                  border: `1px solid ${CARD_BORDER}`,
                  borderLeft: `3px solid ${c.accent}`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.05)'
                  el.style.borderColor = c.border
                  el.style.borderLeftColor = c.accent
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = CARD_SURFACE
                  el.style.borderColor = CARD_BORDER
                  el.style.borderLeftColor = c.accent
                }}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <span className="text-xl leading-none">{kat.icon}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: c.text, background: c.soft }}>
                    {kat.eintraege.length}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: '#c8d0e0' }}>{kat.label}</h3>
                <p className="text-[11px] line-clamp-1 leading-relaxed" style={{ color: '#3d4d66' }}>
                  {kat.eintraege[0].fall}
                </p>
                <div className="mt-3 text-[11px] font-semibold flex items-center gap-1 transition-all duration-150 group-hover:translate-x-0.5"
                  style={{ color: c.accent }}>
                  Lernen <ArrowRight size={11}/>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
