import pg from 'pg'
import { randomUUID } from 'crypto'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
function id() { return randomUUID() }

async function insertTopic(slug, title, description, examType, order) {
  const topicId = id()
  await client.query(`INSERT INTO "Topic" (id,slug,title,description,icon,color,"examType",category,"order",published,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,'Calculator','emerald',$5,'frw',$6,false,NOW(),NOW()) ON CONFLICT (slug) DO NOTHING`,
    [topicId, slug, title, description, examType, order])
  const r = await client.query(`SELECT id FROM "Topic" WHERE slug=$1`, [slug])
  return r.rows[0].id
}

async function insertChapter(topicId, slug, title, subtitle, order, summary) {
  const chId = id()
  await client.query(`INSERT INTO "Chapter" (id,slug,title,subtitle,"topicId","order","contentStatus",summary,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,'complete',$7,NOW(),NOW()) ON CONFLICT ("topicId",slug) DO NOTHING`,
    [chId, slug, title, subtitle, topicId, order, summary])
  const r = await client.query(`SELECT id FROM "Chapter" WHERE "topicId"=$1 AND slug=$2`, [topicId, slug])
  return r.rows[0].id
}

async function addGoals(chId, goals) {
  for (let i = 0; i < goals.length; i++)
    await client.query(`INSERT INTO "LearningGoal" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), goals[i], chId, i+1])
}
async function addTerms(chId, terms) {
  for (let i = 0; i < terms.length; i++)
    await client.query(`INSERT INTO "KeyTerm" (id,term,definition,"chapterId","order") VALUES ($1,$2,$3,$4,$5)`, [id(), terms[i][0], terms[i][1], chId, i+1])
}
async function addPoints(chId, points) {
  for (let i = 0; i < points.length; i++)
    await client.query(`INSERT INTO "CorePoint" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), points[i], chId, i+1])
}
async function addExamples(chId, examples) {
  for (let i = 0; i < examples.length; i++)
    await client.query(`INSERT INTO "Example" (id,text,"chapterId","order") VALUES ($1,$2,$3,$4)`, [id(), examples[i], chId, i+1])
}
async function addQuiz(chId, questions) {
  for (let i = 0; i < questions.length; i++) {
    const qId = id()
    const q = questions[i]
    await client.query(`INSERT INTO "QuizQuestion" (id,"chapterId","questionText","questionType",explanation,difficulty,"order") VALUES ($1,$2,$3,'multiple_choice',$4,$5,$6)`,
      [qId, chId, q.q, q.exp, q.diff||'medium', i+1])
    for (let j = 0; j < q.opts.length; j++)
      await client.query(`INSERT INTO "QuizOption" (id,"questionId",text,"isCorrect","order") VALUES ($1,$2,$3,$4,$5)`,
        [id(), qId, q.opts[j][0], q.opts[j][1], j+1])
  }
}

// ══════════════════════════════════════════════════
// 1. WARENKONTEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-warenkonten','Warenkonten','Wareneinkauf, Warenverkauf und Bestandesveränderungen richtig buchen.','both',2)
  const ch1 = await insertChapter(tId,'wareneinkauf-verkauf','Wareneinkauf & Warenverkauf','Buchung und Konten',1,'Warenkonten trennen den Einkauf (Warenaufwand) vom Verkauf (Warenertrag). Der Einstandspreis wird auf dem Warenaufwandskonto, der Erlös auf dem Warenertragskonto gebucht.')
  await addGoals(ch1,['Du kannst Wareneinkäufe korrekt buchen.','Du kannst Warenverkäufe korrekt buchen.','Du kennst den Unterschied zwischen Einstandspreis und Verkaufspreis.','Du kannst den Bruttogewinn berechnen.'])
  await addTerms(ch1,[['Wareneinkauf','Kauf von Waren zum Weiterverkauf. Buchung: Warenaufwand / Kreditoren (oder Kasse).'],['Warenverkauf','Verkauf von Waren an Kunden. Buchung: Kasse/Debitoren / Warenertrag.'],['Einstandspreis','Preis, zu dem Waren eingekauft wurden (ohne Gewinnaufschlag).'],['Verkaufspreis','Preis, zu dem Waren an Kunden verkauft werden (inkl. Marge).'],['Warenaufwand','Konto für Wareneinkäufe — erscheint in der Erfolgsrechnung als Aufwand.'],['Warenertrag','Konto für Warenverkäufe — erscheint in der Erfolgsrechnung als Ertrag.'],['Bruttogewinn','Warenertrag minus Warenaufwand. Zeigt die Rohmarge.'],['Handelsmarge','Differenz zwischen Verkaufs- und Einstandspreis, meist in % des VK angegeben.']])
  await addPoints(ch1,['Wareneinkauf: Warenaufwand / Kreditoren','Warenverkauf: Debitoren / Warenertrag','Bruttogewinn = Warenertrag − Warenaufwand','Einstandspreis × (1 + Marge%) = Verkaufspreis','Barzahlung: Kasse statt Kreditoren/Debitoren'])
  await addExamples(ch1,['Einkauf 500 Stück à CHF 20 auf Rechnung: Warenaufwand 10 000 / Kreditoren 10 000.','Verkauf 300 Stück à CHF 35 bar: Kasse 10 500 / Warenertrag 10 500. Bruttogewinn = 10 500 − 6 000 = 4 500.'])
  await addQuiz(ch1,[
    {q:'Wie lautet der Buchungssatz beim Wareneinkauf auf Rechnung?',opts:[['Warenaufwand / Kreditoren',true],['Kreditoren / Warenaufwand',false],['Warenertrag / Debitoren',false],['Kasse / Warenaufwand',false]],exp:'Wareneinkauf auf Rechnung: Warenaufwand (Aufwand steigt) / Kreditoren (Schuld entsteht).'},
    {q:'Warenertrag 80 000, Warenaufwand 55 000. Bruttogewinn?',opts:[['CHF 25 000',true],['CHF 135 000',false],['CHF 55 000',false],['CHF 80 000',false]],exp:'Bruttogewinn = Warenertrag 80 000 − Warenaufwand 55 000 = 25 000.'},
    {q:'Beim Barverkauf von Waren lautet der Buchungssatz:',opts:[['Kasse / Warenertrag',true],['Warenertrag / Kasse',false],['Warenaufwand / Kasse',false],['Debitoren / Kasse',false]],exp:'Barverkauf: Kasse (Geld kommt) / Warenertrag (Ertrag entsteht).'},
    {q:'Was ist der Einstandspreis?',opts:[['Preis zu dem Waren eingekauft wurden',true],['Preis zu dem Waren verkauft werden',false],['Bruttogewinn pro Stück',false],['Handelsmarge in Prozent',false]],exp:'Einstandspreis = Einkaufspreis der Ware (ohne Gewinnaufschlag).'},
    {q:'Marge 40% auf den VK, VK CHF 100. Einstandspreis?',opts:[['CHF 60',true],['CHF 40',false],['CHF 140',false],['CHF 70',false]],exp:'Marge 40% auf VK → Einstandspreis = 100 − 40 = CHF 60.'}
  ])

  const ch2 = await insertChapter(tId,'warenbestand','Warenbestand & Inventur','Bestandesveränderungen',2,'Am Jahresende wird der tatsächliche Warenbestand inventiert. Differenzen zwischen Buchbestand und Inventurbestand werden als Bestandesveränderung gebucht.')
  await addGoals(ch2,['Du verstehst was Inventur bedeutet.','Du kannst Bestandesveränderungen buchen.','Du kennst den Unterschied zwischen Buch- und Istbestand.'])
  await addTerms(ch2,[['Inventur','Körperliche Bestandesaufnahme aller Waren am Jahresende.'],['Buchbestand','Sollbestand laut Buchhaltung.'],['Istbestand','Tatsächlicher Bestand nach Inventur.'],['Bestandeszunahme','Istbestand > Buchbestand → Ertrag (Bestandeserhöhung).'],['Bestandesabnahme','Istbestand < Buchbestand → Aufwand (Bestandesminderung, z.B. durch Schwund).'],['Warenvorrat','Bilanzposition (Umlaufvermögen) für vorhandene Waren.']])
  await addPoints(ch2,['Bestandeszunahme: Warenvorrat / Warenertrag','Bestandesabnahme: Warenaufwand / Warenvorrat','Schwund/Verderb = Bestandesabnahme','Warenvorrat erscheint als Aktiven in der Bilanz'])
  await addExamples(ch2,['Buchbestand CHF 12 000, Inventur ergibt CHF 10 500. Differenz = 1 500 Abnahme. Buchung: Warenaufwand 1 500 / Warenvorrat 1 500.','Buchbestand 8 000, Inventur 9 200. Zunahme 1 200. Buchung: Warenvorrat 1 200 / Warenertrag 1 200.'])
  await addQuiz(ch2,[
    {q:'Istbestand < Buchbestand bedeutet:',opts:[['Bestandesabnahme (Aufwand)',true],['Bestandeszunahme (Ertrag)',false],['Kein Buchungsbedarf',false],['Gewinnerhöhung',false]],exp:'Wenn der Istbestand kleiner ist als der Buchbestand, liegt eine Abnahme vor → Aufwand.'},
    {q:'Buchungssatz bei Warenbestandsabnahme:',opts:[['Warenaufwand / Warenvorrat',true],['Warenvorrat / Warenaufwand',false],['Warenvorrat / Warenertrag',false],['Debitoren / Warenvorrat',false]],exp:'Abnahme: Warenaufwand steigt (Soll), Warenvorrat sinkt (Haben).'},
    {q:'Wo erscheint der Warenvorrat in der Bilanz?',opts:[['Aktiven (Umlaufvermögen)',true],['Passiven (Fremdkapital)',false],['Eigenkapital',false],['Erfolgsrechnung als Ertrag',false]],exp:'Warenvorrat ist ein Vermögenswert → Aktiven, Umlaufvermögen.'},
    {q:'Was ist die Inventur?',opts:[['Körperliche Bestandsaufnahme aller Waren',true],['Buchung der Wareneinkäufe','false'],['Jahresabschluss der Erfolgsrechnung',false],['Berechnung des Bruttogewinns',false]],exp:'Inventur = physische Zählung und Bewertung aller Waren am Stichtag.'},
    {q:'Bestandeszunahme wird gebucht als:',opts:[['Warenvorrat / Warenertrag',true],['Warenaufwand / Warenvorrat',false],['Kasse / Warenvorrat',false],['Debitoren / Warenertrag',false]],exp:'Zunahme: Warenvorrat steigt (Soll), Warenertrag steigt (Haben).'}
  ])
  console.log('✅ Warenkonten')
}

