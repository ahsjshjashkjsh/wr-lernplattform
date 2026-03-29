# Premium-System Design
**Datum:** 2026-03-29
**Status:** Approved

---

## Überblick

Ein schlankes, manuelles Premium-System für die HMS-Lernplattform. Schüler können AP-Inhalte (Abschlussprüfung) durch ein einmonatiges Abo freischalten. Zahlung erfolgt per Twint an den Betreiber, der den User manuell im Admin-Panel aktiviert. Kein externer Zahlungsanbieter.

---

## 1. Datenmodell

### Erweiterung `User`
```prisma
isPremium     Boolean   @default(false)
premiumUntil  DateTime?
```

### Neues Model `PremiumRequest`
```prisma
model PremiumRequest {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  code      String   @unique  // z.B. "HMS-4X7K" — 8 Zeichen, alphanumerisch
  status    String   @default("pending")  // "pending" | "approved" | "rejected"
  createdAt DateTime @default(now())
}
```

**Code-Format:** `HMS-XXXX` — 4 zufällige Grossbuchstaben/Ziffern. Eindeutig in der DB.
**Regel:** Ein User kann immer nur eine offene (`pending`) Anfrage haben.

---

## 2. Content-Gating Logik

**QSP-Datum: 17. April 2026** — vor diesem Datum ist alles kostenlos (Testphase). Ab diesem Datum gilt das Premium-Gate für AP-Inhalte.

```typescript
const QSP_DATE = new Date('2026-04-17T00:00:00')
const isBeforeQSP = () => new Date() < QSP_DATE
```

Bestehende Topics haben bereits das Feld `examType`:

| examType        | Vor QSP (< 17.04.2026) | Nach QSP (≥ 17.04.2026) |
|-----------------|------------------------|--------------------------|
| `"querschnitt"` | Gratis                 | Gratis                   |
| `"both"`        | Gratis                 | Gratis                   |
| `"abschluss"`   | **Gratis (Testphase)** | Nur Premium              |

**Hinweis:** WR enthält aktuell ausschliesslich QSP-Stoff (`querschnitt`/`both`), daher ist WR vollständig gratis. Das System ist bereit sobald AP-Stoff für WR nachgeladen wird.

**Ablaufprüfung:** `isPremium && premiumUntil > now()` → Zugang gewährt.
Abgelaufenes Premium wird wie kein Premium behandelt.

**Darstellung gesperrter Inhalte:** AP-Kapitel werden mit Lock-Icon und Banner "Nur mit Premium" angezeigt — kein blindes Ausblenden. User sieht was existiert, kann aber nicht öffnen.

---

## 3. User-Flow (Premium anfragen)

1. User besucht `/premium`
2. Seite zeigt: Was ist Premium, Preis, Twint-QR/-Nummer
3. Klick auf "Jetzt anfragen" → API erstellt `PremiumRequest` mit einzigartigem Code
4. Code wird gross angezeigt: *"Schreibe HMS-4X7K ins Twint-Mitteilungsfeld"*
5. User zahlt per Twint mit Code im Mitteilungsfeld
6. Betreiber sieht Code in Twint-App, sucht ihn im Admin-Panel
7. Klick "Freischalten" → `isPremium = true`, `premiumUntil = now + 30 Tage`, `status = "approved"`
8. User sieht beim nächsten Seitenaufruf seinen Premium-Status

---

## 4. Seiten & UI-Komponenten

### `/premium` (neue Seite)
- Erklärt Premium-Zugang (AP-Inhalte, 1 Monat)
- Preis (vom Betreiber festgelegt, als Umgebungsvariable `PREMIUM_PRICE`)
- Twint-QR als Bild + Twint-Nummer (als Umgebungsvariable `TWINT_NUMBER`)
- Button "Jetzt anfragen" (nur für eingeloggte User ohne aktive Anfrage)
- Falls offene Anfrage existiert: Code wird angezeigt, kein neuer Button
- Falls Premium aktiv: zeigt "Premium aktiv bis [Datum]"

### Navbar / Profil
- Premium-Badge: "Premium bis [Datum]" wenn aktiv
- "Premium holen" Link wenn nicht aktiv

### Gesperrte Kapitel
- Lock-Icon auf AP-Kapitel-Cards
- Beim Öffnen: Overlay/Banner "Dieser Inhalt ist nur mit Premium verfügbar" + Link zu `/premium`

### Admin-Panel — neuer Tab "Premium"
- Tabelle: Code | User-Name | E-Mail | Datum | Status
- Pro Zeile: Button "Freischalten" (pending → approved, setzt Premium 30 Tage)
- Pro Zeile: Button "Ablehnen" (pending → rejected)
- Abgelaufene Premium-User werden automatisch erkannt (kein Cron-Job nötig — Prüfung on-demand)

---

## 5. API-Routes

| Route | Methode | Beschreibung |
|---|---|---|
| `/api/premium/request` | POST | Erstellt PremiumRequest + generiert Code |
| `/api/premium/status` | GET | Gibt aktuellen Premium-Status des eingeloggten Users zurück |
| `/api/admin/premium` | GET | Alle PremiumRequests (nur Admin) |
| `/api/admin/premium/[id]/approve` | POST | Schaltet Premium frei (nur Admin) |
| `/api/admin/premium/[id]/reject` | POST | Lehnt Anfrage ab (nur Admin) |

---

## 6. Scope-Abgrenzung (was NICHT gebaut wird)

- Kein Stripe / keine automatische Zahlung
- Keine E-Mail-Benachrichtigung
- Kein automatischer Ablauf per Cron-Job (Ablauf wird on-demand geprüft)
- Kein Gruppen-/Klassen-Rabatt
- Keine Rechnungen / Quittungen
