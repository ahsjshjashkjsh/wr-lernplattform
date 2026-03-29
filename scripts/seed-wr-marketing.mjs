import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

// ─── helpers ────────────────────────────────────────────────────────────────

async function insertTopic(slug, title, description, examType, category, color, icon, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       description=EXCLUDED.description,
       icon=EXCLUDED.icon,
       color=EXCLUDED.color,
       "examType"=EXCLUDED."examType",
       category=EXCLUDED.category,
       "order"=EXCLUDED."order",
       "updatedAt"=NOW()`,
    [topicId, slug, title, description, icon, color, examType, category, order]
  )
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=EXCLUDED.title,
       subtitle=EXCLUDED.subtitle,
       summary=EXCLUDED.summary,
       "contentStatus"=EXCLUDED."contentStatus",
       "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function addQuiz(chId, questions) {
  // delete options first (FK), then questions
  const qRows = await client.query(`SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (const row of qRows.rows)
    await client.query(`DELETE FROM "QuizOption" WHERE "questionId"=$1`, [row.id])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])

  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1]
    )
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1]
      )
  }
}

// ─── Topic ───────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'wr-marketing',
  'Marketing',
  'Marketing ist die kundenorientierte Ausrichtung des gesamten Unternehmens. Es verbindet Marktanalyse, Zielmarktbestimmung und den Marketing-Mix (4 P) zu einem kohärenten Konzept der Marktbearbeitung.',
  'both',
  'bwl',
  'blue',
  'TrendingUp',
  50
)

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 1: Marktuntersuchung, Marktziele & Segmentierung
// ══════════════════════════════════════════════════════════════════════════════

const ch1 = await insertChapter(
  tId,
  'marketing-marktuntersuchung-segmentierung',
  'Marktuntersuchung, Marktziele & Segmentierung',
  'Marktforschung, Marktsegmente, Marktgrössen und Zielmarktbestimmung',
  1,
  `Marketing beantwortet die Frage: „Wie bringen wir welche Leistung an den Markt?" Es ist nicht bloss Werbung, sondern kundenorientiertes Denken, Entscheiden und Handeln im ganzen Unternehmen.

MARKTUNTERSUCHUNG:
• Markterkundung: unsystematisch, oft beiläufig — liefert Orientierung, aber wenig verlässliche Entscheidungsgrundlagen
• Marktforschung: systematisch, methodisch, wissenschaftlich — liefert belastbare Entscheidungsgrundlagen
→ Primäre Marktforschung (Field Research): direkte Datenerhebung, z.B. Befragung oder Produkttest
→ Sekundäre Marktforschung (Desk Research): Nutzung vorhandener interner oder externer Daten

MARKTSEGMENTIERUNG:
Aufteilung des Gesamtmarkts in homogene Kundengruppen (Segmente). Ziel: gezieltere Bearbeitung und effizienter Ressourceneinsatz.
• Geografisch: Region, Stadt/Land, Klima, Sprache
• Demografisch: Alter, Geschlecht, Einkommen, Bildung, Beruf, Haushaltsgrösse
• Verhaltensorientiert: Kaufanlass, Nutzungsintensität, Preisempfindlichkeit, Lebensstil

MARKTGRÖSSEN:
• Marktpotenzial: theoretisch maximal möglicher Absatz (Obergrenze)
• Marktvolumen: effektiv realisierter Absatz in einer Periode
• Marktanteil: Unternehmensumsatz / Marktvolumen
• Marktsättigungsgrad: Marktvolumen / Marktpotenzial

FORMELN:
→ Marktanteil = Unternehmensumsatz ÷ Marktvolumen
→ Marktsättigungsgrad = Marktvolumen ÷ Marktpotenzial
→ Sättigungsgrad > 100 % deutet auf fehlerhafte Marktannahme hin`
)