// ══════════════════════════════════════════════════
// 2. MEHRWERTSTEUER
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-mehrwertsteuer','Mehrwertsteuer (MWST)','Vorsteuer, Umsatzsteuer und Abrechnung mit der ESTV.','both',3)
  const ch1 = await insertChapter(tId,'mwst-grundlagen','MWST-Grundlagen','Vorsteuer und Umsatzsteuer',1,'Die MWST ist eine Verbrauchssteuer. Unternehmen erheben Umsatzsteuer auf Verkäufen und machen Vorsteuer auf Einkäufen geltend. Die Differenz wird mit der ESTV abgerechnet.')
  await addGoals(ch1,['Du kennst das Prinzip der MWST.','Du unterscheidest Vorsteuer und Umsatzsteuer.','Du kannst MWST-Beträge berechnen.','Du buchst Ein- und Verkäufe inkl. MWST korrekt.','Du kennst den aktuellen Normalsatz.'])
  await addTerms(ch1,[['MWST (Mehrwertsteuer)','Schweizer Verbrauchssteuer auf Lieferungen und Leistungen. Normalsatz 8.1%.'],['Vorsteuer','MWST auf Einkäufen — kann vom Unternehmen zurückgefordert werden.'],['Umsatzsteuer','MWST auf Verkäufen — muss an die ESTV abgeführt werden.'],['ESTV','Eidgenössische Steuerverwaltung — Behörde für die MWST-Abrechnung.'],['Nettomethode','MWST wird auf separaten Konten (Vorsteuer/Umsatzsteuer) gebucht.'],['Normalsatz','8.1% — gilt für die meisten Waren und Dienstleistungen.'],['Sondersatz','2.6% für Beherbergungsleistungen.'],['Reduziersatz','2.6% für Lebensmittel, Zeitungen, Medikamente.'],['Steuerschuld','Umsatzsteuer minus Vorsteuer = Betrag der an ESTV zu zahlen ist.'],['Vorsteuerguthaben','Vorsteuer > Umsatzsteuer → ESTV zahlt zurück.']])
  await addPoints(ch1,['Normalsatz CH: 8.1%','Einkauf: Warenaufwand + Vorsteuer / Kreditoren (Bruttobetrag)','Verkauf: Debitoren / Warenertrag + Umsatzsteuer','MWST-Schuld = Umsatzsteuer − Vorsteuer','Auszahlung an ESTV: Umsatzsteuer / Vorsteuer / Kasse'])
  await addExamples(ch1,['Einkauf CHF 1 000 + 8.1% MWST = CHF 1 081. Buchung: Warenaufwand 1 000 + Vorsteuer 81 / Kreditoren 1 081.','Verkauf CHF 500 netto + 8.1% = CHF 540.50. Buchung: Debitoren 540.50 / Warenertrag 500 + Umsatzsteuer 40.50.','MWST-Abrechnung: Umsatzsteuer 800 − Vorsteuer 600 = Steuerschuld 200. Buchung: Umsatzsteuer 800 / Vorsteuer 600 + Kasse 200.'])
  await addQuiz(ch1,[
    {q:'Was ist der aktuelle MWST-Normalsatz in der Schweiz?',opts:[['8.1%',true],['7.7%',false],['8.5%',false],['10%',false]],exp:'Seit 2024 gilt in der Schweiz ein MWST-Normalsatz von 8.1%.'},
    {q:'Was ist Vorsteuer?',opts:[['MWST auf Einkäufen die zurückgefordert werden kann',true],['MWST auf Verkäufen',false],['Die Steuer die an die ESTV gezahlt wird',false],['Ein Erlassantrag bei der ESTV',false]],exp:'Vorsteuer = MWST auf Einkäufen. Sie kann vom Unternehmen zurückgefordert werden.'},
    {q:'Einkauf CHF 2 000 netto, MWST 8.1%. Wie hoch ist die Vorsteuer?',opts:[['CHF 162',true],['CHF 81',false],['CHF 200',false],['CHF 16.20',false]],exp:'Vorsteuer = 2 000 × 8.1% = CHF 162.'},
    {q:'Umsatzsteuer 1 200, Vorsteuer 900. Was schuldet das Unternehmen der ESTV?',opts:[['CHF 300',true],['CHF 1 200',false],['CHF 900',false],['CHF 2 100',false]],exp:'Steuerschuld = Umsatzsteuer − Vorsteuer = 1 200 − 900 = 300.'},
    {q:'Buchungssatz Warenverkauf CHF 1 000 netto + 8.1% MWST auf Rechnung:',opts:[['Debitoren 1081 / Warenertrag 1000 + Umsatzsteuer 81',true],['Warenertrag 1081 / Debitoren 1081',false],['Kasse 1000 / Warenertrag 1000',false],['Umsatzsteuer 81 / Debitoren 81',false]],exp:'Bruttobetrag = 1 081. Debitoren 1 081 / Warenertrag 1 000, Umsatzsteuer 81.'}
  ])
  console.log('✅ MWST')
}

// ══════════════════════════════════════════════════
// 3. LÖHNE UND GEHÄLTER
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-loehne-gehaelter','Löhne und Gehälter','Lohnbuchhaltung, Sozialabzüge und korrekte Buchungen.','both',4)
  const ch1 = await insertChapter(tId,'lohnbuchhaltung','Lohnbuchhaltung','Brutto, Abzüge, Netto',1,'Der Bruttolohn ist der vereinbarte Lohn. Davon werden Sozialabzüge (AHV, IV, EO, ALV, NBUV) abgezogen, was den Nettolohn ergibt. Der Arbeitgeber hat zusätzlich einen eigenen Anteil an den Sozialversicherungen.')
  await addGoals(ch1,['Du kennst den Unterschied zwischen Brutto- und Nettolohn.','Du kennst die wichtigsten Sozialversicherungsabzüge (AHV, IV, EO, ALV).','Du kannst einen einfachen Lohnstreifen berechnen.','Du buchst Lohnzahlungen korrekt.'])
  await addTerms(ch1,[['Bruttolohn','Vereinbarter Lohn vor Abzügen.'],['Nettolohn','Auszahlbarer Betrag nach allen Abzügen.'],['AHV','Alters- und Hinterlassenenversicherung. AN+AG je ca. 4.35%.'],['IV','Invalidenversicherung. AN+AG je 0.7%.'],['EO','Erwerbsersatzordnung (Militär, Mutterschaft). AN+AG je 0.225%.'],['ALV','Arbeitslosenversicherung. AN+AG je 1.1% bis CHF 148 200 Jahreslohn.'],['NBUV','Nichtberufsunfallversicherung — nur Arbeitnehmer zahlen (UVG).'],['Arbeitgeberanteil','Eigener Beitragsanteil des Arbeitgebers an Sozialversicherungen.'],['Lohnabrechnungskonto','Transitkonto zur Buchung der Lohnzahlungen (= Personalaufwand).'],['Quellensteuer','Steuer auf Lohn ausländischer Mitarbeitender ohne Niederlassungsbewilligung.']])
  await addPoints(ch1,['Bruttolohn − Sozialabzüge AN = Nettolohn','AG zahlt eigenen Anteil zusätzlich zum Bruttolohn','Buchung: Personalaufwand / Lohnverbindlichkeiten + Sozialverbindlichkeiten','Nettolohn-Auszahlung: Lohnverbindlichkeiten / Kasse/Post','Sozialabzüge: Sozialverbindlichkeiten / Kasse'])
  await addExamples(ch1,['Bruttolohn 5 000. AN-Abzüge: AHV/IV/EO 4.775% = 238.75, ALV 1.1% = 55, NBUV 0.5% = 25. Total Abzüge = 318.75. Nettolohn = 4 681.25.','Buchung Lohnzahlung: Personalaufwand 5 000 / Lohnverbindlichkeiten 4 681.25 + Sozialverbindlichkeiten 318.75. Dann Auszahlung: Lohnverbindlichkeiten 4 681.25 / Post 4 681.25.'])
  await addQuiz(ch1,[
    {q:'Was ist der Nettolohn?',opts:[['Bruttolohn minus Sozialabzüge',true],['Bruttolohn plus Arbeitgeberbeiträge',false],['Nur der AHV-Abzug',false],['Lohn vor Steuern',false]],exp:'Nettolohn = Bruttolohn − Arbeitnehmerabzüge (AHV, IV, EO, ALV, NBUV usw.).'},
    {q:'Wer zahlt die NBUV?',opts:[['Nur der Arbeitnehmer',true],['Nur der Arbeitgeber',false],['Je hälftig AN und AG',false],['Der Staat',false]],exp:'NBUV (Nichtberufsunfall) wird allein vom Arbeitnehmer bezahlt.'},
    {q:'Bruttolohn CHF 6 000, Abzüge CHF 450. Nettolohn?',opts:[['CHF 5 550',true],['CHF 6 450',false],['CHF 450',false],['CHF 6 000',false]],exp:'Nettolohn = 6 000 − 450 = 5 550.'},
    {q:'Auf welchem Konto wird der Lohnaufwand gebucht?',opts:[['Personalaufwand',true],['Warenaufwand',false],['Eigenkapital',false],['Umlaufvermögen',false]],exp:'Löhne und Gehälter werden auf dem Konto Personalaufwand in der Erfolgsrechnung erfasst.'},
    {q:'Was zahlt der Arbeitgeber zusätzlich zum Bruttolohn?',opts:[['Eigenen Anteil an Sozialversicherungen',true],['Nettolohn an die ESTV',false],['Quellensteuer für alle Mitarbeitenden',false],['AHV nur für sich selbst',false]],exp:'Der AG hat einen eigenen Beitragsanteil (ca. gleich hoch wie AN) an AHV, IV, EO, ALV.'}
  ])
  console.log('✅ Löhne')
}

