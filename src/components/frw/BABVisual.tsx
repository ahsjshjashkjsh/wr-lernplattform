'use client'
import { useState } from 'react'

// ─── Gegebene Werte (aus Prüfungsaufgabe) ─────────────────────────────────────

const FIBU = {
  material:       7_190,
  personal:       7_790,
  raum:           2_400,
  werbung:          480,
  uebriger:         800,
  abschreibungen: 1_680,
  zinsen:           360,
}
const GESAMT_AUFWAND = Object.values(FIBU).reduce((s, v) => s + v, 0) // 20'700

// Materialbestand
const ANFANG_FIBU = 1_200
const ENDE_FIBU   = 1_440
// Unterbewertet um 1/3 → True = FiBu × 3/2
const EINKAUEFE   = FIBU.material + (ENDE_FIBU - ANFANG_FIBU)       // 7'430
const B2          = Math.round(EINKAUEFE * 1.5) - Math.round(ENDE_FIBU * 1.5) + Math.round(ANFANG_FIBU * 1.5)
// = 11'145 - 2'160 + 1'800 = 10'785
const B1          = B2 - FIBU.material                               // 3'595

// Raumkosten nach Volumen verteilen (Fläche × Raumhöhe)
const VOL = { mat: 500, fertI: 900, fertII: 800, vv: 200 }
const VOL_TOTAL = VOL.mat + VOL.fertI + VOL.fertII + VOL.vv          // 2'400
const RAUM = {
  mat:    Math.round(FIBU.raum * VOL.mat    / VOL_TOTAL),            // 500
  fertI:  Math.round(FIBU.raum * VOL.fertI  / VOL_TOTAL),            // 900
  fertII: Math.round(FIBU.raum * VOL.fertII / VOL_TOTAL),            // 800
  vv:     Math.round(FIBU.raum * VOL.vv     / VOL_TOTAL),            // 200
}

// Verteilung aller Kostenarten auf Kostenstellen
const DIST: Record<string, { mat: number; fertI: number; fertII: number; vv: number }> = {
  material:       { mat: B2,   fertI:     0, fertII:    0, vv:     0 },
  personal:       { mat: 800,  fertI: 3_200, fertII: 2_100, vv: 1_690 },
  raum:           { mat: RAUM.mat, fertI: RAUM.fertI, fertII: RAUM.fertII, vv: RAUM.vv },
  werbung:        { mat:   0,  fertI:     0, fertII:    0, vv:   480 },
  uebriger:       { mat:  80,  fertI:   300, fertII:  220, vv:   200 },
  abschreibungen: { mat: 100,  fertI:   800, fertII:  600, vv:   180 },
  zinsen:         { mat:  30,  fertI:   120, fertII:   90, vv:   120 },
}

// GK-Summen je Kostenstelle
const GK = {
  mat:    Object.values(DIST).reduce((s, d) => s + d.mat, 0),    // 12'295
  fertI:  Object.values(DIST).reduce((s, d) => s + d.fertI, 0),  //  5'320
  fertII: Object.values(DIST).reduce((s, d) => s + d.fertII, 0), //  3'810
  vv:     Object.values(DIST).reduce((s, d) => s + d.vv, 0),     //  2'870
}
const GK_GESAMT = GK.mat + GK.fertI + GK.fertII + GK.vv          // 24'295

// Einzelkalkulation – gegebene Werte
const EK = {
  mek:      6_000,
  stunden:  34,
  lohnsatz: 90,
  mgkPct:   35,
  fgkChf:   55,
  vvPct:    20,
  rwPct:    25,
}

