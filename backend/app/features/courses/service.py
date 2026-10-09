import json
import re

from sqlalchemy.orm import Session

from app.models.entities import (
    Course,
    Exercise,
    LeaderboardUser,
    Lesson,
    Skill,
    Unit,
    User,
    UserLessonProgress,
    UserSkillProgress,
)


COURSE = {
    "id": 1,
    "title": "German",
    "code": "de",
    "flag": "DE",
    "description": "Learn German in two stages: Foundations and Everyday Communication.",
    "total_learners": 18400000,
}

UNITS = [
    {
        "id": 1,
        "title": "Unit 1: Introductions & Basics",
        "subtitle": "Greet people, share personal information, and use essential German phrases.",
        "color": "#58cc02",
        "guide": (
            "### Introductions & Basics\n\n"
            "#### Greetings\nHallo means hello. Guten Morgen is good morning, Guten Abend is good evening, "
            "and Tschüss is an informal goodbye. Use Danke for thank you and Bitte for please or you’re welcome.\n\n"
            "#### Introducing yourself\nUse **Ich heiße ...** to say your name and **Wie heißt du?** to ask someone’s name. "
            "Say **Ich komme aus ...** to tell where you are from. *Ich* means I and *du* means you.\n\n"
            "#### Basic phrases and responses\n**Wie geht es dir?** means How are you? A simple reply is **Mir geht es gut.** "
            "Ja means yes and Nein means no. These short phrases help you exchange basic personal information."
        ),
        "skills": [
            ("Greetings", "chat", [
                ("Hallo", "hello"), ("Guten Morgen", "good morning"), ("Guten Abend", "good evening"),
                ("Tschüss", "goodbye"), ("Danke", "thank you"), ("Bitte", "please"),
            ], "Guten Morgen! Hallo!", "Good morning! Hello!"),
            ("Introductions", "star", [
                ("Ich", "I"), ("du", "you"), ("Name", "name"), ("heißen", "to be called"),
                ("kommen", "to come"), ("aus", "from"),
            ], "Ich heiße Alex. Ich komme aus Kanada.", "My name is Alex. I come from Canada."),
            ("Basic Phrases", "sparkles", [
                ("Ja", "yes"), ("Nein", "no"), ("gut", "well"), ("Wie geht es dir?", "How are you?"),
                ("Mir geht es gut", "I am doing well"), ("Freut mich", "Nice to meet you"),
            ], "Wie geht es dir? Mir geht es gut.", "How are you? I am doing well."),
        ],
    },
    {
        "id": 2,
        "title": "Unit 2: Food & Restaurant",
        "subtitle": "Talk about meals, order politely, and ask about prices at a café or restaurant.",
        "color": "#1cb0f6",
        "guide": (
            "### Food & Restaurant\n\n"
            "#### Food\nLearn common meal words such as **das Brot** (bread), **der Apfel** (apple), "
            "**der Käse** (cheese), and **die Suppe** (soup). German nouns are capitalized.\n\n"
            "#### Drinks and polite orders\n**das Wasser** is water, **der Kaffee** is coffee, and **der Tee** is tea. "
            "Use **Ich möchte ...** or the more polite **Ich hätte gern ...** when ordering: "
            "**Ich möchte einen Kaffee.** / **Ich hätte gern Wasser.**\n\n"
            "#### At a restaurant\nAsk for **die Speisekarte** (menu) and finish with **Die Rechnung, bitte.** "
            "To ask the price, say **Was kostet das?** Remember *bitte* makes requests polite."
        ),
        "skills": [
            ("Food", "coffee", [
                ("das Brot", "bread"), ("der Apfel", "apple"), ("der Käse", "cheese"),
                ("die Suppe", "soup"), ("das Essen", "food"),
            ], "Ich esse Brot und Käse.", "I eat bread and cheese."),
            ("Drinks", "coffee", [
                ("das Wasser", "water"), ("der Kaffee", "coffee"), ("der Tee", "tea"),
                ("trinken", "to drink"), ("möchten", "would like"),
            ], "Ich hätte gern Wasser.", "I would like water."),
            ("Restaurant", "gem", [
                ("das Restaurant", "restaurant"), ("die Speisekarte", "menu"), ("die Rechnung", "bill"),
                ("kosten", "to cost"), ("bitte", "please"),
            ], "Die Rechnung, bitte. Was kostet das?", "The bill, please. What does that cost?"),
        ],
    },
    {
        "id": 3,
        "title": "Unit 3: Daily Life",
        "subtitle": "Describe daily routines, times of day, and common activities.",
        "color": "#ce82ff",
        "guide": (
            "### Daily Life\n\n"
            "#### Everyday activities\nUseful verbs include **aufstehen** (get up), **arbeiten** (work), "
            "**lernen** (study), **essen** (eat), **trinken** (drink), and **schlafen** (sleep). "
            "In a simple statement, the conjugated verb usually comes second: **Ich lerne Deutsch.**\n\n"
            "#### Time and routine\n**morgens** means in the morning, **abends** in the evening, "
            "**heute** today, and **morgen** tomorrow. Clock time uses *um*: "
            "**Ich stehe um sieben Uhr auf.**\n\n"
            "#### Make a daily plan\nCombine a time phrase with an activity: **Ich arbeite heute.** "
            "At the end of the day, **Ich gehe schlafen** means I am going to sleep."
        ),
        "skills": [
            ("Daily Routine", "sun", [
                ("aufstehen", "to get up"), ("arbeiten", "to work"), ("lernen", "to study"),
                ("essen", "to eat"), ("schlafen", "to sleep"),
            ], "Ich stehe um sieben Uhr auf.", "I get up at seven o'clock."),
            ("Time", "clock", [
                ("morgens", "in the morning"), ("abends", "in the evening"), ("heute", "today"),
                ("morgen", "tomorrow"), ("um sieben Uhr", "at seven o'clock"),
            ], "Ich arbeite heute. Morgen lerne ich Deutsch.", "I work today. Tomorrow I study German."),
            ("Common Verbs", "trophy", [
                ("trinken", "to drink"), ("essen", "to eat"), ("lernen", "to study"),
                ("arbeiten", "to work"), ("schlafen", "to sleep"),
            ], "Ich lerne Deutsch und gehe abends schlafen.", "I study German and go to sleep in the evening."),
        ],
    },
    {
        "id": 4,
        "title": "Unit 1: Travel & Transportation",
        "subtitle": "Use public transport, buy tickets, and ask for directions while traveling.",
        "color": "#ff9600",
        "guide": (
            "### Travel & Transportation\n\n"
            "#### Getting around\n**der Bahnhof** is the train station, **der Zug** is the train, "
            "**der Bus** is the bus, and **der Flughafen** is the airport. A bus stop is **die Bushaltestelle**.\n\n"
            "#### Tickets and schedules\nA ticket is **die Fahrkarte** or **das Ticket**. Say "
            "**Ich brauche eine Fahrkarte.** to ask for one. **Wann fährt der Zug ab?** asks when the train departs; "
            "**ankommen** means to arrive and **abfahren** to depart.\n\n"
            "#### Directions\n**links** means left, **rechts** right, and **geradeaus** straight ahead. "
            "Ask **Wo ist der Bahnhof?** (Where is the station?) or **Wo ist die Bushaltestelle?**"
        ),
        "skills": [
            ("Transportation", "train", [
                ("der Bahnhof", "train station"), ("der Zug", "train"), ("der Bus", "bus"),
                ("der Flughafen", "airport"), ("die Bushaltestelle", "bus stop"),
            ], "Wo ist der Bahnhof? Wo ist die Bushaltestelle?", "Where is the train station? Where is the bus stop?"),
            ("Directions", "compass", [
                ("links", "left"), ("rechts", "right"), ("geradeaus", "straight ahead"),
                ("wo", "where"), ("sein", "to be"),
            ], "Gehen Sie geradeaus und dann links.", "Go straight ahead and then left."),
            ("Tickets", "ticket", [
                ("die Fahrkarte", "ticket"), ("das Ticket", "ticket"), ("abfahren", "to depart"),
                ("ankommen", "to arrive"), ("brauchen", "to need"),
            ], "Ich brauche eine Fahrkarte. Wann fährt der Zug ab?", "I need a ticket. When does the train depart?"),
        ],
    },
    {
        "id": 5,
        "title": "Unit 2: Communicate at Work",
        "subtitle": "Discuss colleagues, meetings, schedules, emails, and polite workplace requests.",
        "color": "#ff4b4b",
        "guide": (
            "### Communicate at Work\n\n"
            "#### The workplace\n**die Arbeit** means work and **das Büro** means office. A male colleague is "
            "**der Kollege**, a female colleague **die Kollegin**, and **der Chef** is the boss.\n\n"
            "#### Meetings and schedules\n**die Besprechung** is a meeting, **der Termin** an appointment, "
            "**die Aufgabe** a task, and **die Pause** a break. Ask **Wann ist der Termin?** to find out when "
            "an appointment is scheduled. **Ich habe eine Besprechung.** means I have a meeting.\n\n"
            "#### Professional communication\n**die E-Mail** means email. **Ich schicke eine E-Mail.** means "
            "I am sending an email. For a polite request, use formal **Sie**: **Können Sie mir helfen?**"
        ),
        "skills": [
            ("Workplace", "briefcase", [
                ("die Arbeit", "work"), ("das Büro", "office"), ("der Kollege", "male colleague"),
                ("die Kollegin", "female colleague"), ("der Chef", "boss"),
            ], "Mein Kollege arbeitet heute im Büro.", "My colleague is working in the office today."),
            ("Meetings", "calendar", [
                ("die Besprechung", "meeting"), ("der Termin", "appointment"), ("die Aufgabe", "task"),
                ("die Pause", "break"), ("wann", "when"),
            ], "Ich habe eine Besprechung. Wann ist der Termin?", "I have a meeting. When is the appointment?"),
            ("Professional Requests", "message", [
                ("die E-Mail", "email"), ("schicken", "to send"), ("helfen", "to help"),
                ("Können Sie ...?", "Can you ...?"), ("mir", "me"),
            ], "Ich schicke eine E-Mail. Können Sie mir helfen?", "I am sending an email. Can you help me?"),
        ],
    },
    {
        "id": 6,
        "title": "Unit 3: Shopping & Everyday Services",
        "subtitle": "Ask about prices and sizes, find items, and pay in shops and services.",
        "color": "#a560d4",
        "guide": (
            "### Shopping & Everyday Services\n\n"
            "#### In a shop\n**das Geschäft** is a shop and **die Kasse** is the checkout. "
            "**kaufen** means to buy. To ask for help, start with **Haben Sie ...?** (Do you have ...?).\n\n"
            "#### Prices, sizes, and colors\nAsk **Wie viel kostet das?** or **Was kostet das?** for a price. "
            "**die Größe** is size and **die Farbe** is color. **teuer** means expensive and **billig** means cheap. "
            "For example: **Haben Sie das in Größe M?**\n\n"
            "#### Paying\n**bezahlen** means to pay, **die Karte** is a card, and **das Bargeld** is cash. "
            "Ask **Kann ich mit Karte bezahlen?** before paying by card."
        ),
        "skills": [
            ("Shopping", "shopping-bag", [
                ("das Geschäft", "shop"), ("kaufen", "to buy"), ("die Kasse", "checkout"),
                ("die Farbe", "color"), ("helfen", "to help"),
            ], "Ich möchte das kaufen. Können Sie mir helfen?", "I would like to buy that. Can you help me?"),
            ("Prices & Sizes", "tag", [
                ("der Preis", "price"), ("die Größe", "size"), ("teuer", "expensive"),
                ("billig", "cheap"), ("Wie viel kostet das?", "How much does that cost?"),
            ], "Wie viel kostet das? Haben Sie das in Größe M?", "How much does that cost? Do you have it in size M?"),
            ("Payment", "credit-card", [
                ("bezahlen", "to pay"), ("die Karte", "card"), ("das Bargeld", "cash"),
                ("die Kasse", "checkout"), ("mit Karte", "by card"),
            ], "Kann ich mit Karte bezahlen?", "Can I pay by card?"),
        ],
    },
]