// ══════════════════════════════════════════════════
// 4. FREMDE WÄHRUNGEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-fremde-waehrungen','Fremde Währungen','Buchung in Fremdwährungen, Kursdifferenzen und Umrechnungen.','both',5)
  const ch1 = await insertChapter(tId,'waehrungsumrechnung','Währungsumrechnung','Kurs und Umrechnung',1,'Geschäftsvorfälle in Fremdwährungen werden zum Tageskurs in CHF umgerechnet. Bei der Zahlung entsteht oft eine Kursdifferenz (Kursgewinn oder Kursverlust).')
  await addGoals(ch1,['Du kannst Beträge in Fremdwährungen in CHF umrechnen.','Du kennst den Unterschied zwischen Kauf- und Verkaufskurs.','Du buchst Kursgewinne und Kursverluste korrekt.','Du verstehst warum Kursdifferenzen entstehen.'])
  await addTerms(ch1,[['Devisenkurs','Preis einer Fremdwährung in CHF (z.B. 1 EUR = 0.95 CHF).'],['Buchungskurs','Kurs zum Zeitpunkt der Buchung (Rechnungsdatum).'],['Zahlungskurs','Kurs zum Zeitpunkt der tatsächlichen Zahlung.'],['Kursdifferenz','Differenz zwischen Buchungs- und Zahlungskurs.'],['Kursgewinn','Wenn der CHF-Betrag bei Zahlung höher ist als bei Buchung (bei Forderungen).'],['Kursverlust','Wenn der CHF-Betrag bei Zahlung tiefer ist als bei Buchung (bei Forderungen).'],['Kursgewinn-Konto','Ertragskonto für positive Kursdifferenzen.'],['Kursverlust-Konto','Aufwandskonto für negative Kursdifferenzen.']])
  await addPoints(ch1,['Fremdwährungsbetrag × Kurs = CHF-Betrag','Kurs bei Buchung ≠ Kurs bei Zahlung → Kursdifferenz','Kursgewinn bei Debitor: Kurs steigt → mehr CHF erhalten','Kursverlust bei Debitor: Kurs fällt → weniger CHF erhalten','Buchung Kursgewinn: Bank / Kursgewinn','Buchung Kursverlust: Kursverlust / Bank'])
  await addExamples(ch1,['Verkauf EUR 1 000 zu Kurs 0.95. Debitor CHF 950. Bei Zahlung Kurs 0.97 → erhalten CHF 970. Kursgewinn 20. Buchung: Bank 970 / Debitor 950 + Kursgewinn 20.','Einkauf USD 500 zu Kurs 0.88 = CHF 440. Zahlung zu Kurs 0.92 = CHF 460. Kursverlust 20. Buchung: Kreditor 440 + Kursverlust 20 / Bank 460.'])
  await addQuiz(ch1,[
    {q:'Forderung EUR 2 000 gebucht zu Kurs 0.94. Zahlung zu Kurs 0.97. Ergebnis?',opts:[['Kursgewinn CHF 60',true],['Kursverlust CHF 60',false],['Kein Unterschied',false],['Kursgewinn CHF 6',false]],exp:'2 000 × (0.97 − 0.94) = 2 000 × 0.03 = CHF 60 Kursgewinn.'},
    {q:'Was ist ein Kursverlust?',opts:[['Der CHF-Betrag bei Zahlung ist tiefer als bei Buchung',true],['Der CHF-Betrag bei Zahlung ist höher als bei Buchung',false],['Verlust durch MWST',false],['Bankgebühren beim Devisentausch',false]],exp:'Kursverlust entsteht, wenn man bei Zahlung weniger CHF erhält als ursprünglich gebucht.'},
    {q:'Wie wird ein Kursgewinn gebucht?',opts:[['Bank / Kursgewinn',true],['Kursgewinn / Bank',false],['Kursverlust / Bank',false],['Debitoren / Kursgewinn',false]],exp:'Kursgewinn ist ein Ertrag → Haben-Buchung. Bank (Soll) / Kursgewinn (Haben).'},
    {q:'EUR 1 000, Kurs 1.05 CHF/EUR. CHF-Betrag?',opts:[['CHF 1 050',true],['CHF 1 000',false],['CHF 950',false],['CHF 105',false]],exp:'1 000 × 1.05 = CHF 1 050.'},
    {q:'Welches Konto wird bei Kursverlust belastet (Soll)?',opts:[['Kursverlust (Aufwand)',true],['Kursgewinn (Ertrag)',false],['Eigenkapital',false],['Umsatzsteuer',false]],exp:'Kursverlust ist ein Aufwand → Sollseite des Verlustkontos.'}
  ])
  console.log('✅ Fremde Währungen')
}

// ══════════════════════════════════════════════════
// 5. VERRECHNUNGSSTEUER
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-verrechnungssteuer','Verrechnungssteuer','Verrechnungssteuer auf Kapitalerträgen, Rückforderung und Buchung.','both',6)
  const ch1 = await insertChapter(tId,'verrechnungssteuer-grundlagen','Verrechnungssteuer','Sicherungssteuer auf Kapitalerträgen',1,'Die Verrechnungssteuer (VST) ist eine Sicherungssteuer von 35% auf Zinserträge, Dividenden und Lotteriegewinne. Sie wird vom Schuldner (z.B. Bank) einbehalten und an die ESTV abgeführt. Berechtigte können sie zurückfordern.')
  await addGoals(ch1,['Du weisst was die Verrechnungssteuer ist.','Du kennst den Steuersatz (35%).','Du buchst Zinserträge mit VST korrekt.','Du verstehst das Rückforderungsprinzip.'])
  await addTerms(ch1,[['Verrechnungssteuer (VST)','Sicherungssteuer von 35% auf Kapitalerträge (Zinsen, Dividenden).'],['Steuersatz','35% — wird direkt vom Bruttoertrag einbehalten.'],['Bruttoertrag','Zinsen/Dividenden vor Abzug der VST.'],['Nettoertrag','Bruttoertrag minus 35% VST = ausgezahlter Betrag.'],['Rückforderung','In der Steuererklärung kann die einbehaltene VST zurückgefordert werden.'],['Verrechnungssteuerguthaben','Aktivkonto — Anspruch auf Rückforderung der VST gegenüber ESTV.'],['ESTV','Behörde die VST verwaltet und Rückerstattungen abwickelt.']])
  await addPoints(ch1,['VST-Satz: 35%','Brutto × 65% = ausbezahlter Nettobetrag','Buchung Zinserhalt: Bank (65%) + VST-Guthaben (35%) / Zinsertrag (100%)','Rückforderung: Kasse/Post / VST-Guthaben','VST gilt auf: Bankzinsen, Dividenden, Gewinnanteile'])
  await addExamples(ch1,['Brutto-Zinsertrag CHF 1 000. Bank zahlt CHF 650 (netto). VST = CHF 350. Buchung: Bank 650 + VST-Guthaben 350 / Zinsertrag 1 000.','Rückforderung VST 350 von ESTV: Bank 350 / VST-Guthaben 350.'])
  await addQuiz(ch1,[
    {q:'Wie hoch ist der Verrechnungssteuersatz?',opts:[['35%',true],['8.1%',false],['20%',false],['15%',false]],exp:'Der Verrechnungssteuersatz beträgt in der Schweiz 35%.'},
    {q:'Brutto-Zinsertrag CHF 400. Wie viel erhält das Unternehmen ausgezahlt?',opts:[['CHF 260',true],['CHF 400',false],['CHF 140',false],['CHF 380',false]],exp:'Netto = 400 × 65% = CHF 260. Die VST von CHF 140 (35%) wird einbehalten.'},
    {q:'Auf welchem Konto wird der Anspruch auf VST-Rückforderung gebucht?',opts:[['VST-Guthaben (Aktiven)',true],['VST-Schuld (Passiven)',false],['Zinsaufwand',false],['Eigenkapital',false]],exp:'Das VST-Guthaben ist ein Vermögenswert (Aktiven) — Anspruch gegenüber der ESTV.'},
    {q:'Was ist der Zweck der Verrechnungssteuer?',opts:[['Sicherung der Steuerdeklaration (Deklarationspflicht)',true],['Finanzierung der AHV',false],['Mehrwertsteuer auf Zinsen',false],['Quellensteuer für Ausländer',false]],exp:'Die VST ist eine Sicherungssteuer — sie stellt sicher, dass Kapitalerträge deklariert werden.'},
    {q:'Buchungssatz wenn die ESTV die VST zurückzahlt:',opts:[['Bank / VST-Guthaben',true],['VST-Guthaben / Zinsertrag',false],['Zinsertrag / Bank',false],['Bank / Zinsertrag',false]],exp:'Rückzahlung: Bank steigt (Soll), VST-Guthaben wird aufgelöst (Haben).'}
  ])
  console.log('✅ Verrechnungssteuer')
}