await addGoals(ch1, [
  'Du kennst den Unterschied zwischen Markterkundung und Marktforschung.',
  'Du kannst primäre und sekundäre Marktforschung voneinander abgrenzen und je ein Beispiel nennen.',
  'Du kannst erklären, was Marktsegmentierung bedeutet und welche Segmentierungskriterien es gibt.',
  'Du kennst die vier Marktgrössen (Marktpotenzial, Marktvolumen, Marktanteil, Marktsättigungsgrad) und kannst sie berechnen.',
  'Du kannst beurteilen, welche Segmente für ein Unternehmen attraktiv sind.',
  'Du weisst, warum systematische Marktuntersuchung die Grundlage für alle Marketingentscheidungen bildet.',
])

await addTerms(ch1, [
  ['Markterkundung', 'Unsystematische, oft beiläufige Informationsgewinnung über Märkte. Liefert Orientierung, aber keine belastbaren Entscheidungsgrundlagen.'],
  ['Marktforschung', 'Systematische, methodisch geplante Untersuchung mit wissenschaftlichen Methoden. Liefert konkrete, verlässliche Antworten auf definierte Fragestellungen.'],
  ['Primäre Marktforschung (Field Research)', 'Direkte Erhebung neuer Daten im Feld (z.B. Befragung, Beobachtung, Testmarkt). Eingesetzt wenn noch keine geeigneten Daten vorhanden sind.'],
  ['Sekundäre Marktforschung (Desk Research)', 'Nutzung bereits vorhandener Daten aus internen Quellen (z.B. Rechnungswesen, Kundendaten) oder externen Quellen (z.B. Branchenverbände, Statistiken).'],
  ['Marktsegmentierung', 'Aufteilung des Gesamtmarkts in homogene Teilgruppen nach geografischen, demografischen oder verhaltensorientierten Merkmalen. Ziel: gezieltere Marktbearbeitung.'],
  ['Marktpotenzial', 'Theoretisch maximal möglicher Absatz oder Umsatz in einem Markt. Stellt die Obergrenze dar, an der das Marktvolumen gemessen wird.'],
  ['Marktvolumen', 'Effektiv realisierter Absatz oder Umsatz eines Marktes in einer bestimmten Periode. Liegt immer unter oder auf Höhe des Marktpotenzials.'],
  ['Marktanteil', 'Anteil des eigenen Unternehmens am Marktvolumen. Berechnung: Unternehmensumsatz ÷ Marktvolumen (× 100 für %).'],
  ['Marktsättigungsgrad', 'Verhältnis von Marktvolumen zu Marktpotenzial. Zeigt, wie weit ein Markt ausgeschöpft ist. Berechnung: Marktvolumen ÷ Marktpotenzial.'],
  ['Zielmarkt', 'Der Markt oder die Marktsegmente, auf die sich ein Unternehmen ausrichtet. Ergebnis der Marktanalyse und bewussten Segmentauswahl.'],
])

await addPoints(ch1, [
  'Marktforschung ist systematisch und methodisch — Markterkundung ist beiläufig und unscharf.',
  'Primäre Marktforschung erhebt neue Daten direkt; sekundäre nutzt vorhandene Quellen.',
  'Segmentierung gliedert den Markt nach geografischen, demografischen oder verhaltensorientierten Merkmalen.',
  'Nicht jedes Segment muss bearbeitet werden — Grösse, Konkurrenz und eigene Ressourcen entscheiden.',
  'Marktpotenzial ist theoretisch; Marktvolumen ist tatsächlich — das Potenzial ist immer die Obergrenze.',
  'Marktanteil = Unternehmensumsatz ÷ Marktvolumen.',
  'Marktsättigungsgrad = Marktvolumen ÷ Marktpotenzial.',
  'Ein Sättigungsgrad über 100 % deutet auf eine fehlerhafte Marktdefinition hin.',
  'Marktuntersuchungen sind die Entscheidungsgrundlage für alle weiteren Marketingentscheidungen.',
]
)

