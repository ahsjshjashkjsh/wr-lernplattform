Führe folgende Schritte aus um die Webseite auf den Backup-Stand v1-backup-vor-redesign zurückzusetzen:

1. Zeige dem User welchen Stand er wiederherstellt (Tag-Datum und Beschreibung via `git tag -v v1-backup-vor-redesign`)
2. Frage explizit: "Bist du sicher? Alle Änderungen nach dem 27.03.2026 werden überschrieben und können nicht wiederhergestellt werden."
3. Warte auf Bestätigung des Users
4. Führe aus:
   ```bash
   git fetch --tags
   git reset --hard v1-backup-vor-redesign
   git push origin main --force
   ```
5. Bestätige dem User dass der Reset erfolgreich war und Vercel automatisch neu deployt