// ══════════════════════════════════════════════════
// 6. ABSCHREIBUNGEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-abschreibungen','Abschreibungen','Lineare und degressive Abschreibung auf Anlagegütern.','both',7)
  const ch1 = await insertChapter(tId,'abschreibungen-methoden','Abschreibungsmethoden','Linear und degressiv',1,'Abschreibungen erfassen den Wertverlust von Anlagevermögen (Maschinen, Fahrzeuge, IT). Bei der linearen Methode wird jedes Jahr derselbe Betrag abgeschrieben; bei der degressiven Methode ein fixer Prozentsatz des Restbuchwertes.')
  await addGoals(ch1,['Du kannst lineare Abschreibungen berechnen und buchen.','Du kannst degressive Abschreibungen berechnen.','Du kennst Anschaffungswert, Restbuchwert und Abschreibungsdauer.','Du buchst Abschreibungen korrekt.'])
  await addTerms(ch1,[['Abschreibung','Buchhalterische Erfassung des Wertverlustes eines Anlagegutes.'],['Anschaffungswert (AW)','Ursprünglicher Kaufpreis des Anlagegutes.'],['Restbuchwert (RBW)','Aktueller Buchwert nach Abzug aller bisherigen Abschreibungen.'],['Lineare Abschreibung','Gleicher Betrag jedes Jahr. AW / Nutzungsdauer = Jahresabschreibung.'],['Degressive Abschreibung','Fixer % vom RBW jährlich. Im ersten Jahr höher, dann sinkend.'],['Nutzungsdauer','Geschätzte Lebensdauer des Anlagegutes (Jahre).'],['Abschreibungssatz','Prozentsatz der degressiven Abschreibung (z.B. 25% vom RBW).'],['Restwert','Wert nach vollständiger Abschreibung (oft CHF 1 oder 0).']])
  await addPoints(ch1,['Linear: AW ÷ Nutzungsjahre = Jahresbetrag (konstant)','Degressiv: RBW × Satz% = Jahresbetrag (sinkend)','Buchung: Abschreibungsaufwand / Akk. Abschreibungen (oder direkt Anlagekonto)','Abschreibungsaufwand erscheint in der Erfolgsrechnung','Restbuchwert = AW − kumulierte Abschreibungen'])
  await addExamples(ch1,['Linear: Maschine CHF 60 000, Nutzungsdauer 5 Jahre. Jahresabschreibung = 12 000. Buchung: Abschreibungen 12 000 / Maschinen 12 000.','Degressiv 25%: AW 40 000. Jahr 1: 10 000; Jahr 2: RBW 30 000 × 25% = 7 500; Jahr 3: 22 500 × 25% = 5 625.'])
  await addQuiz(ch1,[
    {q:'Maschine CHF 80 000, lineare Abschreibung über 8 Jahre. Jahresbetrag?',opts:[['CHF 10 000',true],['CHF 8 000',false],['CHF 80 000',false],['CHF 20 000',false]],exp:'80 000 ÷ 8 = CHF 10 000 pro Jahr.'},
    {q:'Was ist der Unterschied zwischen linear und degressiv?',opts:[['Linear = gleicher Betrag; degressiv = gleicher % vom Restbuchwert',true],['Linear = höhere Abschreibung am Anfang',false],['Degressiv = gleicher Betrag jedes Jahr',false],['Kein Unterschied in der Praxis',false]],exp:'Linear: konstanter CHF-Betrag. Degressiv: konstanter %-Satz auf Restbuchwert → sinkende CHF-Beträge.'},
    {q:'RBW CHF 24 000, degressiver Satz 25%. Abschreibung dieses Jahr?',opts:[['CHF 6 000',true],['CHF 24 000',false],['CHF 2 400',false],['CHF 8 000',false]],exp:'24 000 × 25% = CHF 6 000.'},
    {q:'Buchungssatz für Abschreibungen:',opts:[['Abschreibungsaufwand / Maschinen (Anlagekonto)',true],['Maschinen / Abschreibungsaufwand',false],['Kasse / Abschreibungsaufwand',false],['Eigenkapital / Maschinen',false]],exp:'Abschreibung: Aufwand steigt (Soll), Anlagewert sinkt (Haben).'},
    {q:'Was ist der Restbuchwert?',opts:[['Anschaffungswert minus kumulierte Abschreibungen',true],['Verkaufspreis des Anlagegutes',false],['Jahresabschreibungsbetrag',false],['Restwert nach dem letzten Abschreibungsjahr',false]],exp:'RBW = AW − alle bisherigen Abschreibungen.'}
  ])
  console.log('✅ Abschreibungen')
}

// ══════════════════════════════════════════════════
// 7. ZEITLICHE ABGRENZUNGEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-zeitliche-abgrenzungen','Zeitliche Abgrenzungen','Transitorische Aktiven und Passiven, Rückstellungen.','both',8)
  const ch1 = await insertChapter(tId,'transitorische-posten','Transitorische Posten','Aktive und passive Rechnungsabgrenzung',1,'Transitorische Posten sorgen dafür, dass Aufwände und Erträge der richtigen Periode zugeordnet werden. Transitorische Aktiven sind vorausbezahlte Aufwände oder noch nicht erhaltene Erträge. Transitorische Passiven sind vorausbezahlte Erträge oder noch nicht verbuchte Aufwände.')
  await addGoals(ch1,['Du verstehst das Periodisierungsprinzip.','Du kennst transitorische Aktiven und Passiven.','Du kannst Abgrenzungsbuchungen vornehmen.','Du weisst wann eine Abgrenzung nötig ist.'])
  await addTerms(ch1,[['Transitorische Aktiven (TA)','Vorausbezahlte Aufwände oder noch nicht erhaltene Erträge. Stehen auf der Aktivseite der Bilanz.'],['Transitorische Passiven (TP)','Vorerhaltene Erträge oder noch nicht verbuchte Aufwände. Stehen auf der Passivseite.'],['Periodisierungsprinzip','Aufwände und Erträge gehören in die Periode, in der sie wirtschaftlich entstehen.'],['Aktive Rechnungsabgrenzung','Synonym für transitorische Aktiven.'],['Passive Rechnungsabgrenzung','Synonym für transitorische Passiven.'],['Rückstellungen','Passivposten für wahrscheinliche, aber noch nicht genaue zukünftige Verbindlichkeiten.'],['Aufgelaufener Aufwand','Aufwand der entstanden ist, aber noch nicht bezahlt/gebucht wurde (→ TP).']])
  await addPoints(ch1,['Vorauszahlung Aufwand → Transitorische Aktiven (wird aktiviert)','Vorauszahlung Ertrag → Transitorische Passiven','Aufgelaufener Aufwand → Transitorische Passiven','Abgrenzungen werden am 31.12. gebucht, im Januar rückgebucht','TA und TP erscheinen in der Bilanz'])
  await addExamples(ch1,['Jahresversicherung CHF 1 200 bezahlt am 1. Oktober. Am 31.12. sind 3 Monate (CHF 300) bereits verbraucht, 9 Monate (CHF 900) noch nicht. Buchung: Trans. Aktiven 900 / Versicherungsaufwand 900.','Mietzins Dezember CHF 2 000 noch nicht bezahlt. Buchung 31.12.: Mietaufwand 2 000 / Trans. Passiven 2 000.'])
  await addQuiz(ch1,[
    {q:'Jahresmiete CHF 12 000 am 1. April vorauszahlt. Am 31.12. sind 9 Monate verbraucht. Transitorische Aktiven?',opts:[['CHF 3 000',true],['CHF 9 000',false],['CHF 12 000',false],['CHF 0',false]],exp:'Noch nicht verbrauchte Vorauszahlung: 3/12 × 12 000 = CHF 3 000 → Transitorische Aktiven.'},
    {q:'Was sind Transitorische Passiven?',opts:[['Vorerhaltene Erträge oder noch nicht gebuchte Aufwände',true],['Vorausbezahlte Aufwände',false],['Abschreibungen auf Anlagen',false],['Debitoren aus Warenverkauf',false]],exp:'TP = Schulden der laufenden Periode (Aufwand entstanden, noch nicht bezahlt) oder Erträge erhalten für spätere Perioden.'},
    {q:'Wann werden Abgrenzungsbuchungen vorgenommen?',opts:[['Am 31.12. (Jahresabschluss)',true],['Täglich',false],['Nur bei Bankzahlungen',false],['Beim Bezahlen von Rechnungen',false]],exp:'Transitorische Buchungen erfolgen am Jahresabschluss (31. Dezember) und werden zu Beginn des neuen Jahres rückgebucht.'},
    {q:'Ertrag von CHF 4 800 erhalten, wovon 1 200 erst nächstes Jahr verdient wird. Buchung?',opts:[['Kasse 4800 / Ertrag 3600 + Trans.Passiven 1200',true],['Kasse 4800 / Ertrag 4800',false],['Trans.Aktiven 1200 / Ertrag 1200',false],['Ertrag 4800 / Kasse 4800',false]],exp:'Der Teil für nächstes Jahr (1 200) ist noch nicht verdient → Transitorische Passiven (Verbindlichkeit).'},
    {q:'Was sind Rückstellungen?',opts:[['Passivposten für wahrscheinliche zukünftige Verbindlichkeiten',true],['Reserven aus Gewinnen',false],['Vorausbezahlte Aufwände',false],['Abschreibungen',false]],exp:'Rückstellungen = Vorsorge für wahrscheinliche, aber ungewisse Verbindlichkeiten (z.B. Prozessrisiko, Garantien).'}
  ])
  console.log('✅ Zeitliche Abgrenzungen')
}