await addQuiz(ch1, [
  {
    q: 'Was unterscheidet Marktforschung von Markterkundung?',
    opts: [
      ['Marktforschung ist systematisch und methodisch geplant; Markterkundung ist beiläufig und unsystematisch.', true],
      ['Marktforschung ist günstiger und schneller als Markterkundung.', false],
      ['Markterkundung liefert immer zuverlässigere Daten als Marktforschung.', false],
      ['Marktforschung betrifft nur externe Märkte; Markterkundung interne Abläufe.', false],
    ],
    exp: 'Marktforschung folgt wissenschaftlichen Methoden und liefert belastbare Entscheidungsgrundlagen. Markterkundung ist unsystematisch und dient eher der Orientierung.',
    diff: 'easy',
  },
  {
    q: 'Ein Unternehmen befragt 500 Kunden direkt, um Zahlungsbereitschaft für ein neues Produkt zu ermitteln. Welche Methode ist das?',
    opts: [
      ['Primäre Marktforschung (Field Research)', true],
      ['Sekundäre Marktforschung (Desk Research)', false],
      ['Markterkundung', false],
      ['Portfolioanalyse', false],
    ],
    exp: 'Bei primärer Marktforschung werden neue Daten direkt erhoben, z.B. durch Befragungen. Das Gegenteil ist die sekundäre Forschung, die vorhandene Daten auswertet.',
    diff: 'easy',
  },
  {
    q: 'Ein Markt hat ein Potenzial von CHF 10 Mio. Das Marktvolumen beträgt CHF 7 Mio. Ein Unternehmen erzielt CHF 1.4 Mio. Umsatz. Wie hoch ist der Marktanteil?',
    opts: [
      ['20 %', true],
      ['14 %', false],
      ['70 %', false],
      ['10 %', false],
    ],
    exp: 'Marktanteil = Unternehmensumsatz ÷ Marktvolumen = 1.4 ÷ 7 = 0.2 = 20 %. Der Marktsättigungsgrad beträgt 7 ÷ 10 = 70 %.',
    diff: 'medium',
  },
  {
    q: 'Welche Segmentierungsmerkmale sind verhaltensorientiert?',
    opts: [
      ['Kaufanlass, Nutzungsintensität, Preisempfindlichkeit', true],
      ['Alter, Geschlecht, Einkommen', false],
      ['Region, Klima, Sprache', false],
      ['Bildung, Beruf, Zivilstand', false],
    ],
    exp: 'Verhaltensorientierte Merkmale beschreiben das Kaufverhalten: Kaufanlass, Nutzungsintensität, Preisempfindlichkeit, Lebensstil. Demografische Merkmale sind Alter, Geschlecht usw.; geografische betreffen Ort und Region.',
    diff: 'medium',
  },
  {
    q: 'Das Marktvolumen übersteigt das Marktpotenzial. Was bedeutet das?',
    opts: [
      ['Die zugrunde liegende Marktdefinition ist fehlerhaft und muss überprüft werden.', true],
      ['Das Unternehmen hat einen sehr hohen Marktanteil.', false],
      ['Der Markt ist noch nicht gesättigt.', false],
      ['Die Nachfrage ist preisunelastisch.', false],
    ],
    exp: 'Das Marktpotenzial ist die theoretische Obergrenze. Wenn das Marktvolumen darüber liegt, stimmt die Marktdefinition nicht — z.B. ist der Markt zu eng oder zu weit gefasst.',
    diff: 'medium',
  },
  {
    q: 'Warum ist Marktsegmentierung für Unternehmen sinnvoll?',
    opts: [
      ['Weil ähnliche Kunden gezielter angesprochen und Ressourcen effizienter eingesetzt werden können.', true],
      ['Weil dadurch das Marktpotenzial automatisch steigt.', false],
      ['Weil Segmentierung den Marktsättigungsgrad senkt.', false],
      ['Weil sekundäre Marktforschung dann entfällt.', false],
    ],
    exp: 'Segmentierung erlaubt, Angebote und Kommunikation gezielt auf homogene Kundengruppen auszurichten. Ressourcen werden dort eingesetzt, wo der Fit am besten ist.',
    diff: 'easy',
  },
  {
    q: 'Welche der folgenden ist eine interne Quelle für sekundäre Marktforschung?',
    opts: [
      ['Umsatzdaten aus dem Rechnungswesen des eigenen Unternehmens', true],
      ['Branchenberichte eines Verbands', false],
      ['Staatliche Statistiken des Bundesamts für Statistik', false],
      ['Direkte Kundenbefragung', false],
    ],
    exp: 'Sekundäre Marktforschung nutzt vorhandene Daten. Interne Quellen stammen aus dem Unternehmen selbst (z.B. Buchhaltung, Kundendatenbank). Externe Quellen sind Verbände, staatliche Stellen, veröffentlichte Berichte.',
    diff: 'easy',
  },
  {
    q: 'Was beschreibt das Marktpotenzial?',
    opts: [
      ['Den theoretisch maximal möglichen Absatz oder Umsatz in einem Markt.', true],
      ['Den tatsächlichen Absatz aller Anbieter in einer Periode.', false],
      ['Den Anteil des Unternehmens am Marktvolumen.', false],
      ['Den Grad, zu dem ein Markt bereits gesättigt ist.', false],
    ],
    exp: 'Das Marktpotenzial ist die theoretische Obergrenze. Das Marktvolumen ist der tatsächliche Absatz — es liegt immer unter oder auf Höhe des Potenzials.',
    diff: 'easy',
  },
])

