'use client'
import { useState } from 'react'

// ─── Daten (realistisches Schweizer FRW-Beispiel) ─────────────────────────────
//
//  Kostenstellen: Material | Fertigung I | Fertigung II | Verw. & Vertrieb
//  Zuschlagsgrundlage: MEK   | FEK I       | FEK II        | Herstellkosten (HK)

const KS = ['Material', 'Fertigung I', 'Fertigung II', 'Verw. & Vertrieb'] as const
const KS_SHORT = ['Mat.', 'Fert. I', 'Fert. II', 'VV']
const KS_COLOR  = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24']
const KS_BG_HI  = ['rgba(96,165,250,0.14)', 'rgba(52,211,153,0.14)', 'rgba(167,139,250,0.14)', 'rgba(251,191,36,0.14)']
const KS_BG_LO  = ['rgba(96,165,250,0.06)', 'rgba(52,211,153,0.06)', 'rgba(167,139,250,0.06)', 'rgba(251,191,36,0.06)']
const KS_BORDER = ['rgba(96,165,250,0.25)', 'rgba(52,211,153,0.25)', 'rgba(167,139,250,0.25)', 'rgba(251,191,36,0.25)']

// Gemeinkosten je Kostenstelle [Material, Fert.I, Fert.II, VV]
const KOSTENARTEN = [
  { label: 'Hilfs-/Betriebsstoffe', values: [3_600,      0,      0,     0], color: '#60a5fa' },
  { label: 'Personalkosten',        values: [1_200,  5_600,  4_200, 3_800], color: '#34d399' },
  { label: 'Raumkosten',            values: [  800,  3_200,  1_600, 2_400], color: '#a78bfa' },
  { label: 'Energie',               values: [  200,    600,    400,   200], color: '#fb923c' },
  { label: 'Abschreibungen',        values: [  400,  2_100,  1_800,   400], color: '#f87171' },
  { label: 'Übrige Kosten',         values: [  300,    500,    400,   600], color: '#94a3b8' },
]

// Total GK: [6'500, 12'000, 8'400, 7'400] → Summe = 34'300
const TOTAL_GK = KS.map((_, ci) => KOSTENARTEN.reduce((s, ka) => s + ka.values[ci], 0))
// [6500, 12000, 8400, 7400]

// Einzelkosten (Zuschlagsgrundlage)
const MEK   = 18_600  // Materialeinzelkosten
const FEK_I  = 24_000  // Fertigungseinzelkosten Fert. I
const FEK_II = 21_000  // Fertigungseinzelkosten Fert. II

// Herstellkosten = MEK + GK-Mat + FEK I + GK-Fert I + FEK II + GK-Fert II
const HK = MEK + TOTAL_GK[0] + FEK_I + TOTAL_GK[1] + FEK_II + TOTAL_GK[2]
// = 18600 + 6500 + 24000 + 12000 + 21000 + 8400 = 90'500

const GRUNDLAGEN = [MEK, FEK_I, FEK_II, HK]
const GRUNDL_LABEL = ['MEK', 'FEK I', 'FEK II', 'HK']
const GRUNDL_FULL  = [`MEK ${fmt(MEK)}`, `FEK I ${fmt(FEK_I)}`, `FEK II ${fmt(FEK_II)}`, `HK ${fmt(HK)}`]

// ZS = GK / Grundlage × 100
const ZS = TOTAL_GK.map((gk, ci) => gk / GRUNDLAGEN[ci] * 100)
// [34.95%, 50%, 40%, 8.18%]

const ZS_NAME = ['MGK-Satz', 'FGK-Satz I', 'FGK-Satz II', 'VV-Satz']
const ZS_ERKL = [
  'Pro Franken MEK fallen 35 Rappen Materialgemeinkosten an.',
  'Pro Franken FEK fallen 50 Rappen Fertigungsgemeinkosten (Stätte I) an.',
  'Pro Franken FEK fallen 40 Rappen Fertigungsgemeinkosten (Stätte II) an.',
  'Pro Franken Herstellkosten fallen ~8 Rappen Verwaltungs- & Vertriebskosten an.',
]