// ══════════════════════════════════════════════════
// 8. VERLUSTE AUS FORDERUNGEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-verluste-forderungen','Verluste aus Forderungen','Debitorenverluste, Delkredere und Wertberichtigung.','both',9)
  const ch1 = await insertChapter(tId,'debitorenverluste','Debitorenverluste & Delkredere','Uneinbringliche Forderungen',1,'Nicht jeder Debitor zahlt. Uneinbringliche Forderungen werden direkt ausgebucht (Debitorenverlust). Für mögliche zukünftige Ausfälle wird eine Wertberichtigungsreserve (Delkredere) gebildet.')
  await addGoals(ch1,['Du kannst Debitorenverluste buchen.','Du kennst das Delkredere-Prinzip.','Du kannst die Delkredere-Reserve berechnen und buchen.','Du verstehst den Unterschied zwischen direktem Verlust und Delkredere.'])
  await addTerms(ch1,[['Debitorenverlust','Forderung, die definitiv nicht bezahlt wird. Wird ausgebucht.'],['Delkredere','Wertberichtigungsreserve auf Debitoren für erwartete zukünftige Ausfälle.'],['Wertberichtigung','Passive Korrektur der Forderungen (erscheint als Minus bei Debitoren).'],['Ausfallrisiko','Risiko, dass ein Kunde nicht zahlen kann oder will.'],['Rückgewonnene Forderung','Zahlung nach früherem Debitorenverlust → Ertrag.'],['Delkredere-Satz','Prozentsatz des Debitorenbestandes der als Reserve gebildet wird (z.B. 5%).']])
  await addPoints(ch1,['Direkter Verlust: Debitorenverlust / Debitoren','Delkredere-Bildung: Debitorenverlust / Delkredere','Delkredere-Auflösung: Delkredere / Debitorenverlust (Ertrag)','Delkredere = % × Debitorenbestand','Delkredere steht auf Passivseite der Bilanz (als Wertberichtigung)'])
  await addExamples(ch1,['Forderung CHF 3 000 uneinbringlich: Debitorenverlust 3 000 / Debitoren 3 000.','Delkredere 5% auf Debitoren CHF 80 000 = 4 000. Bisherige Reserve 2 500. Zubuchung 1 500: Debitorenverlust 1 500 / Delkredere 1 500.'])
  await addQuiz(ch1,[
    {q:'Buchungssatz bei direktem Debitorenverlust CHF 2 000:',opts:[['Debitorenverlust 2000 / Debitoren 2000',true],['Debitoren 2000 / Debitorenverlust 2000',false],['Eigenkapital 2000 / Debitoren 2000',false],['Delkredere 2000 / Debitoren 2000',false]],exp:'Verlust: Aufwand (Debitorenverlust, Soll) / Forderung fällt weg (Debitoren, Haben).'},
    {q:'Debitoren CHF 60 000, Delkredere-Satz 5%. Benötigte Reserve?',opts:[['CHF 3 000',true],['CHF 6 000',false],['CHF 600',false],['CHF 30 000',false]],exp:'60 000 × 5% = CHF 3 000.'},
    {q:'Was ist das Delkredere?',opts:[['Wertberichtigungsreserve für erwartete Forderungsausfälle',true],['Direkter Debitorenverlust',false],['Kreditlimite für Kunden',false],['Versicherung gegen Ausfälle',false]],exp:'Delkredere = pauschale Reserve für mögliche zukünftige Verluste auf Forderungen.'},
    {q:'Früher abgeschriebene Forderung CHF 500 wird doch noch bezahlt. Buchung?',opts:[['Bank 500 / Debitorenverlust 500',true],['Debitoren 500 / Bank 500',false],['Bank 500 / Eigenkapital 500',false],['Delkredere 500 / Bank 500',false]],exp:'Rückgewonnene Forderung = Ertrag (Gegenbuchung zum früheren Verlust).'},
    {q:'Wo steht das Delkredere in der Bilanz?',opts:[['Passivseite als Wertberichtigung der Debitoren',true],['Aktivseite bei Debitoren',false],['In der Erfolgsrechnung als Aufwand',false],['Im Eigenkapital',false]],exp:'Delkredere = Wertberichtigung → mindert die Debitoren auf der Aktivseite (wird als Passiv-Korrektiv ausgewiesen).'}
  ])
  console.log('✅ Verluste aus Forderungen')
}

// ══════════════════════════════════════════════════
// 9. IMMOBILIEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-immobilien','Immobilien','Kauf, Abschreibung und Verkauf von Liegenschaften.','both',10)
  const ch1 = await insertChapter(tId,'immobilien-buchung','Immobilien in der Buchhaltung','Kauf, Abschreibung, Verkauf',1,'Liegenschaften gehören zum Anlagevermögen. Sie werden zu Anschaffungskosten bilanziert und je nach Art abgeschrieben. Bei einem Verkauf entsteht ein Buchgewinn oder Buchverlust.')
  await addGoals(ch1,['Du buchst den Kauf einer Liegenschaft.','Du berechnest Abschreibungen auf Gebäuden.','Du buchst den Verkauf einer Liegenschaft (Buchgewinn/-verlust).','Du weisst, was zur Liegenschaft gehört (Land vs. Gebäude).'])
  await addTerms(ch1,[['Liegenschaft','Grundstück mit oder ohne Gebäude.'],['Land','Wird nicht abgeschrieben (kein Wertverlust angenommen).'],['Gebäude','Wird abgeschrieben (Nutzungsdauer typisch 30–50 Jahre).'],['Hypothek','Darlehen, das mit einer Liegenschaft besichert ist.'],['Buchgewinn','Verkaufspreis > Buchwert → Ertrag.'],['Buchverlust','Verkaufspreis < Buchwert → Aufwand.'],['Amortisation','Rückzahlung der Hypothek (nicht zu verwechseln mit Abschreibung).']])
  await addPoints(ch1,['Kauf: Liegenschaft (Gebäude+Land) / Bank + Hypothek','Gebäude abschreiben, Land nicht','Verkauf: Bank / Liegenschaft + Buchgewinn (oder + Buchverlust auf Soll)','Buchgewinn = Verkaufspreis − Buchwert','Hypothekarische Schulden stehen im Fremdkapital'])
  await addExamples(ch1,['Kauf Gebäude CHF 500 000 + Land CHF 100 000. Hypothek 400 000, Rest bar. Buchung: Gebäude 500 000 + Land 100 000 / Hypothek 400 000 + Bank 200 000.','Verkauf Gebäude (Buchwert 300 000) für CHF 380 000. Buchgewinn 80 000. Buchung: Bank 380 000 / Gebäude 300 000 + Buchgewinn 80 000.'])
  await addQuiz(ch1,[
    {q:'Wird Land abgeschrieben?',opts:[['Nein, Land wird nicht abgeschrieben',true],['Ja, linear über 50 Jahre',false],['Ja, degressiv 2% pro Jahr',false],['Nur wenn der Wert sinkt',false]],exp:'Land unterliegt keiner Abnutzung und wird daher nicht abgeschrieben. Nur Gebäude werden abgeschrieben.'},
    {q:'Gebäude Buchwert CHF 240 000, Verkaufspreis CHF 280 000. Buchgewinn?',opts:[['CHF 40 000',true],['CHF 280 000',false],['CHF 240 000',false],['Kein Gewinn',false]],exp:'Buchgewinn = Verkaufspreis − Buchwert = 280 000 − 240 000 = 40 000.'},
    {q:'Was ist eine Hypothek?',opts:[['Darlehen gesichert durch eine Liegenschaft',true],['Abschreibung auf Gebäude',false],['Kaufpreis einer Liegenschaft',false],['Buchgewinn aus Liegenschaftsverkauf',false]],exp:'Hypothek = Darlehen mit Pfandrecht auf einer Liegenschaft.'},
    {q:'Buchungssatz Kauf Liegenschaft CHF 800 000 (davon 200 000 Land), Hypothek 600 000, Rest bar:',opts:[['Gebäude 600 000 + Land 200 000 / Hypothek 600 000 + Bank 200 000',true],['Liegenschaft 800 000 / Hypothek 800 000',false],['Bank 600 000 / Hypothek 600 000',false],['Hypothek 600 000 / Gebäude 600 000',false]],exp:'Aktiven (Gebäude+Land) und Passiven (Hypothek) steigen. Bar-Anteil aus Bank.'},
    {q:'Welchem Bereich der Bilanz wird eine Liegenschaft zugeordnet?',opts:[['Anlagevermögen (Aktiven)',true],['Umlaufvermögen (Aktiven)',false],['Fremdkapital (Passiven)',false],['Eigenkapital (Passiven)',false]],exp:'Liegenschaften sind langfristig gebundene Vermögenswerte → Anlagevermögen.'}
  ])
  console.log('✅ Immobilien')
}

// ══════════════════════════════════════════════════
// 10. WERTSCHRIFTEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-wertschriften','Wertschriften','Kauf, Bewertung und Verkauf von Wertpapieren.','both',11)
  const ch1 = await insertChapter(tId,'wertschriften-buchung','Wertschriften','Kauf, Kursschwankungen, Verkauf',1,'Wertschriften (Aktien, Obligationen) werden zu Anschaffungskosten gebucht. Am Jahresende werden sie zum Kurswert bewertet. Kursgewinne und Kursverluste werden in der Erfolgsrechnung erfasst.')
  await addGoals(ch1,['Du buchst den Kauf von Wertschriften.','Du bewertest Wertschriften am Jahresende (Niederstwertprinzip).','Du buchst Kursgewinne und Kursverluste.','Du buchst Dividenden und Zinserträge.'])
  await addTerms(ch1,[['Wertschriften','Aktien, Obligationen und andere Wertpapiere als Kapitalanlage.'],['Anschaffungskurs','Kurs bei Kauf der Wertschriften (Einstandskurs).'],['Börsenkurs','Aktueller Marktkurs der Wertschriften.'],['Kursgewinn','Verkaufspreis > Buchwert → Ertrag.'],['Kursverlust','Verkaufspreis < Buchwert → Aufwand.'],['Niederstwertprinzip','Vorsichtsprinzip: Wertschriften werden zum tieferen von AK oder Börsenkurs bewertet.'],['Dividende','Gewinnausschüttung auf Aktien (unterliegt Verrechnungssteuer 35%).'],['Wertschriftenertrag','Konto für Dividenden und Zinsen aus Wertschriften.']])
  await addPoints(ch1,['Kauf: Wertschriften / Bank','Kursgewinn am Jahresende: Wertschriften / Kursgewinn','Kursverlust: Kursverlust / Wertschriften','Niederstwertprinzip: nur Verluste werden angepasst (konservativ)','Dividende brutto: Wertschriften/Bank + VST-Guthaben / Wertschriftenertrag'])
  await addExamples(ch1,['Kauf 10 Aktien à CHF 120 = 1 200: Wertschriften 1 200 / Bank 1 200.','Jahresende: Kurs gesunken auf CHF 100. Kursverlust 200: Kursverlust 200 / Wertschriften 200.','Verkauf zu CHF 130 (Buchwert 100): Kursgewinn 300. Bank 1 300 / Wertschriften 1 000 + Kursgewinn 300.'])
  await addQuiz(ch1,[
    {q:'Was ist das Niederstwertprinzip?',opts:[['Wertschriften werden zum tieferen von AK oder Börsenkurs bewertet',true],['Immer zum Börsenkurs bewertet',false],['Immer zum Anschaffungskurs bewertet',false],['Nur Kursgewinne werden gebucht',false]],exp:'Vorsichtsprinzip: Kursverluste werden gebucht, Kursgewinne erst beim Verkauf.'},
    {q:'Kauf 5 Aktien à CHF 200. Buchungssatz?',opts:[['Wertschriften 1000 / Bank 1000',true],['Bank 1000 / Wertschriften 1000',false],['Kursgewinn 1000 / Bank 1000',false],['Wertschriften 200 / Bank 200',false]],exp:'Wertschriften steigen (Soll), Bankgeld fließt ab (Haben).'},
    {q:'Wertschriften Buchwert CHF 5 000, Verkauf für CHF 5 800. Buchgewinn?',opts:[['CHF 800',true],['CHF 5 800',false],['CHF 5 000',false],['CHF 200',false]],exp:'Kursgewinn = Verkaufspreis − Buchwert = 5 800 − 5 000 = CHF 800.'},
    {q:'Was ist eine Dividende?',opts:[['Gewinnausschüttung auf Aktien',true],['Zinsen auf Obligationen',false],['Kursgewinn bei Aktienverkauf',false],['Abschreibung auf Wertschriften',false]],exp:'Dividende = Anteil am Gewinn der Aktiengesellschaft, ausgeschüttet an Aktionäre.'},
    {q:'Auf Dividenden gilt welche Steuer?',opts:[['Verrechnungssteuer 35%',true],['MWST 8.1%',false],['Quellensteuer 15%',false],['Keine Steuer',false]],exp:'Dividenden unterliegen der Verrechnungssteuer von 35%.'}
  ])
  console.log('✅ Wertschriften')
}

