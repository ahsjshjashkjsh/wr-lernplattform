Lese alle akzeptierten Feedbacks aus der Datenbank und schlage Verbesserungen vor.

1. Führe folgenden Befehl aus um die akzeptierten Feedbacks zu laden:
```
cd "c:\ÜBUNGSTOOL ABSCHLUSSPRÜFUNG WR\wr-lernplattform" && DATABASE_URL="postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:5432/postgres" npx prisma db execute --stdin <<'EOF'
SELECT id, "userName", title, message, category, "adminNote", "createdAt" FROM "Feedback" WHERE status IN ('accepted') ORDER BY "createdAt" DESC;
EOF
```

2. Analysiere jeden Eintrag und erstelle eine übersichtliche Liste mit:
   - Was genau gemeldet wurde
   - In welcher Kategorie (Fehler / Vorschlag / Inhalt / Allgemein)
   - Welche Dateien wahrscheinlich betroffen sind
   - Was du konkret ändern würdest

3. Zeige dem User die vollständige Liste der geplanten Änderungen und frage explizit:
   "Soll ich diese Änderungen umsetzen? (ja/nein für jede einzeln oder alle auf einmal)"

4. Warte auf die Bestätigung des Users bevor du irgendwelchen Code änderst.

5. Setze nur die vom User bestätigten Änderungen um, pushe danach mit /push.
