import psycopg2, json, uuid

conn = psycopg2.connect('postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:5432/postgres')
cur = conn.cursor()

with open('c:/Wr-Lernplattform/Inhalt/FRW/Band 2/Zeitliche Abgrenzungen (inkl Rückstellungen) (Band 2, Kapitel 5)/Claude Code/rechnungswesen_lerntool_pack_v6.json', encoding='utf-8') as f:
    pack = json.load(f)

# ── Helpers ──────────────────────────────────────────────────────────────

def get_chapter_id(slug):
    cur.execute('SELECT id FROM "Chapter" WHERE slug=%s', (slug,))
    r = cur.fetchone()
    return r[0] if r else None

def max_order(table, cid):
    cur.execute(f'SELECT COALESCE(MAX("order"), -1) FROM "{table}" WHERE "chapterId"=%s', (cid,))
    return cur.fetchone()[0]

def add_goals(cid, items):
    base = max_order('LearningGoal', cid)
    added = 0
    for i, text in enumerate(items):
        cur.execute('SELECT 1 FROM "LearningGoal" WHERE "chapterId"=%s AND text=%s', (cid, text))
        if not cur.fetchone():
            cur.execute('INSERT INTO "LearningGoal"(id,text,"chapterId","order") VALUES(%s,%s,%s,%s)',
                        (str(uuid.uuid4()), text, cid, base+1+i))
            added += 1
    return added

def add_terms(cid, terminology_dict):
    base = max_order('KeyTerm', cid)
    added = 0
    items = list(terminology_dict.items()) if isinstance(terminology_dict, dict) else []
    for i, (term, definition) in enumerate(items):
        cur.execute('SELECT 1 FROM "KeyTerm" WHERE "chapterId"=%s AND term=%s', (cid, term))
        if not cur.fetchone():
            cur.execute('INSERT INTO "KeyTerm"(id,term,definition,"chapterId","order") VALUES(%s,%s,%s,%s,%s)',
                        (str(uuid.uuid4()), term, definition, cid, base+1+i))
            added += 1
    return added

def add_points(cid, points):
    base = max_order('CorePoint', cid)
    added = 0
    for i, text in enumerate(points):
        cur.execute('SELECT 1 FROM "CorePoint" WHERE "chapterId"=%s AND text=%s', (cid, text))
        if not cur.fetchone():
            cur.execute('INSERT INTO "CorePoint"(id,text,"chapterId","order") VALUES(%s,%s,%s,%s)',
                        (str(uuid.uuid4()), text, cid, base+1+i))
            added += 1
    return added

def add_formulas(cid, formulas):
    base = max_order('Formula', cid)
    added = 0
    for i, f in enumerate(formulas):
        if isinstance(f, str):
            name = f.split('=')[0].strip() if '=' in f else f[:60]
            formel = f
            erklaerung = ''
        elif isinstance(f, dict):
            name = f.get('name', '')
            formel = f.get('formula', f.get('formel', ''))
            erklaerung = f.get('meaning', f.get('explanation', f.get('erklaerung', '')))
        else:
            continue
        if not name or not formel:
            continue
        cur.execute('SELECT 1 FROM "Formula" WHERE "chapterId"=%s AND name=%s', (cid, name))
        if not cur.fetchone():
            cur.execute('INSERT INTO "Formula"(id,name,formel,erklaerung,"chapterId","order") VALUES(%s,%s,%s,%s,%s,%s)',
                        (str(uuid.uuid4()), name, formel, erklaerung, cid, base+1+i))
            added += 1
    return added