// ══════════════════════════════════════════════════
// 11. RECHTSFORMEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-rechtsformen','Rechtsformen','Einzelunternehmung und AG: Gründung, Eigenkapital, Gewinnverteilung.','abschluss',12)
  const ch1 = await insertChapter(tId,'einzelunternehmung','Einzelunternehmung','Eigenkapital und Privatkonten',1,'Bei der Einzelunternehmung sind Inhaber und Unternehmen eng verbunden. Das Eigenkapital besteht aus dem Kapital des Inhabers. Private Einlagen und Entnahmen werden über das Privatkonto gebucht.')
  await addGoals(ch1,['Du kennst die Merkmale der Einzelunternehmung.','Du buchst Privateinlagen und -entnahmen.','Du kannst das Eigenkapital der Einzelunternehmung berechnen.'])
  await addTerms(ch1,[['Einzelunternehmung','Unternehmen mit einem Inhaber — unbeschränkte Haftung.'],['Eigenkapital EU','Kapital + Gewinn − Privatentnahmen + Privateinlagen.'],['Privatkonto','Konto für private Entnahmen und Einlagen des Inhabers.'],['Privatentnahme','Inhaber entnimmt Geld oder Waren für privaten Gebrauch → EK sinkt.'],['Privateinlage','Inhaber bringt privates Vermögen ins Unternehmen → EK steigt.'],['Unbeschränkte Haftung','Inhaber haftet mit seinem gesamten Privatvermögen.']])
  await addPoints(ch1,['Privatentnahme: Privat / Kasse (oder Waren)','Privateinlage: Bank / Privat','Am Jahresende: Privat-Saldo auf Kapital umbuchen','EK = Kapital (Anfang) + Gewinn − Nettoprivatentnahmen'])
  await addExamples(ch1,['Inhaber entnimmt CHF 3 000 bar: Privat 3 000 / Kasse 3 000.','Inhaber bringt Privatfahrzeug CHF 20 000 ein: Fahrzeuge 20 000 / Privat 20 000.','Jahresabschluss: Privat-Sollsaldo 5 000 → Kapital 5 000 / Privat 5 000.'])
  await addQuiz(ch1,[
    {q:'Was ist eine Privatentnahme?',opts:[['Inhaber entnimmt Geld für privaten Gebrauch',true],['Kunde bezahlt Rechnung',false],['Gewinnübertragung ans EK',false],['Bankdarlehen des Inhabers',false]],exp:'Privatentnahme = der Inhaber nimmt Geld oder Waren aus dem Unternehmen für private Zwecke.'},
    {q:'Buchungssatz Privatentnahme Kasse CHF 1 500:',opts:[['Privat 1500 / Kasse 1500',true],['Kasse 1500 / Privat 1500',false],['Eigenkapital 1500 / Kasse 1500',false],['Privat 1500 / Eigenkapital 1500',false]],exp:'Privatkonto wird belastet (Soll), Kasse sinkt (Haben).'},
    {q:'Wie haftet der Inhaber einer Einzelunternehmung?',opts:[['Unbeschränkt mit Privatvermögen',true],['Nur mit Unternehmenskapital',false],['Gar nicht',false],['Maximal CHF 100 000',false]],exp:'Einzelunternehmung: keine Trennung von privatem und geschäftlichem Vermögen → unbeschränkte Haftung.'},
    {q:'Jahresabschluss: Privatkonto hat einen Sollsaldo von CHF 8 000. Buchung?',opts:[['Kapital 8000 / Privat 8000',true],['Privat 8000 / Kapital 8000',false],['Gewinn 8000 / Privat 8000',false],['Privat 8000 / Bank 8000',false]],exp:'Privat-Sollsaldo = Nettoprivatentnahmen → mindert das Kapital. Kapital wird belastet.'},
    {q:'Inhaber bringt privates Geld CHF 10 000 ins Unternehmen. Buchung?',opts:[['Bank 10000 / Privat 10000',true],['Privat 10000 / Bank 10000',false],['Kapital 10000 / Bank 10000',false],['Bank 10000 / Eigenkapital 10000',false]],exp:'Privateinlage: Bank steigt (Soll), Privatkonto steigt auf Haben-Seite.'}
  ])

  const ch2 = await insertChapter(tId,'aktiengesellschaft','Aktiengesellschaft (AG)','Kapital, Gewinnverteilung, Gründung',2,'Die AG ist die häufigste Kapitalgesellschaft. Das Grundkapital ist in Aktien aufgeteilt. Aktionäre haften nur mit ihrer Einlage. Gewinne werden als Dividende ausgeschüttet oder in Reserven thesauriert.')
  await addGoals(ch2,['Du kennst die Merkmale der AG.','Du buchst die Gründung einer AG.','Du buchst die Gewinnverteilung (Dividende, Reserven).','Du verstehst den Unterschied AG vs. Einzelunternehmung.'])
  await addTerms(ch2,[['Aktiengesellschaft (AG)','Kapitalgesellschaft mit in Aktien aufgeteiltem Grundkapital. Min. CHF 100 000.'],['Aktie','Anteilsschein an einer AG. Gibt Stimmrecht und Dividendenanspruch.'],['Aktienkapital','Gesamtwert aller ausgegebenen Aktien (= Grundkapital).'],['Dividende','Gewinnausschüttung an Aktionäre (unterliegt VST 35%).'],['Gesetzliche Reserven','Pflichtreserven: 5% des Jahresgewinns bis 20% des AK erreicht.'],['Freie Reserven','Freiwillige Gewinnreserven nach Abzug der gesetzlichen Reserven.'],['Gewinnvortrag','Nicht ausgeschütteter Restgewinn, der ins nächste Jahr vorgetragen wird.']])
  await addPoints(ch2,['AG-Gründung: Bank / Aktienkapital','Gewinn wird verteilt auf: gesetzliche Reserven + freie Reserven + Dividende + Vortrag','Dividenden-Buchung: Gewinnvortrag / Dividendenverbindlichkeiten','Auszahlung abzgl. VST: Dividendenverb. / Bank (65%) + VST-Schuld (35%)','Haftung beschränkt auf Einlage'])
  await addExamples(ch2,['AG-Gründung: 1 000 Aktien à CHF 200 = CHF 200 000: Bank 200 000 / Aktienkapital 200 000.','Jahresgewinn CHF 50 000. Verteilung: Ges. Reserven 5% = 2 500; Dividende CHF 30 000; Freie Reserven 10 000; Vortrag 7 500.'])
  await addQuiz(ch2,[
    {q:'Was ist das Mindeststammkapital einer AG?',opts:[['CHF 100 000',true],['CHF 20 000',false],['CHF 50 000',false],['CHF 200 000',false]],exp:'Das gesetzliche Mindestaktienkapital einer AG beträgt CHF 100 000.'},
    {q:'Wie haften Aktionäre?',opts:[['Nur mit ihrer Einlage (beschränkte Haftung)',true],['Unbeschränkt mit Privatvermögen',false],['Gar nicht',false],['Bis zum Doppelten der Einlage',false]],exp:'Bei der AG haften die Aktionäre nur mit ihrem einbezahlten Aktienkapital — beschränkte Haftung.'},
    {q:'Was sind gesetzliche Reserven?',opts:[['Pflichtreserven: 5% des Jahresgewinns bis 20% AK',true],['Freiwillige Rücklagen',false],['Dividenden die noch nicht ausgezahlt sind',false],['Teil des Aktienkapitals',false]],exp:'Gesetzliche Reserven = Pflicht: 5% des Jahresgewinns, bis 20% des Aktienkapitals erreicht ist.'},
    {q:'Buchungssatz AG-Gründung mit CHF 500 000 Aktienkapital:',opts:[['Bank 500000 / Aktienkapital 500000',true],['Aktienkapital 500000 / Bank 500000',false],['Eigenkapital 500000 / Aktien 500000',false],['Bank 500000 / Eigenkapital 500000',false]],exp:'Geldeingang (Bank, Soll) / Eigenkapital entsteht (Aktienkapital, Haben).'},
    {q:'Was ist eine Dividende in der AG?',opts:[['Gewinnausschüttung an Aktionäre',true],['Geschäftsführergehalt',false],['Pflichtreserve',false],['Kapitalerhöhung',false]],exp:'Dividende = Anteil des Aktionärs am ausgeschütteten Gewinn.'}
  ])
  console.log('✅ Rechtsformen')
}

