import psycopg2, os

conn = psycopg2.connect('postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:5432/postgres')
cur = conn.cursor()

BASE = 'c:/Wr-Lernplattform/Inhalt/FRW/Band 2'

def read_md(relpath):
    fp = os.path.join(BASE, relpath)
    with open(fp, encoding='utf-8') as f:
        return f.read()

def set_summary(slug, content):
    cur.execute('SELECT id FROM "Chapter" WHERE slug=%s', (slug,))
    r = cur.fetchone()
    if not r:
        print(f'  [SKIP] {slug} not found')
        return
    cur.execute('UPDATE "Chapter" SET summary=%s WHERE id=%s', (content, r[0]))
    print(f'  [{slug}] summary gesetzt ({len(content)} chars)')

# Mapping: MD-Datei → Kapitel-Slugs (beide erhalten die vollstaendige Zusammenfassung)
MAPPINGS = [
    (
        'Abschreibung (Band 2, Kapitel 4)/Claude Code/abschreibungen_zusammenfassung (1).md',
        ['abschreibungen-methoden', 'abschreibungen']
    ),
    (
        'AG (inkl. Gewinnverteilung) (Band 2, Kapitel 8)/Claude Code/aktiengesellschaft_zusammenfassung (1).md',
        ['aktiengesellschaft']
    ),
    (
        'Bewertungsvorschriften, Stille Reserven, Bilanzbereinigung (Band 2, Kapitel 9)/Claude Code/bewertungen_und_stille_reserven_zusammenfassung (1).md',
        ['stille-reserven', 'bewertungsvorschriften-vertieft']
    ),
    (
        'Einzelunternehung (Band 2, Kapitel 7)/Claude Code/einzelunternehmen_zusammenfassung.md',
        ['einzelunternehmung']
    ),
    (
        'Fremde Währung (Band 2, Kapitel 2)/Claude Code/fremde_waehrungen_zusammenfassung.md',
        ['waehrungsumrechnung', 'fremde-waehrung']
    ),
    (
        'Löhne und Gehälter (Band 2, Kapitel 6)/Claude Code/loehne_und_gehaelter_zusammenfassung.md',
        ['lohnbuchhaltung', 'loehne-gehaelter']
    ),
    (
        'Verluste aus Forderung inkl. WB Ford. (Band 2, Kapitel 3)/Claude Code/kreditverkehr_und_verluste_aus_forderungen_zusammenfassung.md',
        ['debitorenverluste', 'verluste-forderungen']
    ),
    (
        'Zeitliche Abgrenzungen (inkl Rückstellungen) (Band 2, Kapitel 5)/Claude Code/abgrenzungen_und_rueckstellungen_zusammenfassung.md',
        ['transitorische-posten', 'zeitliche-abgrenzungen']
    ),
]

print('=== FRW Zusammenfassungen hochladen ===\n')

for relpath, slugs in MAPPINGS:
    try:
        content = read_md(relpath)
        topic = relpath.split('/')[0]
        print(f'{topic[:50]}:')
        for slug in slugs:
            set_summary(slug, content)
    except FileNotFoundError:
        print(f'  [ERROR] Datei nicht gefunden: {relpath}')

conn.commit()
conn.close()
print('\nFertig!')