// Einzelkalkulation – berechnete Werte
const EK_MGK    = Math.round(EK.mek * EK.mgkPct / 100)                  // 2'100
const EK_MATK   = EK.mek + EK_MGK                                        // 8'100
const EK_FEK    = EK.stunden * EK.lohnsatz                               // 3'060
const EK_FGK    = EK.stunden * EK.fgkChf                                 // 1'870
const EK_FERTK  = EK_FEK + EK_FGK                                        // 4'930
const EK_HK     = EK_MATK + EK_FERTK                                     // 13'030
const EK_VV     = Math.round(EK_HK * EK.vvPct / 100)                    // 2'606
const EK_SK     = EK_HK + EK_VV                                          // 15'636
const EK_RG     = Math.round(EK_SK * EK.rwPct / 100)                    // 3'909
const EK_NE     = EK_SK + EK_RG                                          // 19'545

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function f(n: number): string {
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}
function fp(n: number): string {
  return n.toFixed(2) + ' %'
}

// ─── Typen ────────────────────────────────────────────────────────────────────

type ColKey = 'aufwand' | 'abgrenzung' | 'kosten' | 'mat' | 'fertI' | 'fertII' | 'vv' | 'prodA' | 'prodB'

interface BabRow {
  key: string
  label: string
  aufwand?: number
  abgrenzung?: number | '?' | string
  kosten?: number | '?'
  mat?: number | '?'
  fertI?: number
  fertII?: number
  vv?: number | '?'
  prodA?: number | string
  prodB?: number | string
  isBold?: boolean
  isGray?: boolean
  isDivider?: boolean
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function BABVisual() {
  const [showSolution, setShowSolution] = useState(false)
  const [activeStep,   setActiveStep]   = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<'kar' | 'ksr' | 'ktr'>('ksr')

  const show = showSolution

  // Tabellenzeilen
  const rows: BabRow[] = [
    {
      key: 'material', label: 'Materialaufwand',
      aufwand: FIBU.material,
      abgrenzung: show ? B1 : '?',
      kosten: show ? B2 : '?',
      mat: show ? DIST.material.mat : '?',
      fertI: 0, fertII: 0, vv: 0,
    },
    {
      key: 'personal', label: 'Personalaufwand',
      aufwand: FIBU.personal, abgrenzung: 0, kosten: FIBU.personal,
      mat: DIST.personal.mat, fertI: DIST.personal.fertI,
      fertII: DIST.personal.fertII, vv: DIST.personal.vv,
    },
    {
      key: 'raum', label: 'Raumaufwand',
      aufwand: FIBU.raum, abgrenzung: 0, kosten: FIBU.raum,
      mat: show ? RAUM.mat : '?',
      fertI: show ? RAUM.fertI : undefined,
      fertII: show ? RAUM.fertII : undefined,
      vv: show ? RAUM.vv : '?',
    },
    {
      key: 'werbung', label: 'Werbung',
      aufwand: FIBU.werbung, abgrenzung: 0, kosten: FIBU.werbung,
      mat: 0, fertI: 0, fertII: 0, vv: DIST.werbung.vv,
    },
    {
      key: 'uebriger', label: 'Übriger Aufwand',
      aufwand: FIBU.uebriger, abgrenzung: 0, kosten: FIBU.uebriger,
      mat: DIST.uebriger.mat, fertI: DIST.uebriger.fertI,
      fertII: DIST.uebriger.fertII, vv: DIST.uebriger.vv,
    },
    {
      key: 'abschr', label: 'Abschreibungen',
      aufwand: FIBU.abschreibungen, abgrenzung: 0, kosten: FIBU.abschreibungen,
      mat: DIST.abschreibungen.mat, fertI: DIST.abschreibungen.fertI,
      fertII: DIST.abschreibungen.fertII, vv: DIST.abschreibungen.vv,
    },
    {
      key: 'zinsen', label: 'Zinsen',
      aufwand: FIBU.zinsen, abgrenzung: 0, kosten: FIBU.zinsen,
      mat: DIST.zinsen.mat, fertI: DIST.zinsen.fertI,
      fertII: DIST.zinsen.fertII,
      vv: show ? DIST.zinsen.vv : '?',
    },
    {
      key: 'total', label: 'TOTAL',
      aufwand: GESAMT_AUFWAND,
      abgrenzung: show ? B1 : '?',
      kosten: show ? GK_GESAMT : '?',
      mat: show ? GK.mat : '?',
      fertI: show ? GK.fertI : undefined,
      fertII: show ? GK.fertII : undefined,
      vv: show ? GK.vv : '?',
      isBold: true,
    },
    {
      key: 'zs', label: 'Zuschlagssatz',
      abgrenzung: undefined,
      mat: show ? (fp(GK.mat / (B2 / 1) * 100) as unknown as number) : undefined,
      isBold: false, isGray: true,
    },
  ]

  const STEPS = [
    { title: 'Abgrenzung Materialaufwand',   color: '#60a5fa', field: '[b1] und [b2]' },
    { title: 'Raumkosten-Verteilung',        color: '#a78bfa', field: '[c]' },
    { title: 'Material-GK-Zuschlagssatz',   color: '#34d399', field: '[d]' },
    { title: 'FGK-Satz (CHF/Std.)',         color: '#34d399', field: 'Fert. I + II' },
    { title: 'VV-Satz',                     color: '#fbbf24', field: 'VV' },
  ]

  return (
    <div className="space-y-5">

      {/* ── Abschnitt-Navigation ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { key: 'kar', label: 'Kostenartenrechnung', abbr: 'KAR', color: '#60a5fa' },
          { key: 'ksr', label: 'Kostenstellenrechnung', abbr: 'KSR', color: '#34d399' },
          { key: 'ktr', label: 'Kostenträgerrechnung', abbr: 'KTR', color: '#fbbf24' },
        ] as const).map(({ key, label, abbr, color }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className="py-2.5 px-2 rounded-xl text-xs font-semibold transition-all text-center"
            style={{
              background: activeSection === key ? `${color}18` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${activeSection === key ? color + '45' : 'var(--border-color)'}`,
              color: activeSection === key ? color : 'var(--text-muted)',
            }}>
            <span className="block text-[10px] font-bold mb-0.5 opacity-60">{abbr}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ── KAR ──────────────────────────────────────────────────────── */}
      {activeSection === 'kar' && (
        <div className="space-y-3">
          <SectionTitle title="Kostenartenrechnung" sub="Welche Kosten fallen insgesamt an?" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'Materialaufwand',   val: FIBU.material,       color: '#60a5fa', hint: 'Rohstoffe, Hilfsstoffe' },
              { label: 'Personalaufwand',   val: FIBU.personal,       color: '#34d399', hint: 'Löhne, Gehälter' },
              { label: 'Raumaufwand',       val: FIBU.raum,           color: '#a78bfa', hint: 'Miete, Betrieb' },
              { label: 'Werbung',           val: FIBU.werbung,        color: '#fbbf24', hint: 'Marketing, Verkauf' },
              { label: 'Übriger Aufwand',   val: FIBU.uebriger,       color: '#fb923c', hint: 'Diverses' },
              { label: 'Abschreibungen',    val: FIBU.abschreibungen, color: '#f87171', hint: 'Maschinen, Fahrzeuge' },
              { label: 'Zinsen',            val: FIBU.zinsen,         color: '#94a3b8', hint: 'Kalk. Kapitalkosten' },
            ].map(({ label, val, color, hint }) => (
              <div key={label} className="p-3 rounded-xl"
                style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <div className="text-[10px] font-semibold mb-0.5" style={{ color }}>{label}</div>
                <div className="font-mono font-bold" style={{ color }}>CHF {f(val)}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{hint}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Total Aufwand (FiBu)</span>
            <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>CHF {f(GESAMT_AUFWAND)}</span>
          </div>
          <InfoBox color="#60a5fa">
            Die KAR zeigt den <strong>Gesamtaufwand laut FiBu</strong>. Im BAB wird dieser durch <strong>Abgrenzungen</strong> auf die Kosten für die Kalkulation korrigiert (z.B. kalkulatorische Bewertung statt FiBu-Wert).
          </InfoBox>
        </div>
      )}

      {/* ── KSR (BAB-Tabelle) ─────────────────────────────────────────── */}
      {activeSection === 'ksr' && (
        <div className="space-y-4">
          <SectionTitle title="Kostenstellenrechnung — BAB" sub="Wohin fliessen die Kosten?" />

          {/* Lösung / Schritte Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSolution(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: showSolution ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showSolution ? 'rgba(234,179,8,0.35)' : 'var(--border-color)'}`,
                color: showSolution ? '#fbbf24' : 'var(--text-muted)',
              }}>
              {showSolution ? '🔓' : '🔒'} {showSolution ? 'Lösung sichtbar' : 'Lösung anzeigen'}
            </button>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>Blau = gegeben</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }}>Gelb = berechnet</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Rot = unbekannt</span>
            </div>
          </div>

          {/* BAB-Tabelle */}
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
            <table className="w-full text-xs border-collapse" style={{ minWidth: '780px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  {[
                    { label: 'Kostenart', align: 'left',  width: '140px' },
                    { label: 'Aufwand',    align: 'right', width: '72px', color: '#60a5fa' },
                    { label: 'Abgrenzung',align: 'right', width: '80px', color: '#fbbf24' },
                    { label: 'Kosten',     align: 'right', width: '72px', color: '#fbbf24' },
                    { label: 'Materiallager', align: 'right', width: '84px', color: '#a78bfa' },
                    { label: 'Fertigung I',   align: 'right', width: '80px', color: '#34d399' },
                    { label: 'Fertigung II',  align: 'right', width: '80px', color: '#34d399' },
                    { label: 'Verw. & Vertrieb', align: 'right', width: '90px', color: '#fbbf24' },
                    { label: 'Produkt A', align: 'right', width: '72px', color: '#fb923c' },
                    { label: 'Produkt B', align: 'right', width: '72px', color: '#fb923c' },
                  ].map(({ label, align, width, color }) => (
                    <th key={label}
                      className="px-2.5 py-2.5 font-semibold text-[11px]"
                      style={{
                        textAlign: align as 'left' | 'right',
                        minWidth: width,
                        color: color ?? 'var(--text-muted)',
                        borderLeft: label !== 'Kostenart' ? '1px solid var(--border-color)' : undefined,
                      }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  if (row.isDivider) return (
                    <tr key={row.key}><td colSpan={10} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.10)' }} /></tr>
                  )
                  const isTotal = row.isBold
                  if (i === rows.length - 1) return null // skip ZS row for now
                  return (
                    <tr key={row.key}
                      style={{ borderTop: isTotal ? '2px solid rgba(255,255,255,0.12)' : undefined, background: isTotal ? 'rgba(255,255,255,0.025)' : 'transparent' }}>
                      <td className="px-2.5 py-2" style={{ color: isTotal ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isTotal ? 700 : 400, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {row.label}
                      </td>
                      <BabCell val={row.aufwand}    isGiven  bold={isTotal} />
                      <BabCell val={row.abgrenzung} isCalc   bold={isTotal} />
                      <BabCell val={row.kosten}     isCalc   bold={isTotal} />
                      <BabCell val={row.mat}        isCalc   bold={isTotal} accent="#a78bfa" />
                      <BabCell val={row.fertI}      isGiven={row.key !== 'total' && row.key !== 'raum'} isCalc={row.key === 'raum' || row.key === 'total'} bold={isTotal} accent="#34d399" />
                      <BabCell val={row.fertII}     isGiven={row.key !== 'total' && row.key !== 'raum'} isCalc={row.key === 'raum' || row.key === 'total'} bold={isTotal} accent="#34d399" />
                      <BabCell val={row.vv}         isCalc   bold={isTotal} accent="#fbbf24" />
                      <BabCell val={undefined}      />
                      <BabCell val={undefined}      />
                    </tr>
                  )
                })}

                {/* Trennlinie */}
                <tr><td colSpan={10} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.10)' }} /></tr>

                {/* ZS-Zeilen */}
                <ZSRow
                  label="MGK-Satz (% MEK)"
                  mat={show ? fp(EK.mgkPct) : '?'}
                  fertI={undefined} fertII={undefined} vv={undefined}
                  note="GK Materiallager ÷ MEK × 100"
                />
                <ZSRow
                  label="FGK-Satz (CHF/Std.)"
                  mat={undefined}
                  fertI={show ? `CHF ${EK.fgkChf}.–` : '?'}
                  fertII={show ? `CHF ${EK.fgkChf}.–` : '?'}
                  vv={undefined}
                  note="GK Fertigung ÷ Einzellohnstunden"
                />
                <ZSRow
                  label="VV-Satz (% HK)"
                  mat={undefined} fertI={undefined} fertII={undefined}
                  vv={show ? fp(EK.vvPct) : '?'}
                  note="GK VV ÷ Herstellkosten × 100"
                />
              </tbody>
            </table>
          </div>

          {/* Schrittweise Erklärungen */}
          <div>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Berechnung Schritt für Schritt:</p>
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <button key={i}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{
                    background: activeStep === i ? `${s.color}12` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeStep === i ? s.color + '40' : 'var(--border-color)'}`,
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${s.color}20`, color: s.color }}>
                        {i + 1}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: activeStep === i ? s.color : 'var(--text-secondary)' }}>
                        {s.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>
                        {s.field}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{activeStep === i ? '▲' : '▼'}</span>
                  </div>

                  {activeStep === i && (
                    <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${s.color}25` }}>
                      {i === 0 && <StepB1B2 />}
                      {i === 1 && <StepRaum />}
                      {i === 2 && <StepMGK />}
                      {i === 3 && <StepFGK />}
                      {i === 4 && <StepVV />}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── KTR (Einzelkalkulation) ───────────────────────────────────── */}
      {activeSection === 'ktr' && (
        <div className="space-y-4">
          <SectionTitle title="Kostenträgerrechnung — Einzelkalkulation" sub="Was kostet ein konkreter Auftrag?" />

          {/* Gegebene Auftragsdaten */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Material (MEK)',        val: `CHF ${f(EK.mek)}`,              color: '#60a5fa' },
              { label: 'Einzellohnstunden',      val: `${EK.stunden} h`,               color: '#34d399' },
              { label: 'Lohnsatz',              val: `CHF ${EK.lohnsatz}.–/h`,        color: '#34d399' },
              { label: 'MGK-Zuschlag',          val: `${EK.mgkPct} % der MEK`,        color: '#a78bfa' },
              { label: 'FGK-Zuschlag',          val: `CHF ${EK.fgkChf}.– / Std.`,     color: '#a78bfa' },
              { label: 'VV-Zuschlag',           val: `${EK.vvPct} % der HK`,          color: '#fbbf24' },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-2.5 rounded-xl"
                style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <div className="text-[10px] font-semibold mb-0.5" style={{ color }}>{label}</div>
                <div className="font-mono text-xs font-bold" style={{ color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Kalkulationsschema */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Position</th>
                  <th className="text-right px-4 py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>CHF</th>
                  <th className="text-right px-4 py-2.5 font-semibold hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Berechnung</th>
                </tr>
              </thead>
              <tbody>
                <KSHeader label="Materialkosten" color="#60a5fa" />
                <KRow label="Materialeinzelkosten (MEK)"                         val={EK.mek}   given  />
                <KRow label={`+ Materialgemeinkosten  ${EK.mgkPct} % × MEK`}    val={EK_MGK}   calc   calc_s={`${EK.mgkPct} % × ${f(EK.mek)}`} />
                <KSumRow label="= Materialkosten"                                val={EK_MATK}  color="#60a5fa" />

                <KSHeader label="Fertigungskosten" color="#34d399" />
                <KRow label={`Fertigungseinzelkosten (FEK)  ${EK.stunden} h × CHF ${EK.lohnsatz}.–`} val={EK_FEK} given calc_s={`${EK.stunden} × ${EK.lohnsatz}`} />
                <KRow label={`+ Fertigungs-GK  ${EK.stunden} h × CHF ${EK.fgkChf}.–`}               val={EK_FGK} calc  calc_s={`${EK.stunden} × ${EK.fgkChf}`} />
                <KSumRow label="= Fertigungskosten"                              val={EK_FERTK} color="#34d399" />

                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.12)' }}>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>= Herstellkosten (HK)</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sm" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>{f(EK_HK)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)' }}>{f(EK_MATK)} + {f(EK_FERTK)}</td>
                </tr>

                <KSHeader label="Verwaltungs- & Vertriebskosten" color="#fbbf24" />
                <KRow label={`+ VV-Gemeinkosten  ${EK.vvPct} % × HK`}           val={EK_VV}   calc  calc_s={`${EK.vvPct} % × ${f(EK_HK)}`} />
                <KSumRow label="= Selbstkosten (SK)"                             val={EK_SK}   color="#fbbf24" />

                <KRow label={`+ Reingewinn  ${EK.rwPct} % × SK`}                val={EK_RG}   calc  calc_s={`${EK.rwPct} % × ${f(EK_SK)}`} />

                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)' }}>
                  <td className="px-4 py-3.5 font-bold text-sm" style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)' }}>= Nettoerlös (Verkaufspreis netto)</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-base" style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)' }}>{f(EK_NE)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', background: 'rgba(52,211,153,0.07)' }}>{f(EK_SK)} + {f(EK_RG)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Materialkosten',   val: EK_MATK,  color: '#60a5fa' },
              { label: 'Fertigungskosten', val: EK_FERTK, color: '#34d399' },
              { label: 'Herstellkosten',   val: EK_HK,    color: 'var(--text-primary)' },
              { label: 'Selbstkosten',     val: EK_SK,    color: '#fbbf24' },
              { label: 'Reingewinn',       val: EK_RG,    color: '#34d399' },
              { label: 'Nettoerlös',       val: EK_NE,    color: '#34d399' },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-2.5 rounded-xl text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="font-mono font-bold text-sm" style={{ color }}>CHF {f(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Schritt-Erklärungen ──────────────────────────────────────────────────────

function StepB1B2() {
  return (
    <div className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      <p><strong>Gegeben:</strong> Anfangsbestand FiBu = CHF 1'200 | Endbestand FiBu = CHF 1'440<br />FiBu unterbewertet um 1/3 → Wahrer Wert = FiBu × 3/2</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <p className="font-semibold text-blue-300 mb-1">FiBu-Werte</p>
          <p>Anfang: CHF {f(ANFANG_FIBU)}<br />Ende: CHF {f(ENDE_FIBU)}<br />Einkäufe: {f(EINKAUEFE)}<br />Aufwand: {f(FIBU.material)}</p>
        </div>
        <div className="p-2.5 rounded-lg" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <p className="font-semibold text-amber-300 mb-1">Wahre Werte (×3/2)</p>
          <p>Anfang: CHF {f(ANFANG_FIBU * 1.5)}<br />Ende: CHF {f(ENDE_FIBU * 1.5)}<br />Einkäufe: {f(EINKAUEFE * 1.5)}<br />Kosten: {f(B2)}</p>
        </div>
      </div>
      <p className="p-2 rounded-lg font-mono" style={{ background: 'rgba(255,255,255,0.04)' }}>
        [b1] Abgrenzung = {f(B2)} − {f(FIBU.material)} = <strong className="text-amber-300">+{f(B1)}</strong><br />
        [b2] Kosten = {f(FIBU.material)} + {f(B1)} = <strong className="text-amber-300">{f(B2)}</strong>
      </p>
    </div>
  )
}

function StepRaum() {
  return (
    <div className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      <p><strong>Gegeben:</strong> Total Raumaufwand CHF {f(FIBU.raum)} | Verteilung nach Volumen (m² × Raumhöhe)</p>
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { ks: 'Materiallager', vol: VOL.mat,    anteil: RAUM.mat    },
          { ks: 'Fertigung I',   vol: VOL.fertI,  anteil: RAUM.fertI  },
          { ks: 'Fertigung II',  vol: VOL.fertII, anteil: RAUM.fertII },
          { ks: 'VV',            vol: VOL.vv,     anteil: RAUM.vv     },
        ].map(({ ks, vol, anteil }) => (
          <div key={ks} className="p-2 rounded-lg text-center" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <div className="font-semibold text-purple-300 text-[10px]">{ks}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{vol} m³</div>
            <div className="font-mono font-bold text-purple-200">{f(anteil)}</div>
          </div>
        ))}
      </div>
      <p className="p-2 rounded-lg font-mono" style={{ background: 'rgba(255,255,255,0.04)' }}>
        Satz = {f(FIBU.raum)} ÷ {VOL_TOTAL} m³ = CHF 1.– / m³<br />
        Materiallager: {VOL.mat} × 1 = <strong className="text-amber-300">{f(RAUM.mat)}</strong>
      </p>
    </div>
  )
}

function StepMGK() {
  return (
    <div className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      <p><strong>GK Materiallager:</strong> CHF {f(GK.mat)}</p>
      <p className="p-2 rounded-lg font-mono" style={{ background: 'rgba(255,255,255,0.04)' }}>
        MGK-Satz = GK Materiallager ÷ MEK × 100<br />
        = {f(GK.mat)} ÷ MEK × 100 ≈ <strong className="text-amber-300">{EK.mgkPct} %</strong> (gegeben für Kalkulation)
      </p>
      <p>Für die Einzelkalkulation wird <strong>MGK = 35 % der MEK</strong> verwendet.</p>
    </div>
  )
}

function StepFGK() {
  return (
    <div className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      <p><strong>GK Fertigung I:</strong> CHF {f(GK.fertI)} | <strong>GK Fertigung II:</strong> CHF {f(GK.fertII)}</p>
      <p className="p-2 rounded-lg font-mono" style={{ background: 'rgba(255,255,255,0.04)' }}>
        FGK-Satz = GK Fertigung ÷ Einzellohnstunden<br />
        = Gegeben: <strong className="text-amber-300">CHF {EK.fgkChf}.– pro Einzellohnstunde</strong>
      </p>
      <div className="p-2.5 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <p className="text-red-300 font-semibold">⚠ Wichtig:</p>
        <p>FGK wird <strong>nicht in Prozent</strong>, sondern in <strong>CHF pro Stunde</strong> angegeben. Für 34 Stunden: 34 × CHF {EK.fgkChf}.– = CHF {f(EK_FGK)}</p>
      </div>
    </div>
  )
}

function StepVV() {
  return (
    <div className="space-y-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      <p><strong>GK Verwaltung & Vertrieb:</strong> CHF {f(GK.vv)}</p>
      <p className="p-2 rounded-lg font-mono" style={{ background: 'rgba(255,255,255,0.04)' }}>
        VV-Satz = GK VV ÷ Herstellkosten × 100<br />
        = {f(GK.vv)} ÷ HK × 100 ≈ <strong className="text-amber-300">{EK.vvPct} %</strong> (gegeben für Kalkulation)
      </p>
      <p>Für die Einzelkalkulation: <strong>VV = 20 % der Herstellkosten</strong></p>
    </div>
  )
}

// ─── Hilfs-Komponenten ────────────────────────────────────────────────────────

function BabCell({ val, isGiven, isCalc, bold, accent }: {
  val?: number | string; isGiven?: boolean; isCalc?: boolean; bold?: boolean; accent?: string
}) {
  const isEmpty = val === undefined || val === null
  const isUnknown = val === '?'
  const numVal = typeof val === 'number' ? f(val) : val

  let bg = 'transparent'
  let color = 'var(--text-secondary)'
  let content: string = isEmpty ? '' : (isUnknown ? '?' : (numVal ?? ''))

  if (isUnknown) { bg = 'rgba(248,113,113,0.10)'; color = '#f87171' }
  else if (isCalc && !isEmpty) { bg = 'rgba(234,179,8,0.08)'; color = accent ?? '#fbbf24' }
  else if (isGiven && !isEmpty) { color = accent ?? '#60a5fa' }

  return (
    <td className="px-2.5 py-2 text-right font-mono"
      style={{
        color: isEmpty ? 'rgba(255,255,255,0.1)' : color,
        background: bg,
        fontWeight: bold ? 700 : 400,
        fontSize: '11px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderLeft: '1px solid var(--border-color)',
      }}>
      {isEmpty ? '–' : content}
    </td>
  )
}

function ZSRow({ label, mat, fertI, fertII, vv, note }: {
  label: string; mat?: string; fertI?: string; fertII?: string; vv?: string; note: string
}) {
  const cell = (v?: string) => (
    <td className="px-2.5 py-2 text-right font-mono text-[11px]"
      style={{
        color: v === '?' ? '#f87171' : (v ? '#fbbf24' : 'rgba(255,255,255,0.1)'),
        background: v === '?' ? 'rgba(248,113,113,0.10)' : (v ? 'rgba(234,179,8,0.08)' : 'transparent'),
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderLeft: '1px solid var(--border-color)',
      }}>
      {v ?? '–'}
    </td>
  )

  return (
    <tr style={{ background: 'rgba(52,211,153,0.03)' }}>
      <td className="px-2.5 py-2" style={{ color: '#34d399', fontSize: '11px', fontStyle: 'italic', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {label}
        <span className="block text-[9px] opacity-50">{note}</span>
      </td>
      <td className="px-2.5 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: '1px solid var(--border-color)' }} />
      <td className="px-2.5 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: '1px solid var(--border-color)' }} />
      <td className="px-2.5 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: '1px solid var(--border-color)' }} />
      {cell(mat)}
      {cell(fertI)}
      {cell(fertII)}
      {cell(vv)}
      <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: '1px solid var(--border-color)' }} />
      <td style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: '1px solid var(--border-color)' }} />
    </tr>
  )
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}

function InfoBox({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl text-[11px]"
      style={{ background: `${color}0d`, border: `1px solid ${color}30`, color: 'var(--text-secondary)' }}>
      <span>💡</span>
      <span>{children}</span>
    </div>
  )
}

function KSHeader({ label, color }: { label: string; color: string }) {
  return (
    <tr>
      <td colSpan={3} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider"
        style={{ color, background: `${color}12`, borderBottom: `1px solid ${color}25` }}>
        {label}
      </td>
    </tr>
  )
}

function KRow({ label, val, given, calc, calc_s }: {
  label: string; val: number; given?: boolean; calc?: boolean; calc_s?: string
}) {
  return (
    <tr>
      <td className="px-4 py-2" style={{ color: calc ? '#fbbf24' : 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingLeft: calc ? 28 : 16 }}>
        {label}
      </td>
      <td className="px-4 py-2 text-right font-mono" style={{ color: calc ? '#fbbf24' : '#60a5fa', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {f(val)}
      </td>
      <td className="px-4 py-2 text-right font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {calc_s ?? ''}
      </td>
    </tr>
  )
}

function KSumRow({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <td className="px-4 py-2 font-bold" style={{ color, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{label}</td>
      <td className="px-4 py-2 text-right font-mono font-bold" style={{ color, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{f(val)}</td>
      <td className="hidden sm:table-cell" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
    </tr>
  )
}