def _upsert(model, key, values, db: Session):
    obj = db.query(model).filter_by(**key).first()
    if obj is None:
        obj = model(**key)
        db.add(obj)
    for field, value in values.items():
        setattr(obj, field, value)
    return obj


def _exercise_data(vocabulary, skill_title, sentence_de, sentence_en):
    german_word, english_word = vocabulary[0]
    choices = [{
        "id": "opt1",
        "text": english_word,
        "subtext": german_word,
    }]
    for option_index, (wrong_german, wrong_english) in enumerate(vocabulary[1:], start=2):
        if len(choices) == 4:
            break
        if wrong_english != english_word:
            choices.append({
                "id": f"opt{option_index}",
                "text": wrong_english,
                "subtext": wrong_german,
            })
    while len(choices) < 4:
        choices.append({
            "id": f"opt{len(choices) + 1}",
            "text": f"Not {english_word}",
            "subtext": "Choose another meaning",
        })

    correct_tokens = sentence_de.split()
    normalize_token = lambda token: re.sub(r"[\W_]", "", token, flags=re.UNICODE).casefold()
    used_tokens = {normalize_token(token) for token in correct_tokens}
    distractor_tokens = []
    for german, _ in vocabulary:
        normalized = normalize_token(german)
        if len(german.split()) == 1 and normalized not in used_tokens:
            distractor_tokens.append(german)
            used_tokens.add(normalized)
        if len(distractor_tokens) == 3:
            break
    pairs = [{"left": german.lower(), "right": english} for german, english in vocabulary[:5]]
    return [
        (
            "multiple_choice",
            f"What does '{german_word}' mean?",
            german_word,
            german_word,
            {"options": choices},
            {
                "correct_option_id": "opt1",
                "correct_text": english_word,
                "explanation": f"'{german_word}' means '{english_word}'.",
            },
        ),
        (
            "translate_words",
            "Translate this sentence:",
            sentence_en,
            sentence_de,
            {"tokens": correct_tokens + distractor_tokens},
            {
                "correct_tokens": correct_tokens,
                "explanation": f"'{sentence_de}' means '{sentence_en}'.",
            },
        ),
        (
            "match_pairs",
            f"Match the {skill_title.lower()} vocabulary:",
            None,
            None,
            {"pairs": pairs},
            {
                "pairs": {pair["left"]: pair["right"] for pair in pairs},
                "explanation": f"Match each {skill_title.lower()} word with its English meaning.",
            },
        ),
    ]


