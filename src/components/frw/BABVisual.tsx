'use client'
import { useState } from 'react'

// ─── Zahlen aus Schweizer FRW-Prüfungsaufgabe ────────────────────────────────
//
//  Kostenstellen: Material | Fertigung I | Fertigung II | Verw. & Vertrieb
//  Zuschlagssätze (aus Aufgabenstellung):
//    MGK-Satz     = 35 % der MEK
//    FGK-Satz     = CHF 55.– pro Einzellohnstunde
//    VV-Satz      = 20 % der Herstellkosten
//    Reingewinn   = 25 % der Selbstkosten

const KS = ['Material', 'Fertigung I', 'Fertigung II', 'Verw. & Vertrieb'] as const
const KS_COLOR  = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24']
const KS_BG_HI  = ['rgba(96,165,250,0.14)', 'rgba(52,211,153,0.14)', 'rgba(167,139,250,0.14)', 'rgba(251,191,36,0.14)']
const KS_BG_LO  = ['rgba(96,165,250,0.06)', 'rgba(52,211,153,0.06)', 'rgba(167,139,250,0.06)', 'rgba(251,191,36,0.06)']
const KS_BORDER = ['rgba(96,165,250,0.25)', 'rgba(52,211,153,0.25)', 'rgba(167,139,250,0.25)', 'rgba(251,191,36,0.25)']

// Gemeinkosten je Kostenstelle (CHF)
const KOSTENARTEN = [
  { label: 'Materialkosten (Hilfsstoffe)', values: [7_190,     0,     0,     0], color: '#60a5fa' },
  { label: 'Personalkosten',               values: [1_790, 4_180, 1_480, 2_080], color: '#34d399' },
  { label: 'Raumkosten',                   values: [  400, 1_600,   800,   750], color: '#a78bfa' },
  { label: 'Energie',                      values: [  100,   520,   300,    80], color: '#fb923c' },
  { label: 'Abschreibungen',               values: [  600, 2_900, 1_700,   400], color: '#f87171' },
  { label: 'Übrige Kosten',                values: [  290,   440,   220,   390], color: '#94a3b8' },
]

// Total GK je Kostenstelle
const TOTAL_GK = KS.map((_, ci) => KOSTENARTEN.reduce((s, ka) => s + ka.values[ci], 0))
// [10'370, 9'640, 4'500, 3'700]

// Zuschlagsgrundlagen
const MEK    = 29_628   // CHF — sodass MGK-ZS = 35.00 %
const ELH_I  = 175       // Einzellohnstunden Fertigung I  → FGK = 175 × 55 = 9'625 ≈ 9'640
const ELH_II = 81        // Einzellohnstunden Fertigung II → FGK = 81 × 55 = 4'455 ≈ 4'500
// Herstellkosten als Grundlage für VV
const HK_GRUNDLAGE = MEK + TOTAL_GK[0] + (ELH_I * 55) + TOTAL_GK[1] + (ELH_II * 55) + TOTAL_GK[2]
// ≈ 29628 + 10370 + 9625 + 9640 + 4455 + 4500 = 68'218

// Zuschlagssätze (exakt aus Aufgabe)
const MGK_ZS_PCT = 35           // 35 % der MEK
const FGK_ZS_CHF = 55           // CHF 55 pro Einzellohnstunde
const VV_ZS_PCT  = 20           // 20 % der Herstellkosten
const RG_ZS_PCT  = 25           // 25 % der Selbstkosten

// ─── Einzelkalkulation (Beispielauftrag aus Prüfung) ─────────────────────────
//  MEK         = CHF 6'000
//  34 Einzellohnstunden à CHF 90.–/Stunde

const B_MEK      = 6_000
const B_ELH      = 34
const B_LOHN     = 90
const B_MGK      = Math.round(B_MEK * MGK_ZS_PCT / 100)          // 35% × 6'000 = 2'100
const B_MATK     = B_MEK + B_MGK                                   // 8'100
const B_FEK      = B_ELH * B_LOHN                                  // 34 × 90 = 3'060
const B_FGK      = B_ELH * FGK_ZS_CHF                             // 34 × 55 = 1'870
const B_FERTK    = B_FEK + B_FGK                                   // 4'930
const B_HK       = B_MATK + B_FERTK                                // 13'030
const B_VV       = Math.round(B_HK * VV_ZS_PCT / 100)             // 20% × 13'030 = 2'606
const B_SK       = B_HK + B_VV                                     // 15'636
const B_RG       = Math.round(B_SK * RG_ZS_PCT / 100)             // 25% × 15'636 = 3'909
const B_NE       = B_SK + B_RG                                     // 19'545