// ══════════════════════════════════════════════════════════════════════════════
// KAPITEL 2: Marktstrategien, Portfolio-Modelle & Marketing-Mix
// ══════════════════════════════════════════════════════════════════════════════

const ch2 = await insertChapter(
  tId,
  'marketing-strategien-portfolio-mix',
  'Marktstrategien, Portfolio-Modelle & Marketing-Mix',
  'BCG-Analyse, Ansoff-Portfolio, Produktlebenszyklus und 4-P-Mix',
  2,
  `Aus der Marktanalyse werden Strategien abgeleitet. Diese hängen stark davon ab, ob ein Markt gesättigt oder nicht gesättigt ist.

STRATEGIEN IM GESÄTTIGTEN MARKT:
• Fight — Kostenführerschaft/Preiskampf: Effizienzsteigerung (gleicher Output, geringere variable Kosten) oder Kapazitätsreduktion (Fixkosten senken). Grenze: Bei preisunelastischer Nachfrage führt Preissenkung nicht zwingend zu mehr Gewinn.
• Flight — Nischenpolitik/Marktentwicklung: Differenzierung, neue Nachfrage erzeugen, neue Märkte erschliessen.

STRATEGIEN IM NICHT GESÄTTIGTEN MARKT:
• Qualitätsführerschaft: Differenzierung über überlegene Qualität → höhere Zahlungsbereitschaft, weniger direkte Preisvergleichbarkeit.
• Kostenführerschaft möglich, aber weniger Druck als im gesättigten Markt.

BCG-ANALYSE (bestehende Produkte, bestehende Märkte):
Dimensionen: Marktwachstum (vertikal) × relativer Marktanteil (horizontal)
• Question Marks: hohes Wachstum, tiefer relativer Marktanteil
• Stars: hohes Wachstum, hoher relativer Marktanteil
• Cash Cows: tiefes Wachstum, hoher relativer Marktanteil
• Poor Dogs: tiefes Wachstum, tiefer relativer Marktanteil

ANSOFF-PORTFOLIO (Wachstumsstrategien):
Dimensionen: bestehende/neue Produkte × bestehende/neue Märkte
• Marktdurchdringung: bestehendes Produkt, bestehender Markt
• Marktentwicklung: bestehendes Produkt, neuer Markt
• Produktentwicklung: neues Produkt, bestehender Markt
• Produktdiversifikation: neues Produkt, neuer Markt (höchstes Risiko)

PRODUKTLEBENSZYKLUS: Einführung → Wachstum → Reife → Sättigung → Degeneration
Mit jeder Phase ändern sich Umsatz, Gewinn und Konkurrenzdruck → Unternehmen brauchen ein Portfolio mehrerer Produkte.

MARKETING-MIX (4 P):
• Product: Produktgestaltung, Grundnutzen, Zusatznutzen, Sortiment, Qualität, Marke
• Price: Preisniveau, Rabatte, Zahlungsbedingungen (kosten- oder marktorientiert)
• Place: Absatzwege (direkt/indirekt), Absatzorgane, Handelsfunktionen
• Promotion: Werbung (AIDA), Verkaufsförderung, Public Relations`
)