// ══════════════════════════════════════════════════
// 12. BEWERTUNGSVORSCHRIFTEN & STILLE RESERVEN
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-bewertungsvorschriften','Bewertungsvorschriften & Stille Reserven','Bilanzbereinigung, stille Reserven und gesetzliche Bewertungsregeln.','abschluss',13)
  const ch1 = await insertChapter(tId,'stille-reserven','Stille Reserven','Bildung und Auflösung',1,'Stille Reserven entstehen durch unterbewertete Aktiven oder überbewertete Passiven. Sie dienen als «stiller Puffer» für schlechte Zeiten. Die Bildung mindert den ausgewiesenen Gewinn, die Auflösung erhöht ihn.')
  await addGoals(ch1,['Du kannst stille Reserven erklären und Beispiele nennen.','Du buchst die Bildung und Auflösung stiller Reserven.','Du kennst das Niederstwertprinzip.','Du verstehst den Einfluss auf Gewinn und Steuern.'])
  await addTerms(ch1,[['Stille Reserven','Differenz zwischen effektivem Wert und tieferem Buchwert einer Position.'],['Bildung stiller Reserven','Zu hohe Abschreibung oder zu tiefe Bewertung → ausgewiesener Gewinn sinkt.'],['Auflösung stiller Reserven','Buchwert wird erhöht → ausgewiesener Gewinn steigt.'],['Niederstwertprinzip','Aktiven werden höchstens zum Anschaffungswert, mindestens zum Marktwert bewertet.'],['Höchstwertprinzip','Passiven dürfen nicht unterbewertet werden.'],['Bilanzbereinigung','Anpassung der Buchwerte an die tatsächlichen Werte (z.B. bei Unternehmensverkauf).']])
  await addPoints(ch1,['Stille Reserve = effektiver Wert − Buchwert','Bildung: Abschreibungsaufwand / Anlage (mehr als nötig)','Auflösung: Anlage / ausserordentlicher Ertrag','Stille Reserven mindern Steuerlast (legal)','Zu viele stille Reserven → Gläubiger werden getäuscht (Grenze zur Bilanzfälschung)'])
  await addExamples(ch1,['Liegenschaft Marktwert CHF 500 000, Buchwert CHF 320 000. Stille Reserve = CHF 180 000.','Bildung: Maschinen um CHF 10 000 mehr abschreiben als nötig → Gewinn sinkt um 10 000.','Auflösung: Maschinen 10 000 / ausserordentlicher Ertrag 10 000.'])
  await addQuiz(ch1,[
    {q:'Was sind stille Reserven?',opts:[['Differenz zwischen effektivem Wert und tieferem Buchwert',true],['Auf einem separaten Konto ausgewiesene Reserven',false],['Gesetzlich vorgeschriebene Reserven',false],['Dividenden die noch nicht ausgeschüttet wurden',false]],exp:'Stille Reserven sind nicht sichtbar in der Bilanz — der Buchwert liegt unter dem tatsächlichen Wert.'},
    {q:'Was passiert beim Auflösen stiller Reserven?',opts:[['Ausgewiesener Gewinn steigt',true],['Ausgewiesener Gewinn sinkt',false],['Eigenkapital sinkt',false],['Aktiven sinken',false]],exp:'Auflösung = Anhebung des Buchwertes → ausserordentlicher Ertrag → Gewinn steigt.'},
    {q:'Welchem Zweck dienen stille Reserven?',opts:[['Puffer für schlechte Zeiten und Steueroptimierung',true],['Betrug der Aktionäre',false],['Erhöhung des ausgewiesenen Gewinns',false],['Pflichtreserven nach OR',false]],exp:'Stille Reserven sind legal und dienen als Sicherheitspuffer sowie zur Steueroptimierung.'},
    {q:'Buchung Bildung stiller Reserve durch Überabschreibung CHF 5 000:',opts:[['Abschreibungsaufwand 5000 / Maschinen 5000',true],['Maschinen 5000 / Abschreibungsaufwand 5000',false],['Stille Reserven 5000 / Eigenkapital 5000',false],['Eigenkapital 5000 / Maschinen 5000',false]],exp:'Höhere Abschreibung = mehr Aufwand (Soll), Buchwert sinkt (Haben).'},
    {q:'Was besagt das Niederstwertprinzip?',opts:[['Aktiven dürfen nicht über Anschaffungs- oder Marktwert bewertet werden',true],['Aktiven immer zum höchsten Wert ansetzen',false],['Passiven möglichst tief ansetzen',false],['Nur Wertpapiere sind betroffen',false]],exp:'Niederstwertprinzip: Vorsicht bei Aktiven — nie über AK oder niedrigerem Marktwert bewerten.'}
  ])
  console.log('✅ Bewertungsvorschriften')
}

// ══════════════════════════════════════════════════
// 13. KENNZAHLENANALYSE
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-kennzahlenanalyse','Kennzahlenanalyse','Analyse von Bilanz und Erfolgsrechnung mit Kennzahlen.','querschnitt',14)
  const ch1 = await insertChapter(tId,'liquiditaet-rentabilitaet','Liquidität & Rentabilität','Wichtige Kennzahlen',1,'Kennzahlen ermöglichen die schnelle Beurteilung der finanziellen Lage eines Unternehmens. Liquiditätskennzahlen zeigen ob kurzfristige Schulden bezahlt werden können. Rentabilitätskennzahlen messen die Ertragskraft.')
  await addGoals(ch1,['Du kannst Liquiditätskennzahlen berechnen (Current Ratio, Quick Ratio).','Du kannst Rentabilitätskennzahlen berechnen (EK-Rendite, GK-Rendite).','Du kannst die Kennzahlen interpretieren.','Du kennst Richtwerte für die wichtigsten Kennzahlen.'])
  await addTerms(ch1,[['Liquidität 1. Grades','Liquide Mittel / kurzfr. FK × 100. Richtwert: 20–50%.'],['Liquidität 2. Grades (Quick Ratio)','(Liquide Mittel + Debitoren) / kurzfr. FK. Richtwert: >100%.'],['Liquidität 3. Grades (Current Ratio)','Umlaufvermögen / kurzfr. FK. Richtwert: 150–200%.'],['Eigenkapitalrendite','Reingewinn / EK × 100. Zeigt Verzinsung des EK.'],['Gesamtkapitalrendite','(Reingewinn + Fremdkapitalzinsen) / GK × 100.'],['Eigenkapitalquote','EK / Gesamtkapital × 100. Richtwert: >30–40%.'],['Verschuldungsgrad','FK / EK × 100. Richtwert: <200%.']])
  await addPoints(ch1,['Liquidität 2 > 100% = kurzfristige Schulden gut gedeckt','EK-Quote > 30% = solide Finanzierung','Hohe Rentabilität = effiziente Kapitalnutzung','Kennzahlen immer im Branchenvergleich beurteilen','Keine Kennzahl allein ist aussagekräftig'])
  await addExamples(ch1,['Liquide Mittel 50, Debitoren 80, UV 200, kurzfr. FK 100. L1: 50%, L2: 130%, L3: 200%.','Gewinn 40 000, EK 200 000. EK-Rendite = 20%. GK 500 000, Zinsen 10 000. GK-Rendite = 10%.'])
  await addQuiz(ch1,[
    {q:'Was misst die Liquidität 2. Grades?',opts:[['Ob kurzfristige Schulden mit flüssigen Mitteln + Debitoren gedeckt sind',true],['Den Jahresgewinn',false],['Die Eigenkapitalquote',false],['Den Verschuldungsgrad',false]],exp:'L2 = (Liquide Mittel + Debitoren) / kurzfr. FK. Richtwert > 100%.'},
    {q:'EK CHF 300 000, Reingewinn CHF 45 000. EK-Rendite?',opts:[['15%',true],['45%',false],['6.7%',false],['30%',false]],exp:'EK-Rendite = 45 000 / 300 000 × 100 = 15%.'},
    {q:'Was sagt die Eigenkapitalquote aus?',opts:[['Anteil des EK am Gesamtkapital',true],['Gewinn im Verhältnis zu Umsatz',false],['Verhältnis UV zu AV',false],['Kurzfristige Zahlungsfähigkeit',false]],exp:'EK-Quote = EK / Gesamtkapital × 100. Zeigt Unabhängigkeit von Fremdkapital.'},
    {q:'Welcher Richtwert gilt für die Liquidität 2. Grades?',opts:['>100%','>200%','50–80%','Unter 50%'].map((t,i)=>[t,i===0]),exp:'L2 Richtwert: > 100% — alle kurzfristigen Schulden durch flüssige Mittel + Debitoren gedeckt.'},
    {q:'UV CHF 180 000, kurzfr. FK CHF 90 000. Current Ratio (L3)?',opts:[['200%',true],['50%',false],['180%',false],['90%',false]],exp:'L3 = UV / kurzfr. FK = 180 000 / 90 000 = 2.0 = 200%.'}
  ])
  console.log('✅ Kennzahlenanalyse')
}