// ─── Formatierung ─────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

// ─── Schritte ─────────────────────────────────────────────────────────────────
const STEP_STYLE = [
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.28)'  },
  { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.28)'  },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.28)'  },
]

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function BABVisual() {
  const [step,   setStep]   = useState(0)
  const [selCol, setSelCol] = useState<number | null>(null)
  const [hovRow, setHovRow] = useState<number | null>(null)

  function goStep(s: number) { setStep(s); setSelCol(null) }

  const tdBase: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.05)' }
  const tdL:    React.CSSProperties = { ...tdBase, borderLeft: '1px solid var(--border-color)' }

  return (
    <div className="space-y-5">

      {/* ── Intro-Karte ───────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
        <span className="text-xl leading-none mt-0.5">📋</span>
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            Betriebsabrechnungsbogen (BAB)
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Der BAB verteilt die <strong style={{ color: 'var(--text-secondary)' }}>Gemeinkosten (GK)</strong> auf die vier Kostenstellen und ermittelt daraus die <strong style={{ color: 'var(--text-secondary)' }}>Zuschlagssätze</strong> — Grundlage für die Einzelkalkulation.
          </p>
        </div>
      </div>

      {/* ── Schritt-Navigation ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {(['GK verteilen', 'Zuschlagssätze', 'Einzelkalkulation'] as const).map((label, i) => {
          const s = STEP_STYLE[i]
          const active = step === i
          return (
            <button key={i} onClick={() => goStep(i)}
              className="py-2.5 px-2 rounded-xl text-xs font-semibold transition-all text-center"
              style={{
                background: active ? s.bg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? s.border : 'var(--border-color)'}`,
                color: active ? s.color : 'var(--text-muted)',
              }}>
              <span className="block text-[10px] font-bold mb-0.5 opacity-50">Schritt {i + 1}</span>
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Schritt-Beschreibung ──────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: STEP_STYLE[step].bg, border: `1px solid ${STEP_STYLE[step].border}` }}>
        <span className="text-base mt-0.5">{['📊', '🧮', '🏷️'][step]}</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {step === 0 && 'Die Gemeinkosten werden direkt den vier Kostenstellen zugeordnet. Fahre über eine Zeile um die Verteilung zu sehen.'}
          {step === 1 && 'Der Zuschlagssatz = GK ÷ Zuschlagsgrundlage. Achtung: Fertigungs-GK wird in CHF pro Einzellohnstunde angegeben — nicht als Prozentsatz! Klicke eine Kostenstelle an.'}
          {step === 2 && 'Mit den Zuschlagssätzen wird der Verkaufspreis für einen Auftrag berechnet — Schritt für Schritt von den Einzelkosten bis zum Nettoerlös.'}
        </p>
      </div>

      {/* ══ SCHRITT 1 — GK-Tabelle ════════════════════════════════════ */}
      {step === 0 && (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
          <table className="w-full text-xs border-collapse" style={{ minWidth: '500px' }}>
            <thead>
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', minWidth: '160px' }}>
                  Kostenart
                </th>
                <th className="text-right px-3 py-2.5 font-semibold"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', minWidth: '72px' }}>
                  Total
                </th>
                {KS.map((ks, ci) => (
                  <th key={ci} className="text-right px-3 py-2.5 font-semibold"
                    style={{ color: KS_COLOR[ci], background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)', minWidth: '78px' }}>
                    {ks}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KOSTENARTEN.map((ka, ri) => {
                const total = ka.values.reduce((s, v) => s + v, 0)
                return (
                  <tr key={ri} onMouseEnter={() => setHovRow(ri)} onMouseLeave={() => setHovRow(null)}>
                    <td className="px-3 py-2.5" style={{ ...tdBase, color: 'var(--text-secondary)' }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 mb-0.5" style={{ background: ka.color }} />
                      {ka.label}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold" style={{ ...tdBase, color: 'var(--text-primary)' }}>
                      {fmt(total)}
                    </td>
                    {ka.values.map((v, ci) => (
                      <td key={ci} className="px-3 py-2.5 text-right font-mono"
                        style={{
                          ...tdL,
                          color: hovRow === ri && v > 0 ? KS_COLOR[ci] : (v === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)'),
                          background: hovRow === ri ? KS_BG_LO[ci] : 'transparent',
                          fontWeight: hovRow === ri && v > 0 ? 600 : 400,
                          transition: 'background 0.12s, color 0.12s',
                        }}>
                        {v === 0 ? '–' : fmt(v)}
                      </td>
                    ))}
                  </tr>
                )
              })}

              {/* Trennlinie */}
              <tr><td colSpan={6} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.12)' }} /></tr>

              {/* Total GK */}
              <tr>
                <td className="px-3 py-3 font-bold" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)' }}>
                  Total Gemeinkosten
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)' }}>
                  {fmt(TOTAL_GK.reduce((s, v) => s + v, 0))}
                </td>
                {TOTAL_GK.map((v, ci) => (
                  <td key={ci} className="px-3 py-3 text-right font-mono font-bold"
                    style={{ ...tdL, color: KS_COLOR[ci], background: 'rgba(255,255,255,0.02)' }}>
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ══ SCHRITT 2 — Zuschlagssätze ════════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-3">

          {/* ZS-Kacheln */}
          {selCol === null ? (
            <div className="grid grid-cols-2 gap-3">
              {KS.map((ks, ci) => {
                const isStunden = ci === 1 || ci === 2
                return (
                  <button key={ci} onClick={() => setSelCol(ci)}
                    className="p-4 rounded-xl text-left transition-all hover:brightness-125 space-y-2"
                    style={{ background: KS_BG_LO[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: KS_COLOR[ci] }}>{ks}</div>
                    {isStunden ? (
                      <div>
                        <div className="font-mono font-bold text-lg" style={{ color: KS_COLOR[ci] }}>
                          CHF {FGK_ZS_CHF}.–
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>pro Einzellohnstunde</div>
                      </div>
                    ) : ci === 0 ? (
                      <div>
                        <div className="font-mono font-bold text-lg" style={{ color: KS_COLOR[ci] }}>{MGK_ZS_PCT} %</div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>der MEK</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-mono font-bold text-lg" style={{ color: KS_COLOR[ci] }}>{VV_ZS_PCT} %</div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>der Herstellkosten</div>
                      </div>
                    )}
                    <div className="text-[9px] px-2 py-0.5 rounded-full w-fit" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      → anklicken
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <ZSFormelPanel ci={selCol} onClose={() => setSelCol(null)} />
          )}

          {/* Hinweis-Box */}
          {selCol === null && (
            <div className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <span className="text-sm mt-0.5">⚠️</span>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                <strong className="text-red-300">Wichtig:</strong> Der Fertigungs-GK-Satz wird <strong className="text-red-300">nicht in Prozent</strong>, sondern in <strong className="text-red-300">CHF pro Einzellohnstunde</strong> angegeben. Grund: Maschinen- und Lohnzeiten sind die bessere Bezugsgrösse als der Lohnbetrag.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══ SCHRITT 3 — Einzelkalkulation ═════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-3">

          {/* Auftrags-Info */}
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Auftrag</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Beispiel-Auftrag</div>
            </div>
            <Chip label="MEK" val={`CHF ${fmt(B_MEK)}`} color={KS_COLOR[0]} />
            <Chip label="Einzellohnstunden" val={`${B_ELH} h à CHF ${B_LOHN}.–/h`} color={KS_COLOR[1]} />
          </div>

          {/* Kalkulationsschema */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left px-4 py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Position</th>
                  <th className="text-right px-4 py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>CHF</th>
                  <th className="text-right px-4 py-2 font-semibold hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Berechnung</th>
                </tr>
              </thead>
              <tbody>

                {/* ── Materialkosten ── */}
                <SectionHeader label="Materialkosten" color={KS_COLOR[0]} />
                <KRow label="Materialeinzelkosten (MEK)"                      val={B_MEK}   color="var(--text-secondary)" />
                <KRow label={`+ Materialgemeinkosten (${MGK_ZS_PCT} % × MEK)`} val={B_MGK}   color={KS_COLOR[0]}  calc={`${MGK_ZS_PCT} % × ${fmt(B_MEK)}`} />
                <KSumRow label="= Materialkosten" val={B_MATK} color={KS_COLOR[0]} />

                {/* ── Fertigungskosten ── */}
                <SectionHeader label="Fertigungskosten" color={KS_COLOR[1]} />
                <KRow label={`Fertigungseinzelkosten (FEK)  ${B_ELH} h × CHF ${B_LOHN}.–`} val={B_FEK}  color="var(--text-secondary)" calc={`${B_ELH} h × ${fmt(B_LOHN)}`} />
                <KRow label={`+ Fertigungs-GK  ${B_ELH} h × CHF ${FGK_ZS_CHF}.–`}          val={B_FGK}  color={KS_COLOR[1]}            calc={`${B_ELH} h × ${FGK_ZS_CHF}`} />
                <KSumRow label="= Fertigungskosten" val={B_FERTK} color={KS_COLOR[1]} />

                {/* ── Herstellkosten ── */}
                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.12)' }}>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>
                    = Herstellkosten (HK)
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sm" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>
                    {fmt(B_HK)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)' }}>
                    {fmt(B_MATK)} + {fmt(B_FERTK)}
                  </td>
                </tr>

                {/* ── VV + Selbstkosten ── */}
                <SectionHeader label="Verwaltungs- & Vertriebskosten" color={KS_COLOR[3]} />
                <KRow label={`+ Verw.- & Vertriebs-GK (${VV_ZS_PCT} % × HK)`} val={B_VV} color={KS_COLOR[3]} calc={`${VV_ZS_PCT} % × ${fmt(B_HK)}`} />
                <KSumRow label="= Selbstkosten (SK)" val={B_SK} color={KS_COLOR[3]} />

                {/* ── Reingewinn + Nettoerlös ── */}
                <KRow label={`+ Reingewinn (${RG_ZS_PCT} % × SK)`} val={B_RG} color="#34d399" calc={`${RG_ZS_PCT} % × ${fmt(B_SK)}`} />

                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)' }}>
                  <td className="px-4 py-3.5 font-bold text-sm" style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)' }}>
                    = Nettoerlös (Verkaufspreis netto)
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-base" style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)' }}>
                    {fmt(B_NE)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', background: 'rgba(52,211,153,0.07)' }}>
                    {fmt(B_SK)} + {fmt(B_RG)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* ZS-Legende */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { label: 'MGK-Satz',   val: `${MGK_ZS_PCT} % MEK`,          ci: 0 },
              { label: 'FGK-Satz',   val: `CHF ${FGK_ZS_CHF}.– / Std.`,    ci: 1 },
              { label: 'FGK-Satz',   val: `CHF ${FGK_ZS_CHF}.– / Std.`,    ci: 2 },
              { label: 'VV-Satz',    val: `${VV_ZS_PCT} % HK`,             ci: 3 },
            ] as const).map(({ label, val, ci }, i) => (
              <div key={i} className="p-2.5 rounded-xl"
                style={{ background: KS_BG_LO[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
                <div className="text-[10px] font-semibold mb-0.5" style={{ color: KS_COLOR[ci] }}>{KS[ci]}</div>
                <div className="font-bold text-xs" style={{ color: KS_COLOR[ci] }}>{label}</div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── ZS-Formel-Panel (Schritt 2) ──────────────────────────────────────────────

function ZSFormelPanel({ ci, onClose }: { ci: number; onClose: () => void }) {
  const isStunden = ci === 1 || ci === 2
  const ks = KS[ci]

  return (
    <div className="p-4 rounded-xl space-y-3"
      style={{ background: KS_BG_HI[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: KS_COLOR[ci] }} />
          <span className="text-xs font-bold" style={{ color: KS_COLOR[ci] }}>{ks} — Zuschlagssatz</span>
        </div>
        <button onClick={onClose} className="text-[10px] px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>✕</button>
      </div>

      {!isStunden ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <InfoCard label="Gemeinkosten (GK)" val={`CHF ${fmt(TOTAL_GK[ci])}`} color={KS_COLOR[ci]} />
            <InfoCard label={ci === 0 ? 'Grundlage (MEK)' : 'Grundlage (HK)'} val={`CHF ${fmt(ci === 0 ? MEK : HK_GRUNDLAGE)}`} color="var(--text-primary)" />
            <InfoCard label="Zuschlagssatz" val={`${ci === 0 ? MGK_ZS_PCT : VV_ZS_PCT} %`} color={KS_COLOR[ci]} highlight />
          </div>
          <div className="py-2.5 px-4 rounded-xl text-center font-mono text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {fmt(TOTAL_GK[ci])} ÷ {fmt(ci === 0 ? MEK : HK_GRUNDLAGE)} × 100 ={' '}
            <strong style={{ color: KS_COLOR[ci] }}>{ci === 0 ? MGK_ZS_PCT : VV_ZS_PCT} %</strong>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {ci === 0 && 'Auf jeden Franken Materialeinzelkosten kommen 35 Rappen Materialgemeinkosten.'}
            {ci === 3 && 'Auf jeden Franken Herstellkosten kommen 20 Rappen Verwaltungs- & Vertriebskosten.'}
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <InfoCard label="Gemeinkosten (GK)" val={`CHF ${fmt(TOTAL_GK[ci])}`} color={KS_COLOR[ci]} />
            <InfoCard label="Einzellohnstunden" val={`${ci === 1 ? ELH_I : ELH_II} h`} color="var(--text-primary)" />
            <InfoCard label="GK pro Stunde" val={`CHF ${FGK_ZS_CHF}.–`} color={KS_COLOR[ci]} highlight />
          </div>
          <div className="py-2.5 px-4 rounded-xl text-center font-mono text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {fmt(TOTAL_GK[ci])} ÷ {ci === 1 ? ELH_I : ELH_II} Std. ={' '}
            <strong style={{ color: KS_COLOR[ci] }}>CHF {FGK_ZS_CHF}.– / Std.</strong>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <span className="text-xs">⚠️</span>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Der FGK-Satz ist <strong className="text-red-300">kein Prozentsatz</strong>, sondern ein <strong className="text-red-300">Betrag in CHF pro Einzellohnstunde</strong>.
              Für einen Auftrag mit {B_ELH} Stunden: {B_ELH} × CHF {FGK_ZS_CHF}.– = <strong style={{ color: KS_COLOR[ci] }}>CHF {fmt(B_ELH * FGK_ZS_CHF)}.–</strong>
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Hilfs-Komponenten ────────────────────────────────────────────────────────

function InfoCard({ label, val, color, highlight }: { label: string; val: string; color: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.05)', border: highlight ? `1px solid ${color}33` : '1px solid var(--border-color)' }}>
      <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="font-mono font-bold text-sm" style={{ color }}>{val}</div>
    </div>
  )
}

function Chip({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-xs font-semibold font-mono" style={{ color }}>{val}</div>
    </div>
  )
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <tr>
      <td colSpan={3} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider"
        style={{ color, background: `${color}10`, borderBottom: `1px solid ${color}25` }}>
        {label}
      </td>
    </tr>
  )
}

function KRow({ label, val, color, calc }: { label: string; val: number; color: string; calc?: string }) {
  return (
    <tr>
      <td className="px-4 py-2" style={{ color, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{label}</td>
      <td className="px-4 py-2 text-right font-mono" style={{ color, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{fmt(val)}</td>
      <td className="px-4 py-2 font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{calc ?? ''}</td>
    </tr>
  )
}

function KSumRow({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <td className="px-4 py-2 font-bold" style={{ color, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{label}</td>
      <td className="px-4 py-2 text-right font-mono font-bold" style={{ color, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{fmt(val)}</td>
      <td className="px-4 py-2 hidden sm:table-cell" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
    </tr>
  )
}

