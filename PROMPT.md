# FRW Zusammenfassungen — Aufgabe

Lies alle Fotos in diesem Ordner Kapitel für Kapitel:
`c:\ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR\wr-lernplattform\Inhalt\FRW\Band 2`

Für JEDES der 9 Kapitel:
1. Liste alle Dateien im Kapitel-Ordner auf (Bash ls)
2. Lies ALLE Fotos mit dem Read-Tool — Bilder können direkt eingelesen werden
3. Schreibe eine Zusammenfassung NUR basierend auf dem Bildinhalt — NICHTS erfinden
4. Format PFLICHT: `ÜBERSCHRIFT — Satz1. Satz2. Satz3.` (em-Dash —, jeder Satz = ein Bullet)
5. Lade die Summary direkt in die DB für BEIDE Slugs:

```
DATABASE_URL="postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" node -e "
const pg = require('pg');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
  const summary = \`HIER_KOMMT_DIE_SUMMARY\`;
  await client.query('UPDATE \"Chapter\" SET summary=\$1, \"updatedAt\"=NOW() WHERE slug=\$2', [summary, 'SLUG1']);
  await client.query('UPDATE \"Chapter\" SET summary=\$1, \"updatedAt\"=NOW() WHERE slug=\$2', [summary, 'SLUG2']);
  console.log('done');
  await client.end();
});
"
```

## Kapitel und ihre Slugs

| Ordner | slug1 | slug2 |
|--------|-------|-------|
| Fremde Währung (Band 2, Kapitel 2) | waehrungsumrechnung | fremde-waehrung |
| Verluste aus Forderung inkl. WB Ford. (Band 2, Kapitel 3) | debitorenverluste | verluste-forderungen |
| Abschreibung (Band 2, Kapitel 4) | abschreibungen-methoden | abschreibungen |
| Zeitliche Abgrenzungen (inkl Rückstellungen) (Band 2, Kapitel 5) | transitorische-posten | zeitliche-abgrenzungen |
| Löhne und Gehälter (Band 2, Kapitel 6) | lohnbuchhaltung | loehne-gehaelter |
| Einzelunternehung (Band 2, Kapitel 7) | einzelunternehmung | einzelunternehmung-vertieft |
| AG (inkl. Gewinnverteilung) (Band 2, Kapitel 8) | aktiengesellschaft | ag-gewinnverteilung |
| Bewertungsvorschriften, Stille Reserven, Bilanzbereinigung (Band 2, Kapitel 9) | stille-reserven | bewertungsvorschriften-vertieft |
| Analyse der Bilanz und Erfolgsrechnung (Band 2, Kapitel 11) | liquiditaet-rentabilitaet | bilanzanalyse |

## Fertig

Wenn alle 9 Kapitel gelesen, zusammengefasst und in die DB geladen wurden:
`<promise>ALLE FRW SUMMARIES FERTIG</promise>`