def add_bookings(cid, entries):
    base = max_order('BookingEntry', cid)
    added = 0
    for i, e in enumerate(entries):
        situation = e.get('case', e.get('situation', ''))
        entry_str = e.get('entry', '')
        if entry_str and ' / ' in entry_str:
            parts = entry_str.split(' / ', 1)
            soll, haben = parts[0].strip(), parts[1].strip()
        elif 'sollKonto' in e:
            soll = e.get('sollKonto', '')
            haben = e.get('habenKonto', '')
        else:
            continue
        erklaerung = e.get('note', e.get('erklaerung', situation))
        if not soll or not haben:
            continue
        cur.execute('SELECT 1 FROM "BookingEntry" WHERE "chapterId"=%s AND situation=%s AND "sollKonto"=%s',
                    (cid, situation, soll))
        if not cur.fetchone():
            cur.execute('INSERT INTO "BookingEntry"(id,situation,"sollKonto","habenKonto",erklaerung,"chapterId","order") VALUES(%s,%s,%s,%s,%s,%s,%s)',
                        (str(uuid.uuid4()), situation, soll, haben, erklaerung, cid, base+1+i))
            added += 1
    return added

def set_summary(cid, jch):
    """Build a Markdown summary from theory_blocks."""
    blocks = jch.get('theory_blocks', [])
    if not blocks:
        return 0
    cur.execute('SELECT summary FROM "Chapter" WHERE id=%s', (cid,))
    existing = cur.fetchone()[0]
    if existing:
        return 0  # already has summary
    lines = []
    for tb in blocks:
        title = tb.get('title', '')
        if title:
            lines.append(f'## {title}')
        summary = tb.get('summary', tb.get('definition', ''))
        if summary:
            lines.append(summary)
        details = tb.get('details', tb.get('points', []))
        for d in details:
            lines.append(f'- {d}')
        note = tb.get('important_note', '')
        if note:
            lines.append(f'> {note}')
        lines.append('')
    md = '\n'.join(lines).strip()
    if md:
        cur.execute('UPDATE "Chapter" SET summary=%s WHERE id=%s', (md, cid))
        return 1
    return 0

def get_all_points(jch):
    points = list(jch.get('core_principles', []))
    for tb in jch.get('theory_blocks', []):
        for p in tb.get('points', []):
            if p not in points:
                points.append(p)
    return points

def find_ch(keyword):
    return next((c for c in pack['chapters'] if keyword.lower() in c.get('title','').lower()), None)

def upload(slug, jch, points_slice=None, fs_slice=None, bp_slice=None):
    cid = get_chapter_id(slug)
    if not cid:
        print(f'  [SKIP] slug not found: {slug}')
        return
    goals_list  = jch.get('learning_objectives', [])
    terms_dict  = jch.get('terminology', {})
    all_points  = get_all_points(jch)
    all_fs      = jch.get('key_formulas_and_rules', jch.get('formulas', []))
    all_bp      = jch.get('booking_patterns', jch.get('journal_patterns', []))

    pts = all_points[points_slice] if points_slice else all_points
    fs  = all_fs[fs_slice]         if fs_slice  else all_fs
    bp  = all_bp[bp_slice]         if bp_slice  else all_bp

    g = add_goals(cid, goals_list)
    t = add_terms(cid, terms_dict)
    p = add_points(cid, pts)
    f = add_formulas(cid, fs)
    b = add_bookings(cid, bp)
    s = set_summary(cid, jch)
    print(f'  [{slug}] goals+{g} terms+{t} points+{p} formulas+{f} bookings+{b} summary+{s}')

# ── Upload per chapter ─────────────────────────────────────────────────

print('=== FRW Band 2 — Vollständiger Upload (ohne Quiz) ===\n')

