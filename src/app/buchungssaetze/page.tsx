'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Shuffle, Zap, CheckCircle2, XCircle, Trophy, Layers } from 'lucide-react'

type Eintrag  = { fall: string; satz: string; erklaerung?: string }
type Kategorie = { label: string; color: string; icon: string; eintraege: Eintrag[] }

// ─── DATA ────────────────────────────────────────────────────────────────────
const KATEGORIEN: Kategorie[] = [
  { label: 'Warenkonten', color: 'blue', icon: '📦', eintraege: [
    { fall: 'Lagerzunahme', satz: 'Warenbestand / Warenaufwand', erklaerung: 'Ware geht ins Lager → Warenbestand (Aktiv) steigt. Gleichzeitig wird Warenaufwand gebucht.' },
    { fall: 'Lagerabnahme', satz: 'Warenaufwand / Warenbestand', erklaerung: 'Ware verlässt das Lager → Warenbestand (Aktiv) sinkt. Warenaufwand steigt entsprechend.' },
    { fall: 'Rechnung an Kunden inkl. MwSt. – Warenertrag', satz: 'FLL / WaE', erklaerung: 'Forderung (FLL) gegenüber Kunden entsteht; Warenertrag wird erzielt.' },
    { fall: 'Rechnung an Kunden inkl. MwSt. – MwSt.', satz: 'FLL / Verb. MwSt.', erklaerung: 'Die dem Kunden verrechnete MwSt. schulden wir dem Staat → Verbindlichkeit MwSt. (Passiv) entsteht.' },
    { fall: 'Rücksendung Kunde – Warenertrag', satz: 'Warenertrag / FLL', erklaerung: 'Rücksendung → Warenertrag wird korrigiert (sinkt), Forderung FLL nimmt ab.' },
    { fall: 'Rücksendung Kunde – MwSt.-Korrektur', satz: 'Verbindlichk. MwSt / FLL', erklaerung: 'MwSt. auf zurückgesandte Ware → Verbindlichkeit MwSt. sinkt, Forderung FLL sinkt.' },
  ]},
  { label: 'MWST', color: 'violet', icon: '🧾', eintraege: [
    { fall: 'Rechnung Lieferant 8.1% – NICHT Investitionen (1. BS)', satz: 'WaA / VLL', erklaerung: 'Warenaufwand entsteht (Soll), Verbindlichkeit gegenüber Lieferant (VLL) entsteht (Haben).' },
    { fall: 'Rechnung Lieferant 8.1% – NICHT Investitionen (2. BS – Vorsteuer)', satz: 'Vorst. 1170 / VLL', erklaerung: 'Vorsteuer 1170 (nicht für Investitionen) als Forderung ans MwSt.-Amt; Verbindlichkeit VLL sinkt.' },
    { fall: 'Rechnung Lieferant 8.1% – INVESTITIONEN (1. BS)', satz: 'WaA / VLL', erklaerung: 'Gleich wie Nicht-Investitionen: Warenaufwand entsteht, Verbindlichkeit VLL steigt.' },
    { fall: 'Rechnung Lieferant 8.1% – INVESTITIONEN (2. BS – Vorsteuer)', satz: 'Vorst. 1177 / VLL', erklaerung: 'Vorsteuer 1177 für Investitionen (sep. Konto) als Forderung; Verbindlichkeit VLL sinkt.' },
    { fall: 'Verrechnung der MwSt.', satz: 'Verb. MwSt. / Vorst. 1170', erklaerung: 'MwSt.-Schuld und Vorsteuer 1170 werden intern verrechnet (gegeneinander aufgehoben).' },
    { fall: 'Banküberweisung der MwSt.', satz: 'Verb. MwSt. / Bank', erklaerung: 'Verbleibende MwSt.-Schuld (nach Verrechnung) wird per Bank an den Staat bezahlt.' },
  ]},
  { label: 'Verrechnungssteuer', color: 'amber', icon: '💰', eintraege: [
    { fall: 'Kapitalerträge VST – Bruttomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (100%)', erklaerung: 'Bruttomethode: Voller Bruttobetrag (100%) als Finanzertrag erfasst. Bank erhält jedoch nur 65%.' },
    { fall: 'Kapitalerträge VST – Bruttomethode (2. BS – VST)', satz: 'Ford. VST / Bank  (35%)', erklaerung: 'Die einbehaltene VST (35%) wird als Forderung ans Steueramt erfasst; Bank korrigiert.' },
    { fall: 'Kapitalerträge VST – Nettomethode (1. Buchungssatz)', satz: 'Bank / Finanzertrag  (65%)', erklaerung: 'Nettomethode: Nur der erhaltene Nettobetrag (65%) wird als Finanzertrag erfasst.' },
    { fall: 'Kapitalerträge VST – Nettomethode (2. BS – VST)', satz: 'Ford. VST / Finanzertrag  (35%)', erklaerung: 'VST (35%) wird nachgebucht als Forderung; Finanzertrag wird auf 100% ergänzt.' },
    { fall: '50 Aktien Nennwert CHF 200, Dividende 8% – Nettobetrag', satz: 'Bank / Finanzertrag  (800 × 65%)', erklaerung: 'Bruttoertrag = 50 × 200 × 8% = 800. Bank erhält 65% davon. Finanzertrag entsprechend.' },
    { fall: '50 Aktien Nennwert CHF 200, Dividende 8% – VST', satz: 'Ford. VST / Finanzertrag  (800 × 35%)', erklaerung: 'VST = 800 × 35% = 280 als Forderung; Finanzertrag wird auf Brutto (800) ergänzt.' },
    { fall: 'Bankgutschrift Nettodividende CHF 1\'300 – VST rückrechnen', satz: 'Ford. VST / Finanzertrag  (1\'300 / 65 × 35)', erklaerung: 'VST rückrechnen: Netto ÷ 65 × 35 = VST-Betrag. Netto ÷ 65 × 100 = Brutto.' },
  ]},
  { label: 'Delkredere / Verluste', color: 'red', icon: '⚠️', eintraege: [
    { fall: 'Forderung entsteht', satz: 'FLL / WaE', erklaerung: 'Forderung (FLL) gegenüber Kunden entsteht; Warenertrag wird erzielt (vereinfacht).' },
    { fall: 'Kunde zahlt nicht', satz: 'Kein Buchungssatz', erklaerung: 'Solange kein Verfahren eingeleitet wird, ändert sich buchhalterisch nichts – die Forderung bleibt bestehen.' },
    { fall: '3. Mahnung mit Verzugszins', satz: 'FLL / FinanzE', erklaerung: 'Verzugszins entsteht → FLL (Forderung) steigt; Finanzertrag wird erzielt.' },
    { fall: 'Start Betreibungsverfahren', satz: 'FLL / Kasse', erklaerung: 'Betreibungskosten werden vorgeschossen → FLL steigt; Kasse sinkt.' },
    { fall: 'Konkursdividende – Verfahren abgeschlossen', satz: 'Post / FLL', erklaerung: 'Erhaltener Teilbetrag aus Konkursverfahren → Post/Bank+; FLL sinkt entsprechend.' },
    { fall: 'Verlustschein – Verfahren abgeschlossen', satz: 'Verl. Ford. / FLL', erklaerung: 'Forderung endgültig uneinbringlich → Verlust auf Forderungen entsteht; FLL ausgebucht.' },
    { fall: 'Nachträgliche Bezahlung – gleiches Rechnungsjahr', satz: 'Bank / Verl. Ford.', erklaerung: 'Doch noch bezahlt im gleichen Jahr → Verlust auf Forderungen wird korrigiert.' },
    { fall: 'Nachträgliche Bezahlung – späteres Rechnungsjahr', satz: 'Bank / A.o. E', erklaerung: 'Doch noch bezahlt in Folgejahr → Ausserordentlicher Ertrag (da Vorjahresverlust).' },
    { fall: 'Bildung Wertberichtigung Forderungen (Delkredere)', satz: 'Verl. Ford. / WB Ford.', erklaerung: 'Pauschalwertberichtigung (z.B. 5% der FLL) → Verlust auf Ford. entsteht; WB Ford. (Korrekturposten) gebildet.' },
    { fall: 'WB Forderungen verkleinern', satz: 'WB Ford. / Verl. Ford.', erklaerung: 'Wertberichtigung wird reduziert (z.B. FLL gesunken) → WB sinkt; Verlust auf Ford. nimmt ab.' },
  ]},
  { label: 'Abschreibungen', color: 'slate', icon: '📉', eintraege: [
    { fall: 'Abschreibung direkt', satz: 'Abs / Mob', erklaerung: 'Abschreibungskonto+ (Aufwand), Mobiliar sinkt direkt im Buchwert.' },
    { fall: 'Abschreibung indirekt', satz: 'Abs / WB Mob', erklaerung: 'Abschreibungskonto+ (Aufwand), WB Mobiliar (Wertberichtigungskonto) entsteht. Mobiliar bleibt auf Anschaffungswert.' },
    { fall: 'Verkaufserlös – Verkauf AV direkte Methode', satz: 'Kasse / Mob', erklaerung: 'Kasse erhält Erlös; Mobiliar (Restbuchwert) sinkt.' },
    { fall: 'Veräusserungsverlust – Verkauf AV direkte Methode', satz: 'a.o. A / Mob', erklaerung: 'Erlös < Restbuchwert → Differenz = a.o. Aufwand (Verlust aus Veräusserung).' },
    { fall: 'Veräusserungsgewinn – Verkauf AV direkte Methode', satz: '(Mob / a.o. E)', erklaerung: 'Erlös > Restbuchwert → Differenz = a.o. Ertrag (Gewinn aus Veräusserung).' },
    { fall: 'Verkaufserlös – Verkauf AV indirekte Methode', satz: 'Kasse / Mob', erklaerung: 'Kasse erhält Erlös; Mobiliar (Bruttowert) sinkt.' },
    { fall: 'Auflösung WB – Verkauf AV indirekte Methode', satz: 'WB Mob / Mob', erklaerung: 'WB Mobiliar wird aufgelöst (sinkt); Mobiliar sinkt um den gleichen WB-Betrag.' },
    { fall: 'Veräusserungsverlust – Verkauf AV indirekte Methode', satz: 'a.o. A / Mob', erklaerung: 'Erlös < Nettowert (Brutto minus WB) → Differenz = a.o. Aufwand.' },
    { fall: 'Veräusserungsgewinn – Verkauf AV indirekte Methode', satz: '(Mob / a.o. E)', erklaerung: 'Erlös > Nettowert (Brutto minus WB) → Differenz = a.o. Ertrag.' },
  ]},
  { label: 'Rückstellungen', color: 'orange', icon: '🔒', eintraege: [
    { fall: 'Bildung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess', erklaerung: 'Möglicher zukünftiger Aufwand (z.B. Prozess) → a.o. Aufwand+; Rückstellung (Passiv) entsteht.' },
    { fall: 'Abschluss Konto Rückstellung', satz: 'Rückstellung Prozess / SB', erklaerung: 'Rückstellungskonto wird per Jahresabschluss auf Schlusskonto (SB) abgeschlossen.' },
    { fall: 'Zahlung Anwaltskosten (Rückstellung)', satz: 'Rückstellung Prozess / Bank', erklaerung: 'Tatsächliche Zahlung erfolgt → Rückstellung wird aufgelöst (sinkt); Bank sinkt.' },
    { fall: 'Anpassung Rückstellung', satz: 'A.o. Aufwand / Rückstellung Prozess', erklaerung: 'Neue Schätzung ergibt höheren Betrag → a.o. Aufwand+; Rückstellung erhöht.' },
  ]},
  { label: 'Abgrenzungen', color: 'teal', icon: '⏳', eintraege: [
    { fall: 'Geldguthaben (vorausbezahlter Aufwand / noch nicht erhaltener Ertrag)', satz: 'Aktiv Ra / (Aufwand oder Ertrag)', erklaerung: 'Bereits bezahlter Aufwand / noch nicht erhaltener Ertrag → auf nächstes Jahr abgrenzen → Aktiv Rechnungsabgrenzung (Aktiv+).' },
    { fall: 'Leistungsguthaben (erbrachte Leistung noch nicht verrechnet)', satz: 'Aktiv Ra / (Aufwand oder Ertrag)', erklaerung: 'Leistung wurde erbracht, Geld noch nicht erhalten → Forderung aktivieren → Aktiv Rechnungsabgrenzung.' },
    { fall: 'Geldschuld (erhaltenes Geld für noch nicht erbrachte Leistung)', satz: '(Aufwand oder Ertrag) / Passiv Ra', erklaerung: 'Geld erhalten, Leistung noch nicht erbracht → Schuld gegenüber Empfänger → Passiv Rechnungsabgrenzung (Passiv+).' },
    { fall: 'Leistungsschuld (Aufwand entstanden, noch nicht bezahlt)', satz: '(Aufwand oder Ertrag) / Passiv Ra', erklaerung: 'Aufwand entstanden, noch nicht bezahlt → Schuld → Passiv Rechnungsabgrenzung.' },
  ]},
  { label: 'Löhne', color: 'green', icon: '👷', eintraege: [
    { fall: 'Arbeitnehmerbeiträge (AN-Beiträge)', satz: 'LohnA / Verb. Sozialvers.', erklaerung: 'Vom Bruttolohn einbehaltene AHV/ALV/UV-Beiträge → Lohnaufwand+; Verbindlichkeit gegenüber Sozialversicherung entsteht.' },
    { fall: 'Arbeitgeberbeiträge (AG-Beiträge)', satz: 'Sozialvers.A / Verb. Sozialvers.', erklaerung: 'Arbeitgeberanteil Sozialversicherung (zusätzliche Kosten) → Sozialversicherungsaufwand+; Verbindlichkeit entsteht.' },
    { fall: 'Nettolohn – Auszahlung per Bank', satz: 'LohnA / Bank', erklaerung: 'Nettolohn (Brutto minus AN-Abzüge) wird per Bank ausbezahlt → Lohnaufwand+; Bank sinkt.' },
    { fall: 'Bruttolohn', satz: 'Kein Buchungssatz', erklaerung: 'Der Bruttolohn selbst wird nicht als separater Buchungssatz gebucht – er setzt sich aus Nettolohn + AN-Beiträgen zusammen.' },
    { fall: 'Lohnvorschuss aus Geschäftskasse', satz: 'LohnA / Kasse', erklaerung: 'Vorschuss aus Kasse an Mitarbeiter → Lohnaufwand vorweggenommen; Kasse sinkt.' },
    { fall: 'Spesenentschädigung per Banküberweisung', satz: 'Übr. PersonalA / Bank', erklaerung: 'Spesen werden erstattet → Übriger Personalaufwand+; Bank sinkt.' },
    { fall: 'Weiterbildungsrechnung', satz: 'Übr. PersonalA / VLL', erklaerung: 'Weiterbildungskosten in Rechnung gestellt → Übriger Personalaufwand+; Verbindlichkeit (VLL) entsteht.' },
  ]},
  { label: 'Stille Reserven', color: 'indigo', icon: '🔮', eintraege: [
    { fall: 'Unterbewertung Warenvorrat – Bildung', satz: 'Warenaufwand / Warenvorrat', erklaerung: 'Warenvorrat wird tiefer als effektiver Wert bilanziert → Warenaufwand+ (Gewinn sinkt); stille Reserve entsteht.' },
    { fall: 'Unterbewertung Anlagevermögen – Bildung', satz: 'Abschreibung / Anlagevermögen', erklaerung: 'Anlagevermögen höher abgeschrieben als nötig → Buchwert unter Realwert; stille Reserve entsteht.' },
    { fall: 'Überbewertung Rückstellungen – Bildung', satz: 'Sonst. BA / Rückstellungen', erklaerung: 'Rückstellungen höher angesetzt als nötig → sonstiger BA+; stille Reserve in Passiven entsteht.' },
    { fall: 'Auflösung stille Reserven – Warenvorrat', satz: 'Warenvorrat / Warenaufwand', erklaerung: 'Reserve aufgedeckt → Warenvorrat steigt auf realen Wert; Warenaufwand sinkt (Gewinn steigt).' },
    { fall: 'Auflösung stille Reserven – Anlagevermögen', satz: 'Anlagevermögen / Abschreibung', erklaerung: 'Reserve aufgedeckt → Anlagevermögen steigt; Abschreibung wird rückgängig gemacht.' },
    { fall: 'Auflösung stille Reserven – Rückstellungen', satz: 'Rückstellung / Sonst. BA', erklaerung: 'Überhöhte Rückstellung aufgelöst → Rückstellung sinkt; sonstiger BA sinkt (Gewinn steigt).' },
  ]},
  { label: 'Einzelunternehmen', color: 'cyan', icon: '🧑‍💼', eintraege: [
    { fall: 'Private Rechnung', satz: 'Privat / (Bank / Kasse / Post)', erklaerung: 'Inhaber zahlt privates aus Geschäftsmitteln → Privatkonto belastet (Soll); Geldkonto sinkt.' },
    { fall: 'Privatanteil Fahrzeug', satz: 'Privat / Fahrzeugaufwand', erklaerung: 'Geschäftsfahrzeug privat genutzt → Privat belastet; Fahrzeugaufwand wird korrigiert (sinkt).' },
    { fall: 'Gutschrift Eigenlohn', satz: 'Lohnaufwand / Privat', erklaerung: 'Fiktiver Lohn des Inhabers → Lohnaufwand+; Privatkonto (Haben) wird gutgeschrieben.' },
    { fall: 'Gutschrift Eigenzins', satz: 'Finanzaufwand / Privat', erklaerung: 'Fiktiver Zins auf Eigenkapital → Finanzaufwand+; Privatkonto gutgeschrieben.' },
    { fall: 'Gutschrift Reisespesen', satz: 'Übriger PersonalA / Privat', erklaerung: 'Spesen des Inhabers → Übriger Personalaufwand+; Privatkonto gutgeschrieben.' },
    { fall: 'Kapitalrückzug', satz: 'Eigenkapital / Bank', erklaerung: 'Inhaber entnimmt Kapital aus dem Unternehmen → Eigenkapital sinkt; Bank sinkt.' },
    { fall: 'Sacheinlage Fahrzeug', satz: 'Fahrzeug / Eigenkapital', erklaerung: 'Inhaber bringt sein Fahrzeug als Einlage ins Unternehmen → Anlagevermögen+; Eigenkapital+.' },
    { fall: 'Übertrag Privatkonto (Jahresabschluss)', satz: 'Privat / Eigenkapital', erklaerung: 'Jahresabschluss: Privatkonto (Saldo aus Entnahmen/Einlagen) wird auf Eigenkapital übertragen.' },
    { fall: 'Verlustvortrag (1. Geschäftsjahr)', satz: 'Eigenkapital / Jahresverlust', erklaerung: 'Jahresverlust aus erstem Geschäftsjahr wird auf Eigenkapital übertragen → EK sinkt.' },
  ]},
  { label: 'Aktiengesellschaft (AG)', color: 'purple', icon: '🏢', eintraege: [
    { fall: 'Kapitalverpflichtung (Gründung)', satz: 'Ford. Aktionäre / Aktienkapital', erklaerung: 'Aktionäre verpflichten sich zur Einlage → Forderung an Aktionäre+; Aktienkapital (EK) entsteht.' },
    { fall: 'Liberierung (Einzahlung)', satz: 'Bank / Ford. Aktionäre', erklaerung: 'Aktionäre zahlen ein → Bank+; Forderung an Aktionäre sinkt.' },
    { fall: 'Dividende beschlossen', satz: 'Jahresgewinn / Verb. Dividende', erklaerung: 'GV beschliesst Dividende → Jahresgewinn sinkt; Verbindlichkeit Dividende (Passiv) entsteht.' },
    { fall: 'Dividende ausbezahlt', satz: 'Verb. Dividende / Bank', erklaerung: 'Dividende ausbezahlt → Verbindlichkeit sinkt; Bank sinkt.' },
    { fall: 'Gesetzliche Reserven bilden', satz: 'Jahresgewinn / Gesetzliche Reserven', erklaerung: 'Pflichtteil (5% des Gewinns bis 20% AK) → Jahresgewinn sinkt; Gesetzliche Reserven steigen.' },
    { fall: 'Kapitalerhöhung – neue Aktien', satz: 'Bank / Aktienkapital', erklaerung: 'Neue Aktien ausgegeben und einbezahlt → Bank+; Aktienkapital (EK) steigt.' },
    { fall: 'Jahresgewinn abschliessen', satz: 'Erfolgsrechnung / Jahresgewinn', erklaerung: 'Jahresabschluss: ER-Saldo (Gewinn) wird auf Jahresgewinnkonto übertragen.' },
    { fall: 'Jahresverlust abschliessen', satz: 'Jahresverlust / Erfolgsrechnung', erklaerung: 'Jahresabschluss: Verlust aus der ER wird auf Jahresverlust-Konto übertragen.' },
  ]},
  { label: 'Immobilien / Liegenschaften', color: 'emerald', icon: '🏠', eintraege: [
    { fall: 'Kauf Liegenschaft (Bankfinanzierung)', satz: 'Liegenschaften / Bank', erklaerung: 'Liegenschaft gekauft → Anlagevermögen+; Bank sinkt (Finanzierung aus Eigenem).' },
    { fall: 'Hypothekarkredit aufnehmen', satz: 'Bank / Hypothek', erklaerung: 'Kredit bei Bank aufgenommen → Bank+; Hypothek (langfristige Verbindlichkeit) entsteht.' },
    { fall: 'Hypothekarzinsen bezahlen', satz: 'Hypoth.Zinsen / Bank', erklaerung: 'Zinslast aus Hypothek bezahlt → Hypothekarzinsaufwand+; Bank sinkt.' },
    { fall: 'Mieteinnahmen erhalten', satz: 'Bank / Mietzinsertrag', erklaerung: 'Mietgeld erhalten → Bank+; Mietzinsertrag (Ertrag) erzielt.' },
    { fall: 'Unterhaltskosten Liegenschaft', satz: 'Liegenschaftsaufwand / Bank', erklaerung: 'Kosten für Unterhalt/Reparatur → Liegenschaftsaufwand+; Bank sinkt.' },
    { fall: 'Abschreibung Liegenschaft (direkt)', satz: 'Abs Liegenschaften / Liegenschaften', erklaerung: 'Wertverlust direkt abgeschrieben → Abschreibungsaufwand+; Liegenschaft sinkt im Buchwert.' },
  ]},
  { label: 'Fremde Währungen', color: 'pink', icon: '💱', eintraege: [
    { fall: 'Kursgewinn realisiert (Forderung in Fremdwährung)', satz: 'Bank / Kursgewinn', erklaerung: 'Forderung in Fremdwährung eingegangen → CHF-Betrag höher als erwartet → Kursgewinn (Finanzertrag).' },
    { fall: 'Kursverlust realisiert (Forderung in Fremdwährung)', satz: 'Kursverlust / Bank', erklaerung: 'Forderung eingegangen → CHF-Betrag tiefer als erwartet → Kursverlust (Finanzaufwand).' },
    { fall: 'Kursgewinn realisiert (Verbindlichkeit in Fremdwährung)', satz: 'Verb. Fremdwährung / Kursgewinn', erklaerung: 'Verbindlichkeit bezahlt → CHF-Betrag tiefer als verbucht → Kursgewinn; Schuld war weniger wert.' },
    { fall: 'Kursverlust realisiert (Verbindlichkeit in Fremdwährung)', satz: 'Kursverlust / Verb. Fremdwährung', erklaerung: 'Verbindlichkeit bezahlt → CHF-Betrag höher als verbucht → Kursverlust; Schuld war mehr wert.' },
    { fall: 'Bewertung Jahresende – Kursgewinn (nicht realisiert)', satz: 'FLL / Kursgewinn (passivieren)', erklaerung: 'Forderung am Jahresende zu aktuellem Kurs bewertet → höherer CHF-Wert → Kursgewinn passivieren (vorsichtig).' },
    { fall: 'Bewertung Jahresende – Kursverlust (nicht realisiert)', satz: 'Kursverlust / FLL (aktivieren)', erklaerung: 'Forderung am Jahresende zu aktuellem Kurs bewertet → niedrigerer CHF-Wert → Kursverlust aktivieren (Vorsichtsprinzip).' },
  ]},
  { label: 'Formeln Liegenschaften', color: 'yellow', icon: '📐', eintraege: [
    { fall: 'Finanzierung', satz: 'Kaufpreis − Hypothek = Eigene Mittel', erklaerung: 'Kaufpreis minus aufgenommene Hypothek ergibt das eingesetzte Eigenkapital des Investors.' },
    { fall: 'Liegenschaftserfolg', satz: 'Mietzinseinnahmen − Hypothekarzinsen − Unterhaltskosten = Liegenschaftsgewinn', erklaerung: 'Mieteinnahmen minus alle Liegenschaftskosten ergibt den jährlichen Liegenschaftsgewinn.' },
    { fall: 'Bruttorendite', satz: '(Liegenschaftserfolg × 100) / Kaufpreis', erklaerung: 'Rendite bezogen auf den Gesamtkaufpreis (Gesamtinvestition, inkl. Hypothek).' },
    { fall: 'Nettorendite', satz: '(Liegenschaftsgewinn × 100) / Eigene Mittel', erklaerung: 'Rendite bezogen auf das eingesetzte Eigenkapital (ohne Fremdkapital).' },
    { fall: 'Ertragswert', satz: '(Liegenschaftserfolg × 100) / Bruttorendite in %', erklaerung: 'Kapitalisierter Liegenschaftserfolg → zeigt, was die Liegenschaft bei gegebener Rendite wert ist.' },
  ]},
  { label: 'Unterbilanz & Überschuldung', color: 'rose', icon: '🚨', eintraege: [
    { fall: 'Unterbilanz OHNE gesetzliche Folgen', satz: 'Aktiven decken FK + mindestens ½ EK (Aktienkapital + ges. Reserven)', erklaerung: 'Bilanzverlust vorhanden, aber Aktiven decken noch mindestens die Hälfte von Aktienkapital + ges. Reserven → keine gesetzl. Massnahmen.' },
    { fall: 'Unterbilanz MIT gesetzlichen Folgen', satz: 'Aktiven decken FK, aber weniger als ½ EK', erklaerung: 'Aktiven decken das FK noch, aber weniger als ½ EK (AK + ges. Reserven) → VR muss Sanierungsmassnahmen einleiten.' },
    { fall: 'Überschuldung', satz: 'Aktiven < FK → kein EK mehr, Bilanzverlust übersteigt gesamtes EK', erklaerung: 'Aktiven kleiner als Fremdkapital → gesamtes EK aufgezehrt → VR muss Richter benachrichtigen (Konkursrisiko).' },
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
type QuizFrage = { fall: string; richtig: string; optionen: string[]; katColor: string; erklaerung?: string }

function genQuiz(pool: Eintrag[], alleAntworten: string[], anzahl: number, katColor: string): QuizFrage[] {
  return shuffle(pool).slice(0, anzahl).map(e => ({
    fall: e.fall, richtig: e.satz, katColor, erklaerung: e.erklaerung,
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

  const progress = (index / fragen.length) * 100

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto fade-in">

      {/* HUD */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
          style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, color: '#64748b' }}>
          <ArrowLeft size={14}/>
        </button>

        {/* Progress bar */}
        <div className="flex-1 space-y-1.5">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${c.accent}, ${c.text})` }}/>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold" style={{ color: '#475569' }}>{index + 1}/{fragen.length}</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
            {richtig} ✓
          </span>
        </div>
      </div>

      {/* Frage-Karte */}
      <div className="rounded-2xl overflow-hidden"
        style={{ boxShadow: `0 0 0 1px ${c.border}, 0 8px 32px rgba(0,0,0,0.2)` }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${c.accent}, ${c.text})` }}/>
        <div className="p-8 text-center" style={{ background: CARD_BG }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: c.soft, color: c.text, border: `1px solid ${c.border}` }}>
            Buchungsfall
          </div>
          <p className="text-lg sm:text-xl font-bold leading-snug" style={{ color: '#f1f5f9' }}>{frage.fall}</p>
        </div>
      </div>

      {/* Antwort-Optionen */}
      <div className="grid grid-cols-1 gap-2.5">
        {frage.optionen.map((opt, i) => {
          const letter = ['A', 'B', 'C', 'D'][i]
          const isRichtig = opt === frage.richtig
          const isGewählt = opt === gewählt

          let bg = CARD_SURFACE
          let borderColor = CARD_BORDER
          let textColor = '#94a3b8'
          let letterBg = 'rgba(255,255,255,0.05)'
          let letterColor = '#475569'
          let shadow = 'none'

          if (gewählt) {
            if (isRichtig) {
              bg = 'rgba(34,197,94,0.08)'; borderColor = 'rgba(34,197,94,0.35)'
              textColor = '#86efac'; letterBg = 'rgba(34,197,94,0.15)'; letterColor = '#4ade80'
              shadow = '0 0 0 1px rgba(34,197,94,0.2)'
            } else if (isGewählt) {
              bg = 'rgba(239,68,68,0.08)'; borderColor = 'rgba(239,68,68,0.35)'
              textColor = '#fca5a5'; letterBg = 'rgba(239,68,68,0.15)'; letterColor = '#f87171'
              shadow = '0 0 0 1px rgba(239,68,68,0.2)'
            } else {
              textColor = '#3d4d66'
            }
          }

          return (
            <button key={i} onClick={() => antworten(opt)} disabled={!!gewählt}
              className="w-full text-left rounded-xl border transition-all duration-200 disabled:cursor-default group"
              style={{ background: bg, borderColor, boxShadow: shadow }}
              onMouseEnter={e => {
                if (!gewählt) (e.currentTarget as HTMLElement).style.borderColor = c.border
              }}
              onMouseLeave={e => {
                if (!gewählt) (e.currentTarget as HTMLElement).style.borderColor = CARD_BORDER
              }}
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg text-[11px] font-black shrink-0 transition-all"
                  style={{ background: letterBg, color: letterColor, border: `1px solid ${borderColor}` }}>
                  {letter}
                </span>
                <span className="text-sm font-mono font-medium transition-colors" style={{ color: textColor }}>
                  {opt}
                </span>
                {gewählt && isRichtig && <CheckCircle2 size={15} className="ml-auto shrink-0 text-emerald-400"/>}
                {gewählt && isGewählt && !isRichtig && <XCircle size={15} className="ml-auto shrink-0 text-red-400"/>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback + Weiter */}
      {gewählt && (
        <div className="space-y-3 fade-in">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
            style={{
              background: isCorrect ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
              border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
            {isCorrect
              ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0"/>
              : <XCircle size={18} className="text-red-400 shrink-0"/>}
            <div className="text-sm">
              {isCorrect
                ? <span className="font-bold text-emerald-300">Richtig!</span>
                : <><span className="text-slate-500">Richtig wäre: </span><span className="font-bold text-red-300">{frage.richtig}</span></>}
            </div>
          </div>

          {!isCorrect && frage.erklaerung && (
            <div className="px-4 py-3 rounded-xl text-xs leading-relaxed"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>
              <span className="font-semibold" style={{ color: '#a5b4fc' }}>Erklärung: </span>{frage.erklaerung}
            </div>
          )}

          <button onClick={weiter}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: isCorrect ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
              boxShadow: isCorrect ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(59,130,246,0.3)' }}>
            {index + 1 >= fragen.length
              ? <><Trophy size={15}/> Ergebnis anzeigen</>
              : <>Weiter <ArrowRight size={15}/></>}
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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers size={12} style={{ color: '#3d4d66' }}/>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3d4d66' }}>
            FRW · Kontenrahmen KMU · HEP
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-1" style={{ color: '#e4e4ed' }}>Buchungssätze</h1>
            <p className="text-sm" style={{ color: '#4a5a78' }}>
              {KATEGORIEN.length} Kategorien · {total} Karten
            </p>
          </div>
          <button onClick={() => setView({ type: 'quiz' })}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] shrink-0 self-start sm:self-auto"
            style={{ background: '#f59e0b', color: '#09090e' }}>
            <Zap size={15}/> Quiz starten
          </button>
        </div>
      </div>

      {/* Work-in-progress banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <span style={{ fontSize: 15 }}>⚠️</span>
        <span style={{ color: '#fcd34d' }}>
          <strong>Nicht fertig</strong> – aber kann man schon benutzen. Weitere FRW-Themen folgen laufend.
        </span>
      </div>

      {/* Grid */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#3d4d66' }}>
          Kategorie wählen
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KATEGORIEN.map(kat => {
            const c = C[kat.color] ?? C.blue
            return (
              <button key={kat.label} onClick={() => setView({ type: 'study', kat })}
                className="group text-left rounded-2xl p-5 transition-all duration-200 overflow-hidden"
                style={{
                  background: CARD_SURFACE,
                  border: `1px solid ${CARD_BORDER}`,
                  borderLeft: `3px solid ${c.accent}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = c.soft
                  el.style.borderColor = c.border
                  el.style.borderLeftColor = c.accent
                  el.style.boxShadow = `0 4px 24px rgba(0,0,0,0.18), 0 0 0 1px ${c.border}`
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = CARD_SURFACE
                  el.style.borderColor = CARD_BORDER
                  el.style.borderLeftColor = c.accent
                  el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {/* Top row: icon + count */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: c.soft, border: `1px solid ${c.border}` }}>
                    {kat.icon}
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: c.text, background: c.soft, border: `1px solid ${c.border}` }}>
                    {kat.eintraege.length} Karten
                  </span>
                </div>

                {/* Label */}
                <h3 className="font-bold text-sm mb-1 leading-snug text-slate-200">
                  {kat.label}
                </h3>
                <p className="text-[11px] line-clamp-1 leading-relaxed mb-4 text-slate-500">
                  {kat.eintraege[0].fall}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-200 group-hover:gap-2.5"
                  style={{ color: c.text }}>
                  Karten lernen <ArrowRight size={12}/>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