def migrate_german_course(db: Session):
    course = _upsert(Course, {"id": COURSE["id"]}, COURSE, db)
    unit_ids = []
    skill_ids = []
    lesson_ids = []
    exercise_ids = []

    for unit in UNITS:
        unit_id = unit["id"]
        unit_ids.append(unit_id)
        _upsert(Unit, {"id": unit_id}, {
            "course_id": course.id,
            "unit_number": unit_id,
            "title": unit["title"],
            "subtitle": unit["subtitle"],
            "color": unit["color"],
            "guide_content": unit["guide"],
        }, db)

        for skill_order, skill_data in enumerate(unit["skills"], start=1):
            skill_title, icon, vocabulary, sentence_de, sentence_en = skill_data
            skill_id = (unit_id - 1) * 3 + skill_order
            lesson_id = skill_id
            skill_ids.append(skill_id)
            lesson_ids.append(lesson_id)

            _upsert(Skill, {"id": skill_id}, {
                "unit_id": unit_id,
                "order": skill_order,
                "title": skill_title,
                "icon": icon,
                "total_lessons": 1,
            }, db)
            _upsert(Lesson, {"id": lesson_id}, {
                "skill_id": skill_id,
                "order": 1,
                "title": f"Lesson 1: {skill_title}",
                "xp_reward": 20,
            }, db)

            for exercise_order, exercise in enumerate(
                _exercise_data(vocabulary, skill_title, sentence_de, sentence_en),
                start=1,
            ):
                ex_type, prompt, target_text, audio_text, question_data, solution_data = exercise
                exercise_id = (lesson_id - 1) * 3 + exercise_order
                exercise_ids.append(exercise_id)
                _upsert(Exercise, {"id": exercise_id}, {
                    "lesson_id": lesson_id,
                    "order": exercise_order,
                    "type": ex_type,
                    "prompt": prompt,
                    "target_text": target_text,
                    "audio_text": audio_text,
                    "question_data": json.dumps(question_data, ensure_ascii=False),
                    "solution_data": json.dumps(solution_data, ensure_ascii=False),
                }, db)

    db.query(UserLessonProgress).filter(
        ~UserLessonProgress.lesson_id.in_(lesson_ids)
    ).delete(synchronize_session=False)
    db.query(UserSkillProgress).filter(
        ~UserSkillProgress.skill_id.in_(skill_ids)
    ).delete(synchronize_session=False)
    db.query(Exercise).filter(
        ~Exercise.id.in_(exercise_ids)
    ).delete(synchronize_session=False)
    db.query(Lesson).filter(
        ~Lesson.id.in_(lesson_ids)
    ).delete(synchronize_session=False)
    db.query(Skill).filter(
        ~Skill.id.in_(skill_ids)
    ).delete(synchronize_session=False)
    db.query(Unit).filter(
        Unit.course_id == course.id,
        ~Unit.id.in_(unit_ids),
    ).delete(synchronize_session=False)

    user = db.query(User).filter(User.id == 1).first()
    if user:
        user.avatar = "D"
        user.active_course_id = course.id

    current = db.query(LeaderboardUser).filter(
        LeaderboardUser.is_current_user.is_(True)
    ).first()
    if current:
        current.avatar = "D"
        current.name = user.name if user else current.name
        current.xp = user.xp if user else current.xp

    db.commit()
