import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

// ── Topic ──────────────────────────────────────────────────────────────────
async function upsertTopic(slug, title, description, examType, icon, color, category, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title=$3, description=$4, icon=$5, color=$6, "examType"=$7,
       category=$8, "order"=$9, "updatedAt"=NOW()`,
    [topicId, slug, title, description, icon, color, examType, category, order]
  )
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

// ── Chapter ────────────────────────────────────────────────────────────────
async function upsertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET
       title=$3, subtitle=$4, "order"=$6, "contentStatus"='complete',
       summary=$7, "updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary]
  )
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

// ── Helpers ────────────────────────────────────────────────────────────────
async function clearChapter(chId) {
  await client.query(`DELETE FROM "QuizOption"   WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`, [chId])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  await client.query(`DELETE FROM "CorePoint"    WHERE "chapterId"=$1`, [chId])
  await client.query(`DELETE FROM "KeyTerm"      WHERE "chapterId"=$1`, [chId])
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
}

async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1]
    )
}

async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1]
    )
}

async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1]
    )
}

async function addQuiz(chId, questions) {
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

// ══════════════════════════════════════════════════════════════════════════
// TOPIC
// ══════════════════════════════════════════════════════════════════════════
const tId = await upsertTopic(
  'wr-konjunktur',
  'BIP und Konjunktur',
  'Das BIP als Masszahl für die Wirtschaftsleistung sowie Konjunktur als zyklische Schwankung um den langfristigen Wachstumstrend. Nachfragekomponenten, Konjunkturphasen und Indikatoren im Überblick.',
  'both',
  'Activity',
  'green',
  'vwl',
  52
)

// ══════════════════════════════════════════════════════════════════════════
// KAPITEL 1: BIP, Wachstum und Konjunkturmodell
// ══════════════════════════════════════════════════════════════════════════
const ch1 = await upsertChapter(
  tId,
  'bip-wachstum-konjunkturmodell',
  'BIP, Wachstum und Konjunkturmodell',
  'Messung, Wachstumstrend und das nachfrageorientierte AD-AS-Kurzfristmodell',
  1,
  `Das Bruttoinlandprodukt (BIP) misst den Wert der produzierten Güter und Dienstleistungen innerhalb einer Volkswirtschaft. Es dient als zentrale Kennzahl für die wirtschaftliche Aktivität.

WAS DAS BIP MISST — UND WAS NICHT:
• BIP misst: wirtschaftliche Aktivität von Unternehmen und Staat, Wertschöpfung inkl. Handelsmargen
• BIP misst NICHT: Wohlstand der Bevölkerung, Preisniveau, Produktivität, unbezahlte Arbeit

NOMINALES UND REALES BIP:
• Nominales BIP: zu laufenden Preisen gemessen (enthält Preis- und Mengeneffekte)
• Reales BIP: zu Preisen des Vorjahres gemessen (preisbereinigt, zeigt Mengenwachstum)
→ Durchschnittliche nominale Wachstumsrate liegt über der realen Rate

WACHSTUM VS. KONJUNKTUR:
• Wachstum = langfristiger Trend des BIP (Potentialwachstum); für die Schweiz ca. 2 % pro Jahr
• Konjunktur = kurzfristige bis mittelfristige Schwankungen um diesen Trend
• Grafisch: Wellenbewegung um eine steigende Trendlinie

NACHFRAGEORIENTIERTES KONJUNKTURMODELL (AD-AS, kurzfristig):
• Angebotsseite (AS): kurzfristig stabil — Produktionsfaktoren (Arbeit, Kapital, Technologie, Boden) ändern sich kaum
• Nachfrageseite (AD): kurzfristig variabel — Verschiebungen erklären Konjunkturschwankungen
• Formel: Y = C + I + G + NX (Konsum + Investitionen + Staatsausgaben + Nettoexporte)
• AD steigt → BIP steigt, Preisniveau steigt
• AD sinkt → BIP sinkt, Preisniveau sinkt tendenziell

ARBEITSPRODUKTIVITÄT UND LANGFRISTIGES WACHSTUM:
• Mehr Produktion pro Kopf durch: (1) mehr Arbeitsstunden oder (2) höhere Produktion je Arbeitsstunde
• Arbeitsproduktivität bestimmt durch: Realkapital, Humankapital, Technologie
• Steigende Arbeitsproduktivität → höheres Potentialwachstum (steilerer Wachstumstrend)`
)

await clearChapter(ch1)

await addGoals(ch1, [
  'Du kannst erklären, was das BIP misst und was es nicht misst.',
  'Du kennst den Unterschied zwischen nominalem und realem BIP.',
  'Du kannst Wachstum (langfristiger Trend) und Konjunktur (kurzfristige Schwankung) voneinander abgrenzen.',
  'Du kannst die Nachfrageformel Y = C + I + G + NX erklären und die Komponenten benennen.',
  'Du kannst im AD-AS-Kurzfristmodell erklären, wie AD-Verschiebungen BIP und Preisniveau beeinflussen.',
  'Du kennst die drei Bestimmungsfaktoren der Arbeitsproduktivität und deren Bedeutung für das Potentialwachstum.',
])

await addTerms(ch1, [
  ['Bruttoinlandprodukt (BIP)', 'Wert aller produzierten Güter und Dienstleistungen einer Volkswirtschaft in einer Periode. Zentrale Kennzahl für wirtschaftliche Aktivität — nicht gleichbedeutend mit Wohlstand oder Produktivität.'],
  ['Nominales BIP', 'BIP zu laufenden Preisen des jeweiligen Jahres. Enthält sowohl Mengen- als auch Preisveränderungen. Liegt im Durchschnitt über dem realen BIP-Wachstum.'],
  ['Reales BIP', 'BIP zu Preisen des Vorjahres — um die Preisentwicklung bereinigt. Zeigt die mengenmässige Veränderung der Wirtschaftsleistung.'],
  ['Potentialwachstum', 'Langfristiger Wachstumspfad einer Volkswirtschaft bei normaler Auslastung ihrer Produktionsfaktoren. Für die Schweiz etwa 2 % pro Jahr. Referenzlinie für Konjunkturschwankungen.'],
  ['Konjunktur', 'Zyklische Schwankung der Wirtschaftsleistung um den langfristigen Wachstumstrend. Wird im Modell vor allem durch Veränderungen der Gesamtnachfrage erklärt.'],
  ['Gesamtnachfrage (AD)', 'Gesamte Nachfrage nach Gütern und Dienstleistungen: Y = C + I + G + NX. Bestimmt laut Modell die kurzfristige Konjunktur.'],
  ['Arbeitsproduktivität', 'Produzierte Gütermenge pro Arbeitsstunde. Bestimmt durch Realkapital, Humankapital und Technologie. Zentrale Grundlage des langfristigen Pro-Kopf-Wachstums.'],
  ['Nettoexporte (NX)', 'Exporte minus Importe (EX − IM). Aussenbeitrag zur Gesamtnachfrage. Hängen u.a. vom Wechselkurs und der Auslandskaufkraft ab.'],
  ['Realkapital', 'Physische Produktionsmittel wie Maschinen oder Geräte. Erhöht die Effizienz der Arbeit und ist einer der drei Bestimmungsfaktoren der Arbeitsproduktivität.'],
  ['Humankapital', 'Wissen, Fähigkeiten und Qualifikationen der Arbeitskräfte. Steigert die Qualität und Effizienz der Arbeit; langfristiger Faktor für Wachstum und Produktivität.'],
])

await addPoints(ch1, [
  'Das BIP misst wirtschaftliche Produktion, nicht Wohlstand, Preisniveau oder unbezahlte Arbeit.',
  'Reales BIP ist um die Preisentwicklung bereinigt; nominales BIP enthält Preis- und Mengeneffekte.',
  'Wachstum = langfristiger BIP-Trend; Konjunktur = kurzfristige Schwankung um diesen Trend.',
  'Kurzfristig erklären sich Konjunkturschwankungen vor allem durch Verschiebungen der Gesamtnachfrage (AD).',
  'AD = C + I + G + NX — alle vier Komponenten können die Konjunktur beeinflussen.',
  'AD steigt → BIP und Preisniveau steigen; AD sinkt → BIP und Preisniveau sinken.',
  'Die Angebotsseite (AS) bleibt im Kurzfristmodell stabil; Produktionsfaktoren ändern sich kurzfristig kaum.',
  'Höhere Arbeitsproduktivität (durch Realkapital, Humankapital, Technologie) erhöht das Potentialwachstum.',
  'Für die Schweiz liegt das Potentialwachstum bei etwa 2 % pro Jahr.',
])

await addQuiz(ch1, [
  {
    q: 'Was misst das BIP?',
    opts: [
      ['Den Wert der produzierten Güter und Dienstleistungen in einer Volkswirtschaft', true],
      ['Den Wohlstand der Einwohnerinnen und Einwohner', false],
      ['Das allgemeine Preisniveau eines Landes', false],
      ['Die Produktivität der Arbeitskräfte', false],
    ],
    exp: 'Das BIP misst wirtschaftliche Aktivität (Wert der Produktion), nicht Wohlstand, Preisniveau oder Produktivität. Diese Abgrenzung ist im Unterrichtsstoff ausdrücklich betont.',
    diff: 'easy',
  },
  {
    q: 'Was ist der Unterschied zwischen nominalem und realem BIP?',
    opts: [
      ['Nominales BIP zu laufenden Preisen; reales BIP zu Preisen des Vorjahres (preisbereinigt)', true],
      ['Nominales BIP misst Dienstleistungen; reales BIP misst Güter', false],
      ['Reales BIP ist immer höher als nominales BIP', false],
      ['Nominales BIP berücksichtigt Inflation, reales nicht', false],
    ],
    exp: 'Nominales BIP enthält Preis- und Mengeneffekte. Reales BIP wird zu Preisen des Vorjahres gemessen und zeigt nur die mengenmässige Veränderung. Die durchschnittliche nominale Wachstumsrate liegt daher höher als die reale.',
    diff: 'easy',
  },
  {
    q: 'Wie lautet die Formel für die gesamtwirtschaftliche Nachfrage (Y)?',
    opts: [
      ['Y = C + I + G + NX', true],
      ['Y = C + G − I + NX', false],
      ['Y = C + I + NX', false],
      ['Y = C + I + G', false],
    ],
    exp: 'Die Gesamtnachfrage setzt sich zusammen aus: Konsum (C), Investitionen (I), Staatsausgaben (G) und Nettoexporten (NX = EX − IM). Staatsausgaben und Nettoexporte sind beide Bestandteile.',
    diff: 'easy',
  },
  {
    q: 'Was passiert im AD-AS-Kurzfristmodell, wenn die Gesamtnachfrage (AD) sinkt?',
    opts: [
      ['BIP sinkt und Preisniveau sinkt tendenziell', true],
      ['BIP sinkt, Preisniveau steigt', false],
      ['BIP steigt, Preisniveau sinkt', false],
      ['Weder BIP noch Preisniveau verändern sich', false],
    ],
    exp: 'Im AD-AS-Kurzfristmodell gilt: AD sinkt → BIP sinkt → Preisniveau sinkt tendenziell. Die Angebotsseite bleibt kurzfristig stabil; Konjunktur entsteht durch Nachfrageverschiebungen.',
    diff: 'medium',
  },
  {
    q: 'Welche drei Faktoren bestimmen die Arbeitsproduktivität?',
    opts: [
      ['Realkapital, Humankapital und Technologie', true],
      ['Konsum, Investitionen und Staatsausgaben', false],
      ['Arbeit, Boden und Kapital', false],
      ['Inflation, Zinsen und Wechselkurs', false],
    ],
    exp: 'Die Arbeitsproduktivität (Produktion pro Arbeitsstunde) hängt laut Unterlagen von Realkapital (z.B. Maschinen), Humankapital (Wissen/Fähigkeiten) und Technologie ab. Steigende Arbeitsproduktivität erhöht das Potentialwachstum.',
    diff: 'medium',
  },
  {
    q: 'Die Schweiz hat ein Potentialwachstum von ungefähr:',
    opts: [
      ['2 % pro Jahr', true],
      ['5 % pro Jahr', false],
      ['0,5 % pro Jahr', false],
      ['10 % pro Jahr', false],
    ],
    exp: 'Die Unterlagen nennen für die Schweiz als grobe Grössenordnung ein Potentialwachstum von etwa 2 % pro Jahr. Es ist der langfristige Wachstumspfad bei normaler Auslastung.',
    diff: 'easy',
  },
  {
    q: 'Warum bleibt die Angebotsseite (AS) im Kurzfristmodell stabil?',
    opts: [
      ['Weil sich Produktionsfaktoren wie Arbeit, Kapital und Technologie kurzfristig kaum verändern', true],
      ['Weil der Staat Eingriffe verhindert', false],
      ['Weil Preise kurzfristig konstant sind', false],
      ['Weil die Nachfrage immer konstant ist', false],
    ],
    exp: 'Im Kurzfristmodell wird angenommen, dass die verfügbaren Produktionsfaktoren (Arbeit, Kapital, Technologie, Boden) kurzfristig gegeben sind und sich kaum verändern. Deshalb entstehen Konjunkturschwankungen primär durch die Nachfrageseite.',
    diff: 'medium',
  },
  {
    q: 'Ein schwacher Schweizer Franken wirkt sich auf die Konjunktur vor allem aus über:',
    opts: [
      ['Höhere Nettoexporte (NX) — Schweizer Güter werden im Ausland günstiger', true],
      ['Höhere Staatsausgaben (G)', false],
      ['Tieferen privaten Konsum (C)', false],
      ['Tiefere Investitionen (I)', false],
    ],
    exp: 'Ein schwacher Franken macht Schweizer Exporte im Ausland billiger und Importe teurer. Dadurch steigen die Nettoexporte (NX = EX − IM), was die AD-Kurve nach oben verschiebt und BIP sowie Preisniveau erhöht.',
    diff: 'medium',
  },
])

// ══════════════════════════════════════════════════════════════════════════
// KAPITEL 2: Konjunkturphasen und Indikatoren
// ══════════════════════════════════════════════════════════════════════════
const ch2 = await upsertChapter(
  tId,
  'konjunkturphasen-indikatoren',
  'Konjunkturphasen und Indikatoren',
  'Aufschwung, Hochkonjunktur, Abschwung, Rezession und Konjunkturindikatoren',
  2,
  `Der Konjunkturzyklus verläuft durch vier wiederkehrende Phasen. Jede Phase ist durch charakteristische wirtschaftliche Merkmale geprägt.

VIER PHASEN DES KONJUNKTURZYKLUS:

AUFSCHWUNG — steigende Produktion, positive Gewinnerwartungen, Investitionstätigkeit nimmt zu.

HOCHKONJUNKTUR — Produktionsanlagen voll ausgelastet, Arbeitskräftemangel, viele Überstunden, hohe Kreditnachfrage, steigende Preise, Gefahr der Überhitzung an der Kapazitätsgrenze.

ABSCHWUNG — unsichere Stimmung, stagnierende Löhne, sinkende Gewinne, Haushalte sparen vermehrt.

REZESSION — zwei aufeinanderfolgende Quartale mit negativem Wachstum, hohe Arbeitslosigkeit, Betriebsschliessungen, pessimistische Erwartungen, tendenziell sinkende Preise. Hält die Rezession länger an: DEPRESSION.

WENDEPUNKT AUS DER REZESSION:
Preise, Zinsen, Löhne sinken → Produktionskosten fallen → Grundnachfrage bleibt bestehen → Gewinnerwartungen kehren zurück → tiefe Zinsen fördern Investitionen → Produktion, Einkommen und Nachfrage steigen → neuer Aufschwung.

PREISSTARRHEITEN («KLEBIGE» LÖHNE):
Löhne sind vertraglich gebunden und können nicht schnell gesenkt werden. Deshalb reagieren Preise auf Nachfragerückgänge verzögert — Märkte sind kurzfristig nicht vollkommen flexibel.

UNTERAUSLASTUNG UND ARBEITSLOSIGKEIT:
Liegt die Nachfrage unter dem Produktionspotenzial → weniger Produktion → weniger Arbeitskräfte nötig → höhere Arbeitslosigkeit. Nimmt die Unterauslastung ab → Produktion steigt → Arbeitskräfte werden eingestellt → Einkommen und Nachfrage steigen.

KONJUNKTURINDIKATOREN — zeitliche Kategorien:
• Vorauslaufend (vor BIP): Konsumentenstimmung, Auftragsbücher, Geschäftsklimaindex, Baugesuche, Börsenkurse, KOF-Barometer
• Gleichlaufend (parallel zu BIP): Konsumausgaben, Ausrüstungsinvestitionen, Exporte, Preise, BIP selbst
• Nachhinkend (nach BIP): Einkommen, Inflation, Zinsen, Arbeitslosenquote, Staatseinnahmen, Löhne
→ Indikatoren zeigen statistischen Zusammenhang, keinen kausalen Beweis.`
)

await clearChapter(ch2)

await addGoals(ch2, [
  'Du kannst die vier Konjunkturphasen (Aufschwung, Hochkonjunktur, Abschwung, Rezession) beschreiben und typische Merkmale nennen.',
  'Du kennst die Definition von Rezession (zwei aufeinanderfolgende Quartale mit negativem Wachstum) und Depression.',
  'Du kannst den unteren Wendepunkt aus der Rezession erklären (Kosten sinken → Gewinnerwartungen → Investitionen → Aufschwung).',
  'Du kannst erklären, weshalb «klebige» Löhne Preisanpassungen verzögern.',
  'Du kannst den Zusammenhang zwischen Unterauslastung und Arbeitslosigkeit erklären.',
  'Du kannst Konjunkturindikatoren in vorauslaufende, gleichlaufende und nachhinkende Indikatoren einteilen und Beispiele nennen.',
])

await addTerms(ch2, [
  ['Rezession', 'Zwei aufeinanderfolgende Quartale mit negativem Wirtschaftswachstum. Verbunden mit sinkender Produktion, steigender Arbeitslosigkeit und pessimistischer Stimmung.'],
  ['Depression', 'Länger anhaltende Rezession. Tiefpunkt des Konjunkturzyklus über einen ausgedehnten Zeitraum.'],
  ['Überhitzung', 'Situation zu hoher Auslastung mit starkem Preisauftrieb in der Hochkonjunktur. Entsteht an oder über der Kapazitätsgrenze — nicht nachhaltiges Wachstum.'],
  ['Produktionspotenzial', 'Produktionsmenge, die bei normaler Auslastung aller Produktionsfaktoren möglich ist. Liegt die Produktion darunter, besteht Unterauslastung; an der Grenze droht Überhitzung.'],
  ['Klebige Löhne', 'Löhne sind vertraglich längerfristig gebunden und lassen sich nicht schnell senken. Dadurch bleiben Kosten bei sinkendem Nachfrage vorerst hoch und Preissenkungen erfolgen verzögert.'],
  ['Vorauslaufende Indikatoren', 'Konjunkturindikatoren, die sich vor dem BIP verändern und frühe Hinweise auf die künftige Wirtschaftslage geben. Beispiele: Konsumentenstimmung, KOF-Barometer, Börsenkurse.'],
  ['Gleichlaufende Indikatoren', 'Konjunkturindikatoren, die sich parallel zum BIP entwickeln. Beispiele: Konsumausgaben, Ausrüstungsinvestitionen, Exporte, das BIP selbst.'],
  ['Nachhinkende Indikatoren', 'Konjunkturindikatoren, die erst nach dem BIP reagieren. Beispiele: Arbeitslosenquote, Inflation, Zinsen, Einkommen, Staatseinnahmen, Löhne.'],
  ['Unterauslastung', 'Zustand, in dem die tatsächliche Produktion unter dem Produktionspotenzial liegt. Folge: weniger Beschäftigung, höhere Arbeitslosigkeit.'],
  ['Konjunkturindikator', 'Beobachtbarer Datenpunkt, der statistisch mit dem Konjunkturverlauf zusammenhängt. Dient der Früherkennung, Lagebeurteilung oder nachträglichen Bestätigung — kein kausaler Beweis.'],
])

await addPoints(ch2, [
  'Rezession = zwei aufeinanderfolgende Quartale mit negativem Wachstum; Hält sie länger an: Depression.',
  'Hochkonjunktur: volle Auslastung, Arbeitskräftemangel, steigende Preise, Überhitzungsgefahr.',
  'Wendepunkt aus Rezession: Kosten sinken → Gewinnerwartungen kehren zurück → Investitionen steigen → Aufschwung.',
  'Klebige Löhne verhindern schnelle Preissenkungen; Preise reagieren auf Nachfragerückgänge verzögert.',
  'Unterauslastung → weniger Produktion → weniger Arbeitskräfte nötig → Arbeitslosigkeit steigt.',
  'Erwartungen sind ein zentraler Auslöser: pessimistische Erwartungen dämpfen Konsum und Investitionen bereits vorab.',
  'Vorauslaufende Indikatoren: Konsumentenstimmung, KOF-Barometer, Börsenkurse, Geschäftsklimaindex.',
  'Nachhinkende Indikatoren: Arbeitslosenquote, Inflation, Zinsen, Löhne.',
  'Konjunkturindikatoren zeigen statistischen Zusammenhang — keinen kausalen Beweis.',
]
)

await addQuiz(ch2, [
  {
    q: 'Wie ist eine Rezession definiert?',
    opts: [
      ['Zwei aufeinanderfolgende Quartale mit negativem Wirtschaftswachstum', true],
      ['Ein Jahr mit sinkenden Exporten', false],
      ['Arbeitslosenquote über 10 %', false],
      ['Jedes Quartal mit verlangsamtem Wachstum', false],
    ],
    exp: 'Die Unterlagen definieren Rezession explizit als zwei aufeinanderfolgende Quartale mit negativem Wachstum. Verlangsamtes Wachstum alleine ist noch keine Rezession.',
    diff: 'easy',
  },
  {
    q: 'Welche Merkmale kennzeichnen die Hochkonjunktur?',
    opts: [
      ['Volle Auslastung, Arbeitskräftemangel, steigende Preise und Überhitzungsgefahr', true],
      ['Hohe Arbeitslosigkeit, sinkende Preise und pessimistische Erwartungen', false],
      ['Steigende Investitionen, aber sinkende Löhne', false],
      ['Tiefe Zinsen, steigende Nettoexporte und sinkende Produktion', false],
    ],
    exp: 'In der Hochkonjunktur sind Produktionsanlagen voll ausgelastet. Es herrscht Mangel an Arbeitskräften, viele Überstunden werden geleistet, Preise steigen tendenziell und die Überhitzungsgefahr ist hoch.',
    diff: 'easy',
  },
  {
    q: 'Was löst laut Unterlagen den Wendepunkt aus einer Rezession aus?',
    opts: [
      ['Sinkende Produktionskosten führen zu wiederkehrenden Gewinnerwartungen und steigenden Investitionen', true],
      ['Der Staat erhöht automatisch die Staatsausgaben', false],
      ['Die Exportnachfrage steigt immer nach einer Rezession', false],
      ['Die Notenbank senkt die Geldmenge', false],
    ],
    exp: 'In der Rezession sinken Preise, Zinsen und Löhne → Produktionskosten fallen → eine Grundnachfrage bleibt bestehen → Gewinnerwartungen kehren zurück → tiefe Zinsen fördern Investitionen → Aufschwung beginnt.',
    diff: 'medium',
  },
  {
    q: 'Warum reagieren Preise auf einen Nachfragerückgang verzögert?',
    opts: [
      ['Weil Löhne vertraglich gebunden sind und nicht schnell gesenkt werden können ("klebige Löhne")', true],
      ['Weil der Staat Preissenkungen gesetzlich verhindert', false],
      ['Weil Unternehmen niemals Preise senken', false],
      ['Weil die Notenbank das Preisniveau direkt kontrolliert', false],
    ],
    exp: 'Arbeitsverträge sind meist längerfristig geschlossen. Löhne können deshalb nicht sofort sinken. Da Kosten vorerst hoch bleiben, erfolgen Preissenkungen verzögert — ein Effekt der «klebigen Löhne».',
    diff: 'medium',
  },
  {
    q: 'Welcher der folgenden ist ein vorauslaufender Konjunkturindikator?',
    opts: [
      ['KOF-Barometer', true],
      ['Arbeitslosenquote', false],
      ['Staatseinnahmen', false],
      ['Inflation', false],
    ],
    exp: 'Das KOF-Barometer ist ein vorauslaufender Indikator — es verändert sich vor dem BIP und gibt frühe Hinweise auf die künftige Konjunktur. Arbeitslosenquote, Staatseinnahmen und Inflation sind nachhinkende Indikatoren.',
    diff: 'medium',
  },
  {
    q: 'Welcher der folgenden ist ein nachhinkender Konjunkturindikator?',
    opts: [
      ['Arbeitslosenquote', true],
      ['Geschäftsklimaindex', false],
      ['Börsenkurse', false],
      ['Auftragsbücher der Unternehmen', false],
    ],
    exp: 'Die Arbeitslosenquote reagiert erst nach dem BIP — sie ist ein nachhinkender Indikator. Geschäftsklimaindex, Börsenkurse und Auftragsbücher sind vorauslaufende Indikatoren.',
    diff: 'medium',
  },
  {
    q: 'Was ist die Folge von Unterauslastung in einer Volkswirtschaft?',
    opts: [
      ['Die Produktion liegt unter dem Potenzial, Unternehmen stellen weniger Arbeitskräfte ein → Arbeitslosigkeit steigt', true],
      ['Preise steigen stark wegen Überhitzung', false],
      ['Investitionen steigen automatisch', false],
      ['Die Exportnachfrage nimmt zu', false],
    ],
    exp: 'Bei Unterauslastung ist die Nachfrage nach Gütern tiefer als das Produktionspotenzial. Unternehmen produzieren weniger und benötigen weniger Arbeitskräfte. Die Folge ist steigende Arbeitslosigkeit.',
    diff: 'medium',
  },
  {
    q: 'Warum tragen Erwartungen besonders zur Entstehung eines Nachfragerückgangs bei?',
    opts: [
      ['Pessimistische Erwartungen dämpfen Konsum und Investitionen bereits bevor ein Abschwung eintritt', true],
      ['Weil Erwartungen immer falsch sind', false],
      ['Weil der Staat Erwartungen manipuliert', false],
      ['Weil Erwartungen das Preisniveau direkt erhöhen', false],
    ],
    exp: 'Wenn Unternehmen und Haushalte schlechtere wirtschaftliche Aussichten erwarten, schieben sie Investitionen und Konsum bereits auf — noch bevor ein Abschwung eingetreten ist. Erwartungen sind damit ein zentraler Auslöser.',
    diff: 'hard',
  },
])

console.log('✅ WR Konjunktur: BIP und Konjunktur erfolgreich erstellt (2 Kapitel).')
await client.end()
