import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(
    `INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'Globe','blue',$5,'frw',$6,true,NOW(),NOW())
     ON CONFLICT (slug) DO UPDATE SET title=$3,description=$4,"updatedAt"=NOW()`,
    [topicId, slug, title, description, examType, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(
    `INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW())
     ON CONFLICT ("topicId",slug) DO UPDATE SET title=$3,subtitle=$4,summary=$7,"updatedAt"=NOW()`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  await client.query(`DELETE FROM "LearningGoal" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < goals.length; i++)
    await client.query(
      `INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), goals[i], chId, i + 1])
}

async function addTerms(chId, terms) {
  await client.query(`DELETE FROM "KeyTerm" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < terms.length; i++)
    await client.query(
      `INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`,
      [id(), terms[i][0], terms[i][1], chId, i + 1])
}

async function addPoints(chId, points) {
  await client.query(`DELETE FROM "CorePoint" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < points.length; i++)
    await client.query(
      `INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`,
      [id(), points[i], chId, i + 1])
}

async function addQuiz(chId, questions) {
  await client.query(
    `DELETE FROM "QuizOption" WHERE "questionId" IN (SELECT id FROM "QuizQuestion" WHERE "chapterId"=$1)`,
    [chId])
  await client.query(`DELETE FROM "QuizQuestion" WHERE "chapterId"=$1`, [chId])
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(
      `INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order")
       VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff || 'medium', i + 1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(
        `INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j + 1])
  }
}

// ─── Topic ───────────────────────────────────────────────────────────────────

const tId = await insertTopic(
  'frw-bewertungsvorschriften',
  'Bewertungsvorschriften & Stille Reserven',
  'OR-Bewertungsregeln, Niederstwertprinzip, Stille Reserven bilden und auflösen, interne vs. externe Bilanz.',
  'abschluss',
  16
)

// ─── Chapter ─────────────────────────────────────────────────────────────────

