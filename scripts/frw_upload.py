import psycopg2, json, uuid

conn = psycopg2.connect('postgresql://postgres.xudeuxqxgiozvgojjcas:w778dj8AcyFs2Tef@aws-1-eu-west-1.pooler.supabase.com:5432/postgres')
cur = conn.cursor()

# Load v6 pack (most complete - 9 chapters)
with open('c:/Wr-Lernplattform/Inhalt/FRW/Band 2/Zeitliche Abgrenzungen (inkl Rückstellungen) (Band 2, Kapitel 5)/Claude Code/rechnungswesen_lerntool_pack_v6.json', encoding='utf-8') as f:
    pack = json.load(f)

# --- Helpers ---
def get_max_order(table, chapter_id):
    cur.execute(f'SELECT MAX("order") FROM "{table}" WHERE "chapterId"=%s', (chapter_id,))
    r = cur.fetchone()[0]
    return r if r is not None else -1

def add_core_points(chapter_id, points):
    base = get_max_order('CorePoint', chapter_id)
    added = 0
    for i, text in enumerate(points):
        cur.execute('SELECT id FROM "CorePoint" WHERE "chapterId"=%s AND text=%s', (chapter_id, text))
        if not cur.fetchone():
            cur.execute('INSERT INTO "CorePoint" (id, text, "chapterId", "order") VALUES (%s,%s,%s,%s)',
                       (str(uuid.uuid4()), text, chapter_id, base + 1 + i))
            added += 1
    return added

def add_formulas(chapter_id, formulas):
    base = get_max_order('Formula', chapter_id)
    added = 0
    for i, f in enumerate(formulas):
        if isinstance(f, str):
            # Format: "Name = Formel" as plain string
            if '=' in f:
                parts = f.split('=', 1)
                name = parts[0].strip()
                formel = f.strip()
            else:
                name = f.strip()[:60]
                formel = f.strip()
            erklaerung = ''
        elif isinstance(f, dict):
            name = f.get('name', '')
            formel = f.get('formula', f.get('formel', ''))
            erklaerung = f.get('meaning', f.get('explanation', f.get('erklaerung', '')))
        else:
            continue
        if not name or not formel:
            continue
        cur.execute('SELECT id FROM "Formula" WHERE "chapterId"=%s AND name=%s', (chapter_id, name))
        if not cur.fetchone():
            cur.execute('INSERT INTO "Formula" (id, name, formel, erklaerung, "chapterId", "order") VALUES (%s,%s,%s,%s,%s,%s)',
                       (str(uuid.uuid4()), name, formel, erklaerung, chapter_id, base + 1 + i))
            added += 1
    return added

def add_bookings(chapter_id, entries):
    base = get_max_order('BookingEntry', chapter_id)
    added = 0
    for i, e in enumerate(entries):
        situation = e.get('case', e.get('situation', ''))
        entry_str = e.get('entry', '')
        if entry_str and ' / ' in entry_str:
            parts = entry_str.split(' / ', 1)
            soll = parts[0].strip()
            haben = parts[1].strip()
        elif 'sollKonto' in e:
            soll = e.get('sollKonto', '')
            haben = e.get('habenKonto', '')
        else:
            continue
        erklaerung = e.get('note', e.get('erklaerung', situation))
        if not soll or not haben:
            continue
        cur.execute('SELECT id FROM "BookingEntry" WHERE "chapterId"=%s AND situation=%s AND "sollKonto"=%s',
                   (chapter_id, situation, soll))
        if not cur.fetchone():
            cur.execute('INSERT INTO "BookingEntry" (id, situation, "sollKonto", "habenKonto", erklaerung, "chapterId", "order") VALUES (%s,%s,%s,%s,%s,%s,%s)',
                       (str(uuid.uuid4()), situation, soll, haben, erklaerung, chapter_id, base + 1 + i))
            added += 1
    return added