await addGoals(ch2, [
  'Du kannst die Strategien in gesättigten Märkten (Fight/Flight) erklären und ihre Grenzen nennen.',
  'Du kannst die vier Felder der BCG-Analyse benennen und erläutern.',
  'Du kannst die vier Strategien des Ansoff-Portfolios beschreiben und voneinander abgrenzen.',
  'Du kennst die fünf Phasen des Produktlebenszyklus und weisst, warum Unternehmen ein Produktportfolio brauchen.',
  'Du kannst die vier Instrumente des Marketing-Mix (4 P) benennen und erklären.',
  'Du weisst, was die AIDA-Logik besagt und in welchem Bereich des Marketing-Mix sie eingesetzt wird.',
])

await addTerms(ch2, [
  ['Kostenführerschaft', 'Wettbewerbsstrategie, bei der ein Unternehmen durch besonders günstige Kostenstruktur Preisvorteile erlangt. Zwei Wege: Effizienzsteigerung (variable Kosten) oder Kapazitätsreduktion (Fixkosten).'],
  ['Qualitätsführerschaft', 'Wettbewerbsstrategie über überlegene Qualität, Marke oder Nutzen. Führt zu höherer Zahlungsbereitschaft und geringerer Preisvergleichbarkeit. Typisch in nicht gesättigten Märkten.'],
  ['BCG-Analyse', 'Portfolio-Modell für bestehende Produkte in bestehenden Märkten. Dimensionen: Marktwachstum und relativer Marktanteil. Felder: Question Marks, Stars, Cash Cows, Poor Dogs.'],
  ['Ansoff-Portfolio', 'Strategiemodell mit den Dimensionen bestehende/neue Produkte × bestehende/neue Märkte. Strategien: Marktdurchdringung, Marktentwicklung, Produktentwicklung, Produktdiversifikation.'],
  ['Marktdurchdringung', 'Ansoff-Strategie: mehr Absatz mit bestehenden Produkten in bestehenden Märkten. Nutzt vorhandene Marktkenntnis und Infrastruktur ohne neues Entwicklungsrisiko.'],
  ['Produktdiversifikation', 'Ansoff-Strategie: neue Produkte in neuen Märkten. Höchstes Risiko, da weder Produkt noch Markt bekannt sind.'],
  ['Produktlebenszyklus', 'Typischer zeitlicher Verlauf eines Produkts: Einführung, Wachstum, Reife, Sättigung, Degeneration. In jeder Phase ändern sich Umsatz, Gewinn und Wettbewerbsintensität.'],
  ['Marketing-Mix (4 P)', 'Die vier Instrumente der operativen Marktbearbeitung: Product (Produktgestaltung), Price (Preispolitik), Place (Distributionspolitik), Promotion (Kommunikationspolitik). Wirksam nur in abgestimmter Kombination.'],
  ['AIDA', 'Werbewirkungsmodell: Attention (Aufmerksamkeit), Interest (Interesse), Desire (Wunsch), Action (Handlung). Teil der Kommunikationspolitik (Promotion).'],
  ['Direkter vs. indirekter Absatz', 'Direkter Absatz: Hersteller verkauft ohne Zwischenhändler direkt an Endkunden. Indirekter Absatz: Nutzung von Handelsorganen (z.B. Grosshandel, Detailhandel).'],
])