const ch = await insertChapter(
  tId,
  'bewertungsvorschriften',
  'Bewertungsvorschriften & Stille Reserven',
  'OR-Bewertungsregeln, stille Reserven bilden und auflösen, Bilanzbereinigung',
  1,
  `BEWERTUNGSGRUNDSÄTZE — Die Bewertung von Bilanzpositionen ist im OR geregelt und schützt Gläubiger durch konservative Wertansätze.

BEWERTUNGSGRUNDSÄTZE (OR Art. 960 ff.):
• Vorsichtsprinzip: Im Zweifel tiefer bewerten — Verluste sofort, Gewinne erst bei Realisierung
• Anschaffungswertprinzip: Aktiven dürfen maximal zu Anschaffungs- oder Herstellungskosten bilanziert werden
• Höchstwertprinzip für Aktiven: Aktiven nie zu hoch ausweisen
• Tiefstwertprinzip für Passiven: Schulden und Rückstellungen nie zu tief ausweisen
• Stetigkeitsprinzip: Gleiche Bewertungsmethoden von Jahr zu Jahr; Wechsel muss begründet werden
• Going Concern: Bewertung unter Annahme der Unternehmensfortführung

ANSCHAFFUNGSWERT:
• Kaufpreis + direkt zurechenbare Nebenkosten (Transport, Montage, Einrichtung)
• Bei Liegenschaften: Kaufpreis + Handänderungskosten + wertvermehrende Sanierungen
• Ausgangspunkt jeder Erstbewertung; Obergrenze für Folgebewertungen

NIEDERSTWERTPRINZIP (NWP):
• Gilt für Umlaufvermögen und Vorräte
• Formel: Bilanzwert = MIN(Anschaffungswert, realisierbarer Wert)
• Realisierbarer Wert = Verkaufspreis ./. Verkaufskosten
• Bei realisierb. Wert < AW: Pflicht zur Abwertung (kein Wahlrecht)
• Bei realisierb. Wert > AW: keine Aufwertung erlaubt (Vorsichtsprinzip)
• 1/3-Pauschalabzug auf Warenvorräten zusätzlich steuerlich zulässig

STILLE RESERVEN — BILDUNG:
• Definition: Stille Reserve = Tatsächliches EK − Ausgewiesenes EK
• Entstehung durch Unterbewertung von Aktiven ODER Überbewertung von Passiven (Fremdkapital)
• Bildungsformen: überhöhte Abschreibungen, WB Forderungen zu hoch, Waren unter NWP, überhöhte Rückstellungen
• Wirkung: Aufwand ↑ → Gewinn ↓ → EK ↓ → Steuern ↓
• Buchungsbeispiel Waren: Warenaufwand / Warenvorräte

STILLE RESERVEN — AUFLÖSUNG:
• Auflösung = frühere Unterbewertung/Überbewertung wird zurückgenommen
• Wirkung: Ertrag ↑ (oder Aufwand ↓) → Gewinn ↑ → EK ↑ → Steuern ↑
• Buchungsbeispiele: Warenvorräte / Warenertrag; WB Forderungen / Abschreibungsertrag; Rückstellungen / Rückstellungsertrag
• Grössere Auflösungen müssen im Anhang erläutert werden

BEWERTUNG ANLAGEVERMÖGEN:
• Mobile Sachanlagen: Anlagekosten ./. planmässige und ausserplanmässige Abschreibungen
• Liegenschaften: Anlagekosten (Abschreibung nur bei nachgewiesener Wertminderung)
• Finanzanlagen / nicht kotierte Beteiligungen: Anschaffungswert (nicht über AW)
• Börsenkotierte Aktiven: Marktwert möglich — Mehrwert über AW darf NICHT als Gewinn gebucht werden

BEWERTUNG UMLAUFVERMÖGEN:
• Kasse/Bank: Nominalwert
• Debitoren: Nominalwert ./. Wertberichtigung Forderungen (geschätzte Verluste/Delkredere)
• Warenvorräte: NWP = MIN(Einstandspreis, realisierbarer Wert); zusätzlich 1/3-Abzug steuerlich zulässig
• Wertschriften (kotiert, kurzfristig): NWP = Börsenkurs; Wertschriften (nicht kotiert): Ertragswert

INTERNE vs. EXTERNE BILANZ:
• Externe Bilanz (nach OR): stille Reserven vorhanden → Aktiven tiefer, FK höher, EK tiefer, Steuern tiefer
• Interne Bilanz (bereinigt, für Management): stille Reserven aufgedeckt → zeigt wahres Bild des tatsächlichen EK
• Gewinn aus Auflösung ≠ operativer Mehrertrag — deshalb Offenlegungspflicht im Anhang`
)

// ─── Learning Goals (min 6) ───────────────────────────────────────────────────

await addGoals(ch, [
  'Du kennst die wichtigsten OR-Bewertungsgrundsätze (Vorsicht, Höchstwert, Tiefstwert, Stetigkeit, Going Concern).',
  'Du kannst das Niederstwertprinzip erklären und auf Warenvorräte anwenden (Formel: MIN aus AW und realisierbarem Wert).',
  'Du kannst den Anschaffungswert für Waren, mobile Sachanlagen und Liegenschaften korrekt berechnen.',
  'Du verstehst, was stille Reserven sind, wie sie entstehen und welche zwei Grundrichtungen es gibt.',
  'Du kannst stille Reserven bilden und auflösen und die entsprechenden Buchungssätze korrekt formulieren.',
  'Du kennst die steuerliche und informationspolitische Wirkung stiller Reserven.',
  'Du kannst den Unterschied zwischen interner (bereinigter) und externer Bilanz erklären und begründen.',
  'Du weisst, wann grössere Auflösungen stiller Reserven im Anhang offengelegt werden müssen.',
])

// ─── Key Terms (min 10) ──────────────────────────────────────────────────────