# 1. Löhne und Gehälter
jch = find_ch('hne und Geh')
if jch:
    print('Löhne und Gehälter:')
    upload('lohnbuchhaltung',  jch, points_slice=slice(None, len(get_all_points(jch))//2))
    upload('loehne-gehaelter', jch, points_slice=slice(len(get_all_points(jch))//2, None))

# 2. Fremde Währungen
jch = find_ch('Fremd')
if jch:
    print('Fremde Währungen:')
    half_p = len(get_all_points(jch))//2
    half_f = len(jch.get('key_formulas_and_rules', jch.get('formulas',[])))//2
    upload('waehrungsumrechnung', jch, points_slice=slice(None,half_p), fs_slice=slice(None,half_f))
    upload('fremde-waehrung',     jch, points_slice=slice(half_p,None), fs_slice=slice(half_f,None))

# 3. Kreditverkehr / Verluste aus Forderungen
jch = find_ch('Kreditverkehr')
if jch:
    print('Verluste aus Forderungen:')
    half_p = len(get_all_points(jch))//2
    half_f = len(jch.get('key_formulas_and_rules', jch.get('formulas',[])))//2
    half_b = len(jch.get('booking_patterns', jch.get('journal_patterns',[])))//2
    upload('debitorenverluste',   jch, points_slice=slice(None,half_p), fs_slice=slice(None,half_f), bp_slice=slice(None,half_b))
    upload('verluste-forderungen',jch, points_slice=slice(half_p,None), fs_slice=slice(half_f,None), bp_slice=slice(half_b,None))

# 4. Abschreibungen
jch = next((c for c in pack['chapters'] if c.get('title')=='Abschreibungen'), None)
if jch:
    print('Abschreibungen:')
    half_p = len(get_all_points(jch))//2
    upload('abschreibungen-methoden', jch, points_slice=slice(None,half_p))
    upload('abschreibungen',          jch, points_slice=slice(half_p,None))

# 5. Abgrenzungen und Rückstellungen
jch = find_ch('Abgrenzungen')
if jch:
    print('Abgrenzungen / Rückstellungen:')
    half_p = len(get_all_points(jch))//2
    half_f = len(jch.get('key_formulas_and_rules', jch.get('formulas',[])))//2
    upload('transitorische-posten', jch, points_slice=slice(None,half_p), fs_slice=slice(None,half_f))
    upload('zeitliche-abgrenzungen',jch, points_slice=slice(half_p,None), fs_slice=slice(half_f,None))

# 6. Einzelunternehmen
jch = find_ch('Einzelunternehmen')
if jch:
    print('Einzelunternehmen:')
    upload('einzelunternehmung', jch)

# 7. Aktiengesellschaft
jch = find_ch('Aktiengesellschaft')
if jch:
    print('Aktiengesellschaft:')
    upload('aktiengesellschaft', jch)

# 8. Bewertungen / Stille Reserven
jch = find_ch('Bewertungen')
if jch:
    print('Bewertungen / Stille Reserven:')
    half_p = len(get_all_points(jch))//2
    half_f = len(jch.get('key_formulas_and_rules', jch.get('formulas',[])))//2
    upload('stille-reserven',              jch, points_slice=slice(None,half_p), fs_slice=slice(None,half_f))
    upload('bewertungsvorschriften-vertieft',jch, points_slice=slice(half_p,None), fs_slice=slice(half_f,None))

# 9. Bilanz- und Erfolgsanalyse
jch = find_ch('Bilanz')
if jch:
    print('Bilanz / ER-Analyse:')
    half_p = len(get_all_points(jch))//2
    half_f = len(jch.get('key_formulas_and_rules', jch.get('formulas',[])))//2
    upload('liquiditaet-rentabilitaet', jch, points_slice=slice(None,half_p), fs_slice=slice(None,half_f))
    upload('bilanzanalyse',             jch, points_slice=slice(half_p,None), fs_slice=slice(half_f,None))

# Mark all FRW chapters as complete
cur.execute("""
    UPDATE "Chapter" SET "contentStatus"='complete'
    WHERE id IN (
        SELECT c.id FROM "Chapter" c
        JOIN "Topic" t ON c."topicId"=t.id
        WHERE t.category='frw'
    )
""")
print('\nAlle FRW-Kapitel auf contentStatus=complete gesetzt.')

conn.commit()
conn.close()
print('✓ Fertig!')