await addPoints(ch2, [
  'Gesättigter Markt: Fight (Kosten senken, Preise anpassen) oder Flight (Nischen, neue Märkte, Differenzierung).',
  'Preissenkung lohnt sich nur, wenn die Nachfrage preiselastisch ist — bei Unelastizität sinkt der Gewinn.',
  'BCG-Analyse: Marktwachstum × relativer Marktanteil → Question Marks, Stars, Cash Cows, Poor Dogs.',
  'Ansoff: bestehend/neu × Produkt/Markt → 4 Strategien (Durchdringung, Marktentwicklung, Produktentwicklung, Diversifikation).',
  'Produktdiversifikation ist die risikoreichste Ansoff-Strategie (alles neu).',
  'Produktlebenszyklus: 5 Phasen — Unternehmen brauchen Portfolio, weil kein Produkt dauerhaft erfolgreich bleibt.',
  'Marketing-Mix: Product, Price, Place, Promotion — nur in abgestimmter Kombination wirksam.',
  'AIDA-Logik (Attention, Interest, Desire, Action) beschreibt die Wirkung von Werbemassnahmen.',
  'Distributionspolitik regelt Absatzwege (direkt/indirekt) und Absatzorgane.',
  'Qualitätsführerschaft erhöht die Zahlungsbereitschaft und reduziert die direkte Preisvergleichbarkeit.',
])