// ─── Einzelkalkulation (Beispielprodukt) ─────────────────────────────────────
const EK_MEK    = 600
const EK_FEK_I  = 800
const EK_FEK_II = 500
const EK_MGK    = Math.round(EK_MEK   * ZS[0] / 100)   // ~210
const EK_FGK_I  = Math.round(EK_FEK_I  * ZS[1] / 100)  // 400
const EK_FGK_II = Math.round(EK_FEK_II * ZS[2] / 100)  // 200
const EK_MATK   = EK_MEK + EK_MGK                       // Materialkosten
const EK_FERTK  = EK_FEK_I + EK_FGK_I + EK_FEK_II + EK_FGK_II  // Fertigungskosten
const EK_HK     = EK_MATK + EK_FERTK                    // Herstellkosten
const EK_VV     = Math.round(EK_HK * ZS[3] / 100)      // VV-GK
const EK_SK     = EK_HK + EK_VV                         // Selbstkosten
const EK_RG     = Math.round(EK_SK * 0.25)              // Reingewinn 25%
const EK_NE     = EK_SK + EK_RG                         // Nettoerlös

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n === 0) return '–'
  return Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

// ─── Schritte ─────────────────────────────────────────────────────────────────

const STEP_STYLE = [
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.28)'  },
  { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.28)'  },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.28)'  },
]
const STEP_LABELS = ['GK verteilen', 'Zuschlagssatz', 'Einzelkalkulation']
const STEP_ICONS  = ['📊', '🧮', '🏷️']
const STEP_DESC   = [
  'Die Gemeinkosten (GK) werden direkt den Kostenstellen zugeordnet. Fahre über eine Zeile, um die Verteilung zu sehen.',
  'Der Zuschlagssatz (ZS) = GK ÷ Zuschlagsgrundlage × 100. Klicke eine Kostenstelle an, um die Formel zu sehen.',
  'Mit den ZS wird der Nettoerlös für ein Produkt berechnet — von den Einzelkosten bis zum Verkaufspreis.',
]

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function BABVisual() {
  const [step,   setStep]   = useState(0)
  const [selCol, setSelCol] = useState<number | null>(null)
  const [hovRow, setHovRow] = useState<number | null>(null)

  const showZS   = step >= 1
  const showKalk = step >= 2

  function goStep(s: number) { setStep(s); setSelCol(null) }

  const tdBase: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.12s, color 0.12s' }
  const tdL:    React.CSSProperties = { ...tdBase, borderLeft: '1px solid var(--border-color)' }

  return (
    <div className="space-y-5">

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
        <span className="text-xl leading-none mt-0.5">📋</span>
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            Betriebsabrechnungsbogen (BAB)
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Der BAB verteilt die <strong style={{ color: 'var(--text-secondary)' }}>Gemeinkosten (GK)</strong> auf die vier Kostenstellen und berechnet daraus die <strong style={{ color: 'var(--text-secondary)' }}>Zuschlagssätze</strong> — Grundlage für die Kalkulation des Verkaufspreises.
          </p>
        </div>
      </div>

      {/* ── Schritte ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {STEP_LABELS.map((label, i) => {
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
        <span className="text-base leading-none mt-0.5">{STEP_ICONS[step]}</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {STEP_DESC[step]}
        </p>
      </div>

      {/* ── BAB-Tabelle (Schritt 1 + 2) ───────────────────────────────── */}
      {!showKalk && (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
          <table className="w-full text-xs border-collapse" style={{ minWidth: '520px' }}>
            <thead>
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', minWidth: '150px' }}>
                  Kostenart
                </th>
                <th className="text-right px-3 py-2.5 font-semibold"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', minWidth: '70px' }}>
                  Total
                </th>
                {KS.map((ks, ci) => (
                  <th key={ci}
                    onClick={() => showZS && setSelCol(selCol === ci ? null : ci)}
                    className="text-right px-3 py-2.5 font-semibold transition-all"
                    style={{
                      color: KS_COLOR[ci],
                      background: selCol === ci ? KS_BG_HI[ci] : 'rgba(255,255,255,0.03)',
                      borderBottom: `1px solid ${selCol === ci ? KS_BORDER[ci] : 'var(--border-color)'}`,
                      borderLeft: '1px solid var(--border-color)',
                      cursor: showZS ? 'pointer' : 'default',
                      minWidth: '80px',
                    }}>
                    <span className="block">{ks}</span>
                    {showZS && <span className="block text-[9px] font-normal opacity-40 mt-0.5">↓ anklicken</span>}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* GK-Zeilen */}
              {KOSTENARTEN.map((ka, ri) => {
                const total = ka.values.reduce((s, v) => s + v, 0)
                return (
                  <tr key={ri} onMouseEnter={() => setHovRow(ri)} onMouseLeave={() => setHovRow(null)}>
                    <td className="px-3 py-2.5" style={{ ...tdBase, color: 'var(--text-secondary)' }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 mb-0.5 shrink-0" style={{ background: ka.color }} />
                      {ka.label}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold"
                      style={{ ...tdBase, color: 'var(--text-primary)' }}>
                      {fmt(total)}
                    </td>
                    {ka.values.map((v, ci) => (
                      <td key={ci} className="px-3 py-2.5 text-right font-mono"
                        style={{
                          ...tdL,
                          color: hovRow === ri && v > 0 ? KS_COLOR[ci] : (v === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)'),
                          background: hovRow === ri ? KS_BG_LO[ci] : (selCol === ci ? KS_BG_HI[ci] : 'transparent'),
                          fontWeight: hovRow === ri && v > 0 ? 600 : 400,
                        }}>
                        {fmt(v)}
                      </td>
                    ))}
                  </tr>
                )
              })}

              {/* Trennlinie */}
              <tr><td colSpan={6} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.10)' }} /></tr>

              {/* Total GK */}
              <tr>
                <td className="px-3 py-2.5 font-bold" style={{ ...tdBase, color: 'var(--text-primary)' }}>
                  Total Gemeinkosten (GK)
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-bold"
                  style={{ ...tdBase, color: 'var(--text-primary)' }}>
                  {fmt(TOTAL_GK.reduce((s, v) => s + v, 0))}
                </td>
                {TOTAL_GK.map((v, ci) => (
                  <td key={ci} className="px-3 py-2.5 text-right font-mono font-bold"
                    style={{ ...tdL, color: KS_COLOR[ci], background: selCol === ci ? KS_BG_HI[ci] : 'rgba(255,255,255,0.02)' }}>
                    {fmt(v)}
                  </td>
                ))}
              </tr>

              {/* ZS-Zeilen nur in Schritt 2 */}
              {showZS && (
                <>
                  <tr><td colSpan={6} style={{ padding: 0, borderBottom: '2px solid rgba(255,255,255,0.08)' }} /></tr>

                  {/* Zuschlagsgrundlage */}
                  <tr>
                    <td className="px-3 py-2 italic" style={{ ...tdBase, color: 'var(--text-muted)', fontSize: '11px' }}>
                      Zuschlagsgrundlage
                    </td>
                    <td className="px-3 py-2 text-right" style={{ ...tdBase, color: 'var(--text-muted)', fontSize: '11px' }}>–</td>
                    {GRUNDLAGEN.map((g, ci) => (
                      <td key={ci} onClick={() => setSelCol(selCol === ci ? null : ci)}
                        className="px-3 py-2 text-right leading-snug"
                        style={{ ...tdL, color: selCol === ci ? KS_COLOR[ci] : 'var(--text-muted)', background: selCol === ci ? KS_BG_HI[ci] : 'transparent', cursor: 'pointer', fontSize: '10px' }}>
                        <span className="block font-semibold">{GRUNDL_LABEL[ci]}</span>
                        <span className="block opacity-60">{fmt(g)}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Zuschlagssatz */}
                  <tr>
                    <td className="px-3 py-3 font-bold" style={{ color: 'var(--text-primary)', background: 'rgba(52,211,153,0.04)' }}>
                      Zuschlagssatz (ZS)
                    </td>
                    <td className="px-3 py-3 text-right" style={{ color: 'var(--text-muted)', background: 'rgba(52,211,153,0.04)' }}>–</td>
                    {ZS.map((z, ci) => (
                      <td key={ci} onClick={() => setSelCol(selCol === ci ? null : ci)}
                        className="px-3 py-3 text-right font-mono font-bold transition-all"
                        style={{
                          ...tdL,
                          color: selCol === ci ? KS_COLOR[ci] : '#34d399',
                          background: selCol === ci ? KS_BG_HI[ci] : 'rgba(52,211,153,0.04)',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}>
                        {z.toFixed(2)} %
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ZS-Übersicht (Schritt 2, kein Column ausgewählt) ─────────── */}
      {showZS && !showKalk && selCol === null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KS.map((ks, ci) => (
            <button key={ci} onClick={() => setSelCol(ci)}
              className="p-3 rounded-xl text-left transition-all hover:brightness-125"
              style={{ background: KS_BG_LO[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: KS_COLOR[ci] }}>{ks}</div>
              <div className="font-mono font-bold text-sm" style={{ color: KS_COLOR[ci] }}>{ZS[ci].toFixed(2)} %</div>
              <div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{ZS_NAME[ci]}</div>
            </button>
          ))}
        </div>
      )}

      {/* ── ZS-Formel-Panel (Schritt 2, Column ausgewählt) ───────────── */}
      {showZS && !showKalk && selCol !== null && (
        <div className="p-4 rounded-xl space-y-3"
          style={{ background: KS_BG_HI[selCol], border: `1px solid ${KS_BORDER[selCol]}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: KS_COLOR[selCol] }} />
              <span className="text-xs font-bold" style={{ color: KS_COLOR[selCol] }}>
                {KS[selCol]} — {ZS_NAME[selCol]}
              </span>
            </div>
            <button onClick={() => setSelCol(null)}
              className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Gemeinkosten (GK)', val: fmt(TOTAL_GK[selCol]), valColor: KS_COLOR[selCol] },
              { label: `Grundlage (${GRUNDL_LABEL[selCol]})`, val: fmt(GRUNDLAGEN[selCol]), valColor: 'var(--text-primary)' },
              { label: 'Zuschlagssatz', val: ZS[selCol].toFixed(2) + ' %', valColor: KS_COLOR[selCol] },
            ].map(({ label, val, valColor }) => (
              <div key={label} className="p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="font-mono font-bold text-sm" style={{ color: valColor }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="py-2.5 px-4 rounded-xl text-center font-mono text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {fmt(TOTAL_GK[selCol])} ÷ {fmt(GRUNDLAGEN[selCol])} × 100 = <strong style={{ color: KS_COLOR[selCol] }}>{ZS[selCol].toFixed(2)} %</strong>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs mt-0.5">💡</span>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{ZS_ERKL[selCol]}</p>
          </div>
        </div>
      )}

      {/* ── Einzelkalkulation (Schritt 3) ────────────────────────────── */}
      {showKalk && (
        <div className="space-y-3">

          {/* Beispielprodukt-Info */}
          <div className="p-3 rounded-xl flex flex-wrap gap-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Beispielprodukt</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Auftrag Nr. 847</div>
            </div>
            {[
              { label: 'MEK', val: `CHF ${fmt(EK_MEK)}` },
              { label: 'FEK Fert. I', val: `CHF ${fmt(EK_FEK_I)}` },
              { label: 'FEK Fert. II', val: `CHF ${fmt(EK_FEK_II)}` },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{val}</div>
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
                  <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Berechnung</th>
                </tr>
              </thead>
              <tbody>
                {/* Materialkosten-Block */}
                <KalkRow label="Materialeinzelkosten (MEK)"       val={EK_MEK}   indent={false} color={KS_COLOR[0]} />
                <KalkRow label={`+ Materialgemeinkosten (${ZS[0].toFixed(2)} % × MEK)`} val={EK_MGK} indent={true} color={KS_COLOR[0]} calc={`${ZS[0].toFixed(2)} % × ${fmt(EK_MEK)}`} />
                <KalkSumRow label="= Materialkosten" val={EK_MATK} color={KS_COLOR[0]} />

                {/* Fertigungskosten-Block */}
                <KalkRow label="Fertigungseinzelkosten I (FEK I)"  val={EK_FEK_I}  indent={false} color={KS_COLOR[1]} />
                <KalkRow label={`+ FGK I (${ZS[1].toFixed(2)} % × FEK I)`}         val={EK_FGK_I}  indent={true}  color={KS_COLOR[1]} calc={`${ZS[1].toFixed(2)} % × ${fmt(EK_FEK_I)}`} />
                <KalkRow label="Fertigungseinzelkosten II (FEK II)" val={EK_FEK_II} indent={false} color={KS_COLOR[2]} />
                <KalkRow label={`+ FGK II (${ZS[2].toFixed(2)} % × FEK II)`}       val={EK_FGK_II} indent={true}  color={KS_COLOR[2]} calc={`${ZS[2].toFixed(2)} % × ${fmt(EK_FEK_II)}`} />
                <KalkSumRow label="= Fertigungskosten" val={EK_FERTK} color={KS_COLOR[1]} />

                {/* Herstellkosten */}
                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.10)' }}>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>
                    = Herstellkosten (HK)
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sm" style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)' }}>
                    {fmt(EK_HK)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)' }}>
                    {fmt(EK_MATK)} + {fmt(EK_FERTK)}
                  </td>
                </tr>

                {/* VV-GK */}
                <KalkRow label={`+ Verw.- & Vertriebs-GK (${ZS[3].toFixed(2)} % × HK)`} val={EK_VV} indent={true} color={KS_COLOR[3]} calc={`${ZS[3].toFixed(2)} % × ${fmt(EK_HK)}`} />
                <KalkSumRow label="= Selbstkosten (SK)" val={EK_SK} color={KS_COLOR[3]} />

                {/* Reingewinn + Nettoerlös */}
                <KalkRow label="+ Reingewinn (25 % × SK)" val={EK_RG} indent={true} color="#34d399" calc={`25 % × ${fmt(EK_SK)}`} />

                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)' }}>
                  <td className="px-4 py-3.5 font-bold" style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)' }}>
                    = Nettoerlös (Verkaufspreis)
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-base" style={{ color: '#34d399', background: 'rgba(52,211,153,0.07)' }}>
                    {fmt(EK_NE)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', background: 'rgba(52,211,153,0.07)' }}>
                    {fmt(EK_SK)} + {fmt(EK_RG)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ZS-Legende */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {KS.map((ks, ci) => (
              <div key={ci} className="p-2.5 rounded-xl"
                style={{ background: KS_BG_LO[ci], border: `1px solid ${KS_BORDER[ci]}` }}>
                <div className="text-[10px] font-semibold mb-0.5" style={{ color: KS_COLOR[ci] }}>{ks}</div>
                <div className="font-mono font-bold text-xs" style={{ color: KS_COLOR[ci] }}>{ZS[ci].toFixed(2)} % {ci < 2 ? `(${GRUNDL_LABEL[ci]})` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Hilfs-Komponenten Kalkulation ────────────────────────────────────────────

function KalkRow({ label, val, indent, color, calc }: { label: string; val: number; indent: boolean; color: string; calc?: string }) {
  return (
    <tr>
      <td className="px-4 py-2" style={{ color: indent ? color : 'var(--text-secondary)', paddingLeft: indent ? 28 : 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {label}
      </td>
      <td className="px-4 py-2 text-right font-mono" style={{ color: indent ? color : 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {fmt(val)}
      </td>
      <td className="px-4 py-2 font-mono text-[10px] hidden sm:table-cell" style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {calc ?? ''}
      </td>
    </tr>
  )
}

function KalkSumRow({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <td className="px-4 py-2 font-semibold" style={{ color, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {label}
      </td>
      <td className="px-4 py-2 text-right font-mono font-semibold" style={{ color, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {fmt(val)}
      </td>
      <td className="px-4 py-2 hidden sm:table-cell" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
    </tr>
  )
}