def add_quiz_mc(chapter_id, questions):
    added = 0
    base_order = get_max_order('QuizQuestion', chapter_id)
    for i, q in enumerate(questions):
        if q.get('type') != 'multiple_choice':
            continue
        qtext = q['question']
        options = q.get('options', [])
        correct = q.get('correct_answer', '')
        cur.execute('SELECT id FROM "QuizQuestion" WHERE "chapterId"=%s AND "questionText"=%s', (chapter_id, qtext))
        if cur.fetchone():
            continue
        qid = str(uuid.uuid4())
        cur.execute('INSERT INTO "QuizQuestion" (id, "chapterId", "questionText", "questionType", explanation, difficulty, "order") VALUES (%s,%s,%s,%s,%s,%s,%s)',
                   (qid, chapter_id, qtext, 'multiple_choice', 'Richtig: ' + correct, 'medium', base_order + 1 + i))
        for j, opt in enumerate(options):
            cur.execute('INSERT INTO "QuizOption" (id, "questionId", text, "isCorrect", "order") VALUES (%s,%s,%s,%s,%s)',
                       (str(uuid.uuid4()), qid, opt, opt == correct, j))
        added += 1
    return added

def get_chapter_id(slug):
    cur.execute('SELECT id FROM "Chapter" WHERE slug=%s', (slug,))
    r = cur.fetchone()
    return r[0] if r else None

def get_core_from_json(jch):
    points = list(jch.get('core_principles', []))
    for tb in jch.get('theory_blocks', []):
        for p in tb.get('points', []):
            if p not in points:
                points.append(p)
    return points

def find_chapter(keyword):
    return next((c for c in pack['chapters'] if keyword.lower() in c.get('title', '').lower()), None)

print("=== FRW Band 2 Upload ===\n")

# 1. LÖHNE UND GEHÄLTER
jch = find_chapter('hne und Geh')
if jch:
    for slug in ['lohnbuchhaltung', 'loehne-gehaelter']:
        cid = get_chapter_id(slug)
        if cid:
            q = add_quiz_mc(cid, jch.get('quiz_questions', []))
            print(f'Loehne [{slug}]: quiz+{q}')