await addTerms(ch, [
  ['Vorsichtsprinzip', 'Grundsatz: Im Zweifel konservativ bewerten. Verluste sofort erfassen, Gewinne erst bei sicherer Realisierung. Schützt Gläubiger vor Überbewertung.'],
  ['Anschaffungswert (AW)', 'Kaufpreis plus direkt zurechenbare Nebenkosten (Transport, Montage, Einrichtung). Ausgangspunkt jeder Erstbewertung — gleichzeitig Obergrenze für Folgebewertungen.'],
  ['Einstandspreis', 'Anschaffungswert im Zusammenhang mit Waren und Vorräten. Vergleichsgrösse gegenüber dem realisierbaren Wert beim Niederstwertprinzip.'],
  ['Niederstwertprinzip (NWP)', 'Pflicht: Vorräte werden zum tieferen Wert aus Einstandspreis und realisierbarem Wert bilanziert. MIN(AW, realisierbarer Wert). Gilt auch für kotierte Wertschriften.'],
  ['Realisierbarer Wert', 'Erwarteter Verkaufspreis abzüglich noch anfallender Verkaufskosten. Massgeblich für den Niederstwertvergleich bei Vorräten.'],
  ['1/3-Pauschalabzug', 'Steuerlich anerkannter Zusatzabzug von einem Drittel des Niederstwerts bei Warenvorräten. Bildet eine zusätzliche stille Reserve.'],
  ['Stille Reserve', 'Verdeckte Differenz: Tatsächliches EK − Ausgewiesenes EK. Entsteht durch Unterbewertung von Aktiven ODER Überbewertung von Fremdkapital. Legal im Rahmen des OR.'],
  ['Buchwert', 'Bilanziell ausgewiesener Wert einer Position am Bilanzstichtag. Ergibt sich aus Anschaffungswert minus kumulierte Abschreibungen oder Wertberichtigungen.'],
  ['Rückstellung', 'Passivposition für erwartete zukünftige Verpflichtungen oder Aufwände (Garantien, Prozessrisiken, Steuernachzahlungen). Überhöhte Rückstellungen erzeugen stille Reserven.'],
  ['Externe Bilanz', 'Gesetzlich pflichtgemässer Abschluss nach OR — vorsichtiger Wertansatz. Enthält stille Reserven. Ausgewiesen für Aktionäre, Behörden, Öffentlichkeit.'],
  ['Interne Bilanz (bereinigt)', 'Management-Sicht: stille Reserven aufgedeckt. Aktiven höher, EK höher als extern. Zeigt das wirtschaftlich tatsächliche Bild des Unternehmens.'],
  ['Anlagekosten', 'Aktivierter Gesamtwert einer Sachanlage oder Liegenschaft: Kaufpreis + direkte Nebenkosten + wertvermehrende Sanierungen. Basis für planmässige Abschreibungen.'],
])

// ─── Core Points (min 10) ────────────────────────────────────────────────────

await addPoints(ch, [
  'Höchstwertprinzip für Aktiven: niemals über Anschaffungs-/Herstellungskosten bilanzieren',
  'Tiefstwertprinzip für Passiven: Schulden und Rückstellungen nie zu tief — schützt Gläubiger',
  'NWP Warenvorräte: MIN(Einstandspreis, realisierbarer Wert) — Abwertungspflicht, keine Aufwertung',
  'Realisierbarer Wert = Verkaufspreis ./. Verkaufskosten (z. B. CHF 810 ./. CHF 70 = CHF 740)',
  '1/3-Pauschalabzug auf Warenvorräten (nach NWP) ist steuerlich zulässig — erzeugt stille Reserve',
  'Mobile Sachanlagen: Anlagekosten ./. planmässige Abschreibungen über Nutzungsdauer',
  'Liegenschaften: aktiviert zu Anlagekosten inkl. Handänderungskosten + wertvermehrende Sanierungen',
  'Börsenkotierte Aktiven: Marktwertbewertung erlaubt — Mehrwert über AW NICHT erfolgswirksam',
  'Stille Reserven bilden: Aufwand ↑ → Gewinn ↓ → EK ↓ → Steuern ↓ (steuerlich vorteilhaft)',
  'Stille Reserven auflösen: Ertrag ↑ → Gewinn ↑ → EK ↑ → Steuern ↑ (Gewinnsteigerung ohne Mehrleistung)',
  'Grössere Auflösungen stiller Reserven müssen im Anhang der Jahresrechnung offengelegt werden',
  'Stille Reserven = legal im schweizer OR — Instrument von Bilanzpolitik und Steuerplanung',
  'Interne Bilanz: realistisch für Führung und Kalkulation — externe Bilanz: vorsichtig nach OR',
])

