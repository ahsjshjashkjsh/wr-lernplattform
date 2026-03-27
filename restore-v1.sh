#!/bin/bash
echo "⚠️  Achtung: Dies setzt main auf v1-backup-vor-redesign zurück!"
echo "Alle Änderungen nach dem 27.03.2026 werden überschrieben."
echo ""
read -p "Bist du sicher? (ja/nein): " confirm

if [ "$confirm" = "ja" ]; then
  git fetch --tags
  git reset --hard v1-backup-vor-redesign
  git push origin main --force
  echo "✅ Erfolgreich zurückgesetzt auf v1-backup-vor-redesign"
else
  echo "Abgebrochen."
fi