# 2. FREMDE WAEHRUNGEN
jch = find_chapter('Fremd')
if jch:
    cid1 = get_chapter_id('waehrungsumrechnung')
    cid2 = get_chapter_id('fremde-waehrung')
    bp = jch.get('booking_patterns', jch.get('journal_patterns', []))
    fs = jch.get('key_formulas_and_rules', jch.get('formulas', []))
    core = get_core_from_json(jch)
    qs = jch.get('quiz_questions', [])
    if cid1:
        b = add_bookings(cid1, bp[:max(1, len(bp)//2)])
        q = add_quiz_mc(cid1, qs)
        print(f'Fremde Waehrungen [waehrungsumrechnung]: bookings+{b}, quiz+{q}')
    if cid2:
        f = add_formulas(cid2, fs)
        b = add_bookings(cid2, bp[max(1, len(bp)//2):])
        q = add_quiz_mc(cid2, qs)
        print(f'Fremde Waehrungen [fremde-waehrung]: formulas+{f}, bookings+{b}, quiz+{q}')

# 3. VERLUSTE AUS FORDERUNGEN
jch = find_chapter('Kreditverkehr')
if jch:
    core = get_core_from_json(jch)
    bp = jch.get('booking_patterns', jch.get('journal_patterns', []))
    fs = jch.get('key_formulas_and_rules', jch.get('formulas', []))
    qs = jch.get('quiz_questions', [])
    half_c = len(core) // 2
    half_f = len(fs) // 2
    half_b = len(bp) // 2

    cid1 = get_chapter_id('debitorenverluste')
    if cid1:
        q = add_quiz_mc(cid1, qs)
        print(f'Verluste [debitorenverluste]: quiz+{q}')

    cid2 = get_chapter_id('verluste-forderungen')
    if cid2:
        p = add_core_points(cid2, core[half_c:])
        f = add_formulas(cid2, fs[half_f:])
        b = add_bookings(cid2, bp[half_b:])
        q = add_quiz_mc(cid2, qs)
        print(f'Verluste [verluste-forderungen]: points+{p}, formulas+{f}, bookings+{b}, quiz+{q}')

# 4. ABSCHREIBUNGEN
jch = next((c for c in pack['chapters'] if c.get('title') == 'Abschreibungen'), None)
if jch:
    qs = jch.get('quiz_questions', jch.get('question_bank', []))
    for slug in ['abschreibungen-methoden', 'abschreibungen']:
        cid = get_chapter_id(slug)
        if cid:
            q = add_quiz_mc(cid, qs)
            print(f'Abschreibungen [{slug}]: quiz+{q}')

# 5. ABGRENZUNGEN + RUECKSTELLUNGEN
jch = find_chapter('Abgrenzungen')
if jch:
    core = get_core_from_json(jch)
    fs = jch.get('key_formulas_and_rules', jch.get('formulas', []))
    bp = jch.get('booking_patterns', jch.get('journal_patterns', []))
    qs = jch.get('quiz_questions', [])
    half_c = len(core) // 2
    half_f = len(fs) // 2

    cid1 = get_chapter_id('transitorische-posten')
    if cid1:
        q = add_quiz_mc(cid1, qs[:len(qs)//2 + 1])
        print(f'Abgrenzungen [transitorische-posten]: quiz+{q}')

    cid2 = get_chapter_id('zeitliche-abgrenzungen')
    if cid2:
        p = add_core_points(cid2, core[half_c:])
        f = add_formulas(cid2, fs[half_f:])
        b = add_bookings(cid2, bp)
        q = add_quiz_mc(cid2, qs[len(qs)//2:])
        print(f'Rueckstellungen [zeitliche-abgrenzungen]: points+{p}, formulas+{f}, bookings+{b}, quiz+{q}')

# 6. EINZELUNTERNEHMUNG + AG
for slug, keyword in [('einzelunternehmung', 'Einzelunternehmen'), ('aktiengesellschaft', 'Aktiengesellschaft')]:
    jch = find_chapter(keyword[:8])
    if jch:
        cid = get_chapter_id(slug)
        if cid:
            core = get_core_from_json(jch)
            bp = jch.get('booking_patterns', jch.get('journal_patterns', []))
            fs = jch.get('key_formulas_and_rules', jch.get('formulas', []))
            p = add_core_points(cid, core)
            f = add_formulas(cid, fs)
            b = add_bookings(cid, bp)
            q = add_quiz_mc(cid, jch.get('quiz_questions', []))
            print(f'{keyword} [{slug}]: points+{p}, formulas+{f}, bookings+{b}, quiz+{q}')

# 7. BEWERTUNGEN + STILLE RESERVEN
jch = find_chapter('Bewertungen')
if jch:
    core = get_core_from_json(jch)
    fs = jch.get('key_formulas_and_rules', jch.get('formulas', []))
    bp = jch.get('booking_patterns', jch.get('journal_patterns', []))
    qs = jch.get('quiz_questions', [])
    half_c = len(core) // 2
    half_f = len(fs) // 2

    cid1 = get_chapter_id('stille-reserven')
    if cid1:
        p = add_core_points(cid1, core[:half_c])
        f = add_formulas(cid1, fs[:half_f])
        q = add_quiz_mc(cid1, qs[:len(qs)//2 + 1])
        print(f'Stille Reserven: points+{p}, formulas+{f}, quiz+{q}')

    cid2 = get_chapter_id('bewertungsvorschriften-vertieft')
    if cid2:
        p = add_core_points(cid2, core[half_c:])
        f = add_formulas(cid2, fs[half_f:])
        b = add_bookings(cid2, bp)
        q = add_quiz_mc(cid2, qs[len(qs)//2:])
        print(f'Bewertungsvorschriften: points+{p}, formulas+{f}, bookings+{b}, quiz+{q}')

# 8. BILANZ + ER-ANALYSE
jch = find_chapter('Bilanz')
if jch:
    core = get_core_from_json(jch)
    fs = jch.get('key_formulas_and_rules', jch.get('formulas', []))
    qs = jch.get('quiz_questions', [])
    half_c = len(core) // 2
    half_f = len(fs) // 2

    cid1 = get_chapter_id('liquiditaet-rentabilitaet')
    if cid1:
        p = add_core_points(cid1, core[:half_c])
        f = add_formulas(cid1, fs[:half_f])
        q = add_quiz_mc(cid1, qs[:len(qs)//2 + 1])
        print(f'Liquiditaet: points+{p}, formulas+{f}, quiz+{q}')

    cid2 = get_chapter_id('bilanzanalyse')
    if cid2:
        p = add_core_points(cid2, core[half_c:])
        f = add_formulas(cid2, fs[half_f:])
        q = add_quiz_mc(cid2, qs[len(qs)//2:])
        print(f'Bilanz-ER-Analyse: points+{p}, formulas+{f}, quiz+{q}')

conn.commit()
conn.close()
print('\nUpload abgeschlossen!')