// ══════════════════════════════════════════════════
// 14. KOSTENRECHNUNG & KALKULATION
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-kostenrechnung','Kostenrechnung & Kalkulation','Kostenarten, BAB, Kalkulation und Nutzschwellenanalyse.','both',15)
  const ch1 = await insertChapter(tId,'kostenarten','Kostenarten & BAB','Kostenstellenrechnung',1,'Die Kostenrechnung ergänzt die Finanzbuchhaltung. Sie zeigt wo Kosten anfallen (Kostenstellen) und wofür (Kostenträger). Der Betriebsabrechnungsbogen (BAB) verteilt Gemeinkosten auf Kostenstellen.')
  await addGoals(ch1,['Du kennst den Unterschied zwischen Einzel- und Gemeinkosten.','Du kannst einen einfachen BAB aufstellen.','Du verstehst den Unterschied zwischen fixen und variablen Kosten.','Du kannst Zuschlagssätze berechnen.'])
  await addTerms(ch1,[['Einzelkosten','Kosten die direkt einem Produkt zugeordnet werden können (z.B. Rohmaterial).'],['Gemeinkosten','Kosten die auf mehrere Produkte aufgeteilt werden müssen (z.B. Miete, Strom).'],['Kostenstelle','Bereich im Unternehmen wo Kosten anfallen (Einkauf, Produktion, Verkauf).'],['Kostenträger','Das Produkt oder die Leistung, dem die Kosten zugerechnet werden.'],['BAB','Betriebsabrechnungsbogen: Verteilung der Gemeinkosten auf Kostenstellen.'],['Zuschlagssatz','Gemeinkostenzuschlag in % der Einzelkosten einer Kostenstelle.'],['Variable Kosten','Steigen/sinken proportional zur Produktionsmenge.'],['Fixe Kosten','Bleiben unabhängig von der Produktionsmenge gleich (Miete, Abschreibungen).']])
  await addPoints(ch1,['Gesamtkosten = Einzelkosten + Gemeinkosten','Zuschlagssatz = Gemeinkosten / Bezugsgrösse × 100','BAB: horizontale Zeilen = Kostenarten, Spalten = Kostenstellen','Kostenträgerstückrechnung = Kalkulation pro Einheit'])
  await addExamples(ch1,['Materialgemeinkosten CHF 20 000, Materialeinzelkosten CHF 100 000. Zuschlagssatz = 20%.','Fertigungsgemeinkosten CHF 60 000, Fertigungseinzelkosten 120 000. Zuschlag = 50%.'])
  await addQuiz(ch1,[
    {q:'Was sind Gemeinkosten?',opts:[['Kosten die nicht direkt einem Produkt zugeordnet werden können',true],['Nur Rohmaterialkosten',false],['Variable Kosten',false],['Kosten des Vertriebs',false]],exp:'Gemeinkosten können nicht direkt einzelnen Produkten zugerechnet werden (Miete, Strom usw.).'},
    {q:'Materialgemeinkosten 15 000, Materialeinzelkosten 75 000. Zuschlagssatz?',opts:[['20%',true],['15%',false],['50%',false],['80%',false]],exp:'Zuschlagssatz = 15 000 / 75 000 × 100 = 20%.'},
    {q:'Was sind fixe Kosten?',opts:[['Kosten die unabhängig von der Menge gleich bleiben',true],['Kosten die mit der Menge steigen',false],['Nur Personalkosten',false],['Einmalige Investitionskosten',false]],exp:'Fixe Kosten (Miete, Abschreibungen) bleiben konstant unabhängig von der Auslastung.'},
    {q:'Was zeigt der BAB?',opts:[['Verteilung der Gemeinkosten auf Kostenstellen',true],['Jahresgewinn des Unternehmens',false],['Einzelkosten pro Produkt',false],['Umsatz pro Kunde',false]],exp:'BAB = Betriebsabrechnungsbogen: verteilt Gemeinkosten systematisch auf Kostenstellen.'},
    {q:'Was sind Einzelkosten?',opts:[['Kosten direkt einem Produkt zuordenbar',true],['Miete und Strom',false],['Fixe Kosten',false],['Verwaltungsgemeinkosten',false]],exp:'Einzelkosten = direkt zurechenbar (z.B. Rohmaterial für ein Produkt).'}
  ])

  const ch2 = await insertChapter(tId,'nutzschwelle','Nutzschwellenanalyse','Break-Even-Point',2,'Die Nutzschwelle (Break-Even-Point) ist jene Menge, bei der Erlöse und Gesamtkosten gleich sind. Unterhalb der Nutzschwelle macht das Unternehmen Verlust, darüber Gewinn.')
  await addGoals(ch2,['Du kannst die Nutzschwelle berechnen (mengenmässig und wertmässig).','Du kannst den Deckungsbeitrag berechnen.','Du verstehst wann ein Produkt rentabel ist.'])
  await addTerms(ch2,[['Deckungsbeitrag (DB)','Verkaufspreis − variable Stückkosten. Beitrag zur Deckung der Fixkosten.'],['Nutzschwelle (Break-Even)','Menge bei der Gesamterlös = Gesamtkosten (Gewinn = 0).'],['Break-Even-Menge','Fixkosten / Deckungsbeitrag pro Stück.'],['Break-Even-Umsatz','Fixkosten / DB-Quote × 100 (oder BEM × Preis).'],['DB-Quote','Deckungsbeitrag / Verkaufspreis × 100. Anteil DB am VK.']])
  await addPoints(ch2,['DB = VK − variable Kosten','Break-Even-Menge = Fixkosten / DB pro Stück','Über der Nutzschwelle: Gewinn; darunter: Verlust','DB-Quote = DB/VK × 100','Höherer DB → Nutzschwelle wird schneller erreicht'])
  await addExamples(ch2,['VK CHF 50, variable Kosten CHF 30, DB = 20. Fixkosten CHF 80 000. Break-Even = 80 000/20 = 4 000 Stück.','DB-Quote = 20/50 = 40%. Break-Even-Umsatz = 80 000/0.4 = CHF 200 000.'])
  await addQuiz(ch2,[
    {q:'VK CHF 80, variable Kosten CHF 50. Deckungsbeitrag?',opts:[['CHF 30',true],['CHF 80',false],['CHF 50',false],['CHF 130',false]],exp:'DB = VK − variable Kosten = 80 − 50 = CHF 30.'},
    {q:'Fixkosten CHF 90 000, DB pro Stück CHF 45. Break-Even-Menge?',opts:[['2 000 Stück',true],['4 050 Stück',false],['90 000 Stück',false],['45 Stück',false]],exp:'Break-Even = 90 000 / 45 = 2 000 Stück.'},
    {q:'Was gilt unterhalb der Nutzschwelle?',opts:[['Das Unternehmen macht Verlust',true],['Das Unternehmen macht Gewinn',false],['Deckungsbeitrag = 0',false],['Fixkosten sind gedeckt',false]],exp:'Unterhalb der Nutzschwelle: Erlöse < Gesamtkosten → Verlust.'},
    {q:'Was ist die DB-Quote?',opts:[['Deckungsbeitrag / Verkaufspreis × 100',true],['Fixkosten / variable Kosten × 100',false],['Gewinn / Umsatz × 100',false],['Variable Kosten / Gesamtkosten × 100',false]],exp:'DB-Quote = DB/VK × 100. Zeigt den Anteil des DB am Verkaufspreis.'},
    {q:'DB-Quote 25%, Fixkosten CHF 50 000. Break-Even-Umsatz?',opts:[['CHF 200 000',true],['CHF 50 000',false],['CHF 12 500',false],['CHF 75 000',false]],exp:'Break-Even-Umsatz = Fixkosten / DB-Quote = 50 000 / 0.25 = CHF 200 000.'}
  ])
  console.log('✅ Kostenrechnung')
}

// ══════════════════════════════════════════════════
// 15. GELDFLUSSRECHNUNG
// ══════════════════════════════════════════════════
{
  const tId = await insertTopic('frw-geldflussrechnung','Geldflussrechnung','Cash-Flow-Rechnung und Analyse der Zahlungsströme.','abschluss',16)
  const ch1 = await insertChapter(tId,'geldflussrechnung-grundlagen','Geldflussrechnung','Drei Bereiche und Berechnung',1,'Die Geldflussrechnung (Cash Flow Statement) zeigt die tatsächlichen Geldflüsse eines Unternehmens. Sie gliedert sich in drei Bereiche: operativer, investiver und finanzierungsbezogener Cash Flow.')
  await addGoals(ch1,['Du kennst die drei Bereiche der Geldflussrechnung.','Du kannst den operativen Cash Flow berechnen (indirekte Methode).','Du kannst die Geldflussrechnung interpretieren.','Du verstehst den Unterschied zwischen Gewinn und Cash Flow.'])
  await addTerms(ch1,[['Geldflussrechnung (GFR)','Übersicht über alle Geldzuflüsse und -abflüsse einer Periode.'],['Operativer Cash Flow','Geldfluss aus der laufenden Geschäftstätigkeit.'],['Investiver Cash Flow','Geldfluss aus Investitionen (Kauf/Verkauf von Anlagen).'],['Finanzierungs-CF','Geldfluss aus Finanzierungstätigkeit (Kredite, Dividenden, Kapitalerhöhung).'],['Indirekte Methode','Berechnung des operativen CF ausgehend vom Reingewinn (+ Abschreibungen ± UV-Veränderungen).'],['Free Cash Flow','Operativer CF − Investitions-CF. Frei verfügbarer Geldfluss.'],['Cash Flow','Überschuss der Einzahlungen über Auszahlungen in einer Periode.']])
  await addPoints(ch1,['Operativer CF = Reingewinn + Abschreibungen ± UV-Veränderungen','Positiver operativer CF = gesundes Geschäft','Investiver CF meist negativ (Investitionen überwiegen)','Finanzierungs-CF: Aufnahme Schulden +, Rückzahlung −, Dividende −','Gesamter CF = Veränderung des Kassenbestandes'])
  await addExamples(ch1,['Operativer CF (indirekt): Reingewinn 80 000 + Abschreibungen 30 000 − Debitoren-Zunahme 10 000 + Kreditoren-Zunahme 5 000 = 105 000.','Investiver CF: Kauf Maschinen −150 000, Verkauf Fahrzeug +20 000 = −130 000.','Finanzierungs-CF: Bankdarlehen +100 000, Dividende −40 000 = +60 000. Gesamt: 105 000 − 130 000 + 60 000 = +35 000.'])
  await addQuiz(ch1,[
    {q:'Was zeigt der operative Cash Flow?',opts:[['Geldfluss aus der laufenden Geschäftstätigkeit',true],['Geldfluss aus Investitionen',false],['Gewinn aus der Erfolgsrechnung',false],['Veränderung des Eigenkapitals',false]],exp:'Operativer CF = Geldflüsse aus dem eigentlichen Kerngeschäft.'},
    {q:'Reingewinn CHF 60 000, Abschreibungen CHF 25 000, Debitoren-Zunahme CHF 8 000. Operativer CF?',opts:[['CHF 77 000',true],['CHF 93 000',false],['CHF 60 000',false],['CHF 85 000',false]],exp:'60 000 + 25 000 − 8 000 = CHF 77 000. Debitoren-Zunahme = mehr Geld gebunden → minus.'},
    {q:'Warum addiert man Abschreibungen beim operativen CF?',opts:[['Abschreibungen sind kein Geldabfluss (nur buchhalterisch)',true],['Um den Gewinn zu erhöhen',false],['Weil Abschreibungen Einzahlungen sind',false],['Vorschrift des OR',false]],exp:'Abschreibungen mindern den Buchgewinn, sind aber kein tatsächlicher Geldabfluss → rückaddieren.'},
    {q:'Kauf einer Maschine für CHF 200 000. In welchem Bereich der GFR?',opts:[['Investiver Cash Flow (negativ)',true],['Operativer Cash Flow',false],['Finanzierungs-CF (positiv)',false],['Nicht in der GFR',false]],exp:'Investitionen in Anlagen = investiver CF. Da Geld abfliesst, ist der Betrag negativ.'},
    {q:'Was ist der Free Cash Flow?',opts:[['Operativer CF minus Investitions-CF',true],['Reingewinn plus Abschreibungen',false],['Finanzierungs-CF',false],['Gesamter Geldfluss',false]],exp:'Free Cash Flow = frei verfügbarer Geldfluss nach Investitionen = operativer CF − Investitions-CF.'}
  ])
  console.log('✅ Geldflussrechnung')
}

await client.end()
console.log('\n🎉 Alle 15 FRW-Themen erfolgreich eingefügt!')