await addQuiz(ch2, [
  {
    q: 'Ein Unternehmen verkauft sein bestehendes Schweizer Produkt neu auch in Deutschland. Welche Ansoff-Strategie ist das?',
    opts: [
      ['Marktentwicklung', true],
      ['Produktentwicklung', false],
      ['Marktdurchdringung', false],
      ['Produktdiversifikation', false],
    ],
    exp: 'Marktentwicklung = bestehendes Produkt in einem neuen Markt. Das Produkt bleibt unverändert, aber der Markt (Deutschland) ist neu. Marktdurchdringung wäre im bestehenden Markt, Produktentwicklung mit neuem Produkt.',
    diff: 'easy',
  },
  {
    q: 'Ein Produkt hat hohes Marktwachstum und einen hohen relativen Marktanteil. Wie wird es in der BCG-Analyse eingeordnet?',
    opts: [
      ['Star', true],
      ['Cash Cow', false],
      ['Question Mark', false],
      ['Poor Dog', false],
    ],
    exp: 'Stars haben hohes Marktwachstum UND hohen relativen Marktanteil. Cash Cows: tiefes Wachstum, hoher Marktanteil. Question Marks: hohes Wachstum, tiefer Anteil. Poor Dogs: beides tief.',
    diff: 'easy',
  },
  {
    q: 'In welcher Phase des Produktlebenszyklus ist typischerweise der höchste Gewinn zu erwarten?',
    opts: [
      ['Reife', true],
      ['Einführung', false],
      ['Degeneration', false],
      ['Wachstum', false],
    ],
    exp: 'In der Reifephase ist das Produkt etabliert, Umsatz auf dem Höhepunkt und Entwicklungskosten amortisiert. In der Einführungsphase überwiegen noch Kosten; in der Degeneration sinkt der Gewinn stark.',
    diff: 'medium',
  },
  {
    q: 'Welche Strategie verfolgt ein Unternehmen im gesättigten Markt, das neue Marktsegmente oder geografische Gebiete erschliesst?',
    opts: [
      ['Flight — Marktentwicklung', true],
      ['Fight — Kostenführerschaft', false],
      ['BCG-Analyse', false],
      ['Produktdiversifikation', false],
    ],
    exp: 'Flight im gesättigten Markt bedeutet dem Verdrängungswettbewerb ausweichen. Marktentwicklung ist eine Flight-Strategie: neue Nachfrage erzeugen oder neue Märkte erschliessen.',
    diff: 'medium',
  },
  {
    q: 'Warum brauchen Unternehmen ein Portfolio aus mehreren Produkten?',
    opts: [
      ['Weil kein Produkt dauerhaft erfolgreich bleibt — der Produktlebenszyklus führt letztlich zur Degeneration.', true],
      ['Weil der Marketing-Mix sonst nicht funktioniert.', false],
      ['Weil sekundäre Marktforschung mehrere Produkte voraussetzt.', false],
      ['Weil die BCG-Analyse mindestens vier Produkte erfordert.', false],
    ],
    exp: 'Der Produktlebenszyklus zeigt: Produkte durchlaufen Einführung, Wachstum, Reife, Sättigung und Degeneration. Um dauerhaft Erträge zu sichern, müssen Unternehmen ständig neue Produkte entwickeln und haben deshalb ein Portfolio nötig.',
    diff: 'medium',
  },
  {
    q: 'Was beschreibt die AIDA-Logik?',
    opts: [
      ['Die stufenweise Wirkung von Werbung: Aufmerksamkeit → Interesse → Wunsch → Handlung', true],
      ['Die vier Instrumente des Marketing-Mix', false],
      ['Die Phasen des Produktlebenszyklus', false],
      ['Die Dimensionen der BCG-Analyse', false],
    ],
    exp: 'AIDA steht für Attention, Interest, Desire, Action. Es ist ein Werbewirkungsmodell innerhalb der Kommunikationspolitik (Promotion) und beschreibt, wie Werbung den Konsumenten schrittweise zur Kaufhandlung führt.',
    diff: 'easy',
  },
  {
    q: 'Welche Aussage zur Preissenkung im gesättigten Markt ist korrekt?',
    opts: [
      ['Bei preisunelastischer Nachfrage kann eine Preissenkung den Gewinn trotz Mehrabsatz senken.', true],
      ['Preissenkungen führen immer zu mehr Absatz und mehr Gewinn.', false],
      ['Im gesättigten Markt ist Preispolitik nicht Teil des Marketing-Mix.', false],
      ['Preissenkung ist gleichbedeutend mit Qualitätsführerschaft.', false],
    ],
    exp: 'Bei preisunelastischer Nachfrage reagieren Kunden kaum auf Preissenkungen. Der Umsatz pro Einheit sinkt, der Mehrabsatz gleicht dies nicht aus — der Gewinn kann sinken. Preissenkung ist daher nur sinnvoll bei elastischer Nachfrage.',
    diff: 'hard',
  },
  {
    q: 'Was unterscheidet die BCG-Analyse vom Ansoff-Portfolio?',
    opts: [
      ['BCG bewertet bestehende Produkte in bestehenden Märkten; Ansoff strukturiert Wachstumsoptionen mit neuen/bestehenden Produkten und Märkten.', true],
      ['BCG ist für neue Produkte; Ansoff für bestehende Produkte.', false],
      ['BCG und Ansoff sind identisch — sie zeigen dasselbe mit anderen Namen.', false],
      ['BCG berücksichtigt den Preis; Ansoff berücksichtigt die Distribution.', false],
    ],
    exp: 'BCG-Analyse: bestehende Produkte in bestehenden Märkten, bewertet nach Marktwachstum und relativem Marktanteil. Ansoff-Portfolio: strukturiert Wachstumsstrategien entlang der Dimensionen neu/bestehend bei Produkt und Markt.',
    diff: 'medium',
  },
])

console.log('✅ WR Marketing: Kapitel 1 (Marktuntersuchung & Segmentierung) und Kapitel 2 (Strategien, Portfolio & Mix) erfolgreich erstellt.')
await client.end()