// ─── Quiz (min 8 questions) ──────────────────────────────────────────────────

await addQuiz(ch, [
  {
    q: 'Was bedeutet das Niederstwertprinzip (NWP) bei Warenvorräten?',
    opts: [
      ['Bewertung zum tieferen Wert aus Einstandspreis und realisierb. Wert — Abwertungspflicht', true],
      ['Bewertung immer zum Anschaffungswert, unabhängig vom Marktpreis', false],
      ['Aufwertung erlaubt, wenn Marktwert über Anschaffungskosten liegt', false],
      ['Freie Wahl zwischen Einstandspreis und Marktwert', false],
    ],
    exp: 'NWP = MIN(Einstandspreis, realisierbarer Wert). Liegt der realisierbare Wert tiefer, besteht Abwertungspflicht. Aufwertung über AW ist nie erlaubt (Vorsichtsprinzip).',
    diff: 'medium',
  },
  {
    q: 'Zehn Computer: Einstandspreis CHF 900/Stück, Verkaufspreis CHF 810, Verkaufskosten CHF 70/Stück. Zu welchem Wert werden die Computer bilanziert?',
    opts: [
      ['CHF 740 pro Stück (realisierbarer Wert = 810 − 70)', true],
      ['CHF 900 pro Stück (Anschaffungswert)', false],
      ['CHF 810 pro Stück (Verkaufspreis)', false],
      ['CHF 855 pro Stück (Durchschnitt)', false],
    ],
    exp: 'Realisierbarer Wert = CHF 810 − CHF 70 = CHF 740. Da CHF 740 < CHF 900 (AW), muss nach NWP zu CHF 740 bilanziert werden.',
    diff: 'easy',
  },
  {
    q: 'Wie lautet der Buchungssatz bei der Bildung einer stillen Reserve durch Unterbewertung der Warenvorräte?',
    opts: [
      ['Warenaufwand / Warenvorräte', true],
      ['Warenvorräte / Warenertrag', false],
      ['Warenertrag / Warenvorräte', false],
      ['Abschreibungen / Warenvorräte', false],
    ],
    exp: 'Bildung stiller Reserve: Warenvorräte werden tiefer bewertet → Warenaufwand steigt (Soll), Warenvorräte sinken (Haben). Gewinn sinkt, Steuern sinken.',
    diff: 'medium',
  },
  {
    q: 'Wie lautet der Buchungssatz bei der Auflösung einer stillen Reserve auf Warenvorräten?',
    opts: [
      ['Warenvorräte / Warenertrag', true],
      ['Warenaufwand / Warenvorräte', false],
      ['Rückstellungen / Rückstellungsertrag', false],
      ['Warenvorräte / Warenaufwand', false],
    ],
    exp: 'Auflösung: Warenvorräte werden aufgewertet (Soll) → Warenertrag entsteht (Haben). Gewinn steigt, Steuern steigen.',
    diff: 'medium',
  },
  {
    q: 'Was sind stille Reserven?',
    opts: [
      ['Differenz zwischen tatsächlichem und ausgewiesenem EK durch Unter-/Überbewertung', true],
      ['Gesonderte Rücklagenposition im Eigenkapital der Bilanz', false],
      ['Gesetzlich verbotene Rücklagen', false],
      ['Liquide Mittel auf einem internen Konto', false],
    ],
    exp: 'Stille Reserve = Tatsächliches EK − Ausgewiesenes EK. Sie sind nicht sichtbar in der Bilanz, entstehen durch Unterbewertung von Aktiven ODER Überbewertung von Fremdkapital.',
    diff: 'medium',
  },
  {
    q: 'Welche steuerliche Wirkung hat die Auflösung stiller Reserven?',
    opts: [
      ['Höherer ausgewiesener Gewinn → höhere Ertragssteuern', true],
      ['Tieferer Gewinn → tiefere Steuern', false],
      ['Keine steuerliche Wirkung', false],
      ['Stille Reserven sind steuerfrei', false],
    ],
    exp: 'Auflösung stiller Reserven = höherer Ertrag oder tieferer Aufwand → Gewinn steigt → Ertragssteuern steigen. Umgekehrt wie bei der Bildung.',
    diff: 'easy',
  },
  {
    q: 'Was zeigt die interne (bereinigte) Bilanz im Vergleich zur externen Bilanz?',
    opts: [
      ['Stille Reserven aufgedeckt — höhere Aktiven, höheres EK, realistisches Bild', true],
      ['Noch tiefere Werte durch zusätzliche Vorsicht', false],
      ['Ausschliesslich Steuerwerte', false],
      ['Identisch mit der externen Bilanz nach OR', false],
    ],
    exp: 'Interne Bilanz: stille Reserven werden aufgedeckt → Aktiven und EK höher als extern. Dient der Unternehmenssteuerung, Kalkulation und Kostenkontrolle.',
    diff: 'medium',
  },
  {
    q: 'Welchen zusätzlichen steuerlich anerkannten Abzug erlaubt das OR bei Warenvorräten nach Anwendung des NWP?',
    opts: [
      ['Einen Drittel (1/3) des Niederstwerts als Pauschalabzug', true],
      ['10% des Anschaffungswerts', false],
      ['5% pauschale Abschreibung', false],
      ['Keinen weiteren Abzug', false],
    ],
    exp: 'Das OR erlaubt bei Warenvorräten einen zusätzlichen Pauschalabzug von 1/3 des NWP. Dieser bildet eine steuerlich anerkannte stille Reserve.',
    diff: 'medium',
  },
  {
    q: '400 Aktien wurden zu CHF 110/Stück gekauft (AW CHF 44 000). Kurs am Bilanzstichtag: CHF 137/Stück (Marktwert CHF 54 800). Was gilt?',
    opts: [
      ['Mehrwert CHF 10 800 darf nicht als Kursgewinn in der Erfolgsrechnung verbucht werden', true],
      ['Kursgewinn CHF 10 800 muss als Ertrag gebucht werden', false],
      ['Bilanzierung zum Marktwert CHF 54 800 ist verboten', false],
      ['Aktienbewertung erfolgt immer zum Einstandspreis', false],
    ],
    exp: 'Mehrwerte über den Anschaffungswert bei börsenkotierten Aktiven dürfen nicht erfolgswirksam verbucht werden (Vorsichtsprinzip). Der Mehrwert bleibt stille Reserve.',
    diff: 'hard',
  },
  {
    q: 'Welche Pflicht besteht bei grösseren Auflösungen stiller Reserven gegenüber Aktionären und Öffentlichkeit?',
    opts: [
      ['Offenlegung im Anhang der Jahresrechnung', true],
      ['Keine besondere Pflicht', false],
      ['Gesonderte Pressemitteilung an die Medien', false],
      ['Meldung an die FINMA innert 30 Tagen', false],
    ],
    exp: 'Grössere Auflösungen stiller Reserven müssen im Anhang der Jahresrechnung erläutert werden. Andernfalls könnten Aktionäre und Gläubiger den Gewinnausweis falsch interpretieren.',
    diff: 'medium',
  },
])

console.log('✅ Kapitel 9: Bewertungsvorschriften & Stille Reserven — erfolgreich aktualisiert.')
await client.end()
