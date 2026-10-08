import json
import datetime
from sqlalchemy.orm import Session
from models import (
    User, Course, Unit, Skill, Lesson, Exercise,
    UserLessonProgress, UserSkillProgress, LeaderboardUser,
    Quest, Achievement
)


def seed_database(db: Session):
    # Check if already seeded
    if db.query(Course).first():
        return

    print("Seeding Duolingo database...")

    # 1. Seed Main User
    main_user = User(
        id=1,
        username="learner_alex",
        email="alex@duolingo.demo",
        name="Alex Rivera",
        avatar="🦉",
        streak=4,
        max_streak=7,
        last_streak_date=datetime.date.today().isoformat(),
        xp=480,
        gems=520,
        hearts=5,
        max_hearts=5,
        hearts_updated_at=datetime.datetime.utcnow(),
        streak_freeze=2,
        active_course_id=1,
        league="Silver",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
    )
    db.add(main_user)
    db.commit()

    # 2. Seed Spanish Course
    course = Course(
        id=1,
        title="Spanish",
        code="es",
        flag="🇪🇸",
        description="Learn conversational Spanish for everyday life and travel.",
        total_learners=32840000
    )
    db.add(course)
    db.commit()

    # 3. Seed Units
    unit1 = Unit(
        id=1,
        course_id=course.id,
        unit_number=1,
        title="Unit 1: Introductions & Basics",
        subtitle="Form basic sentences, introduce yourself, and greet people",
        color="#58cc02",
        guide_content=(
            "### Welcome to Spanish Unit 1!\n\n"
            "#### Key Pronouns & Verb Forms:\n"
            "- **Yo soy** = I am\n"
            "- **Tú eres** = You are (informal)\n"
            "- **Él / Ella es** = He / She is\n\n"
            "#### Gender in Spanish:\n"
            "Nouns in Spanish are masculine or feminine:\n"
            "- **El niño** (The boy) vs **La niña** (The girl)\n"
            "- **El pan** (The bread) vs **La manzana** (The apple)\n\n"
            "#### Polite Greetings:\n"
            "- **¡Hola!** - Hello!\n"
            "- **Buenos días** - Good morning\n"
            "- **Buenas noches** - Good evening / Good night\n"
            "- **Por favor** - Please\n"
            "- **Muchas gracias** - Thank you very much"
        )
    )

    unit2 = Unit(
        id=2,
        course_id=course.id,
        unit_number=2,
        title="Unit 2: Food & Restaurant",
        subtitle="Order food and drinks, ask for the bill, and express tastes",
        color="#1cb0f6",
        guide_content=(
            "### Food & Dining Out\n\n"
            "#### Useful Phrases:\n"
            "- **Una mesa para dos, por favor** = A table for two, please.\n"
            "- **La cuenta, por favor** = The check / bill, please.\n"
            "- **Yo quiero café con leche** = I want coffee with milk.\n"
            "- **El agua está fría** = The water is cold.\n\n"
            "#### Common Food Words:\n"
            "- **Pan** (Bread), **Queso** (Cheese), **Manzana** (Apple), **Agua** (Water)"
        )
    )

    unit3 = Unit(
        id=3,
        course_id=course.id,
        unit_number=3,
        title="Unit 3: Travel & Places",
        subtitle="Navigate airports, ask for directions, and explore the city",
        color="#ce82ff",
        guide_content=(
            "### Travel & Directions\n\n"
            "#### Where is...?\n"
            "- **¿Dónde está el baño?** = Where is the restroom?\n"
            "- **¿Dónde está el hotel?** = Where is the hotel?\n"
            "- **A la derecha** = To the right\n"
            "- **A la izquierda** = To the left\n"
            "- **Todo recto** = Straight ahead"
        )
    )
    db.add_all([unit1, unit2, unit3])
    db.commit()

    # 4. Seed Skills
    # Unit 1 Skills
    s1 = Skill(id=1, unit_id=unit1.id, order=1, title="Basics 1", icon="star", total_lessons=3)
    s2 = Skill(id=2, unit_id=unit1.id, order=2, title="Greetings", icon="chat", total_lessons=2)
    s3 = Skill(id=3, unit_id=unit1.id, order=3, title="People", icon="coffee", total_lessons=2)

    # Unit 2 Skills
    s4 = Skill(id=4, unit_id=unit2.id, order=1, title="Food", icon="coffee", total_lessons=2)
    s5 = Skill(id=5, unit_id=unit2.id, order=2, title="Café Order", icon="gem", total_lessons=2)

    # Unit 3 Skills
    s6 = Skill(id=6, unit_id=unit3.id, order=1, title="City Travel", icon="plane", total_lessons=2)
    s7 = Skill(id=7, unit_id=unit3.id, order=2, title="Directions", icon="trophy", total_lessons=2)

    db.add_all([s1, s2, s3, s4, s5, s6, s7])
    db.commit()

    # 5. Seed Lessons for Skill 1 (Basics 1)
    l1 = Lesson(id=1, skill_id=s1.id, order=1, title="Lesson 1: Intro Words", xp_reward=15)
    l2 = Lesson(id=2, skill_id=s1.id, order=2, title="Lesson 2: Eating & Drinking", xp_reward=15)
    l3 = Lesson(id=3, skill_id=s1.id, order=3, title="Lesson 3: Complete Sentences", xp_reward=20)

    # Lessons for Skill 2 (Greetings)
    l4 = Lesson(id=4, skill_id=s2.id, order=1, title="Lesson 1: Hello & Goodbye", xp_reward=15)
    l5 = Lesson(id=5, skill_id=s2.id, order=2, title="Lesson 2: How are you?", xp_reward=15)

    # Lessons for Skill 3 (People)
    l6 = Lesson(id=6, skill_id=s3.id, order=1, title="Lesson 1: Family", xp_reward=15)
    l7 = Lesson(id=7, skill_id=s3.id, order=2, title="Lesson 2: Friends", xp_reward=15)

    # Unit 2 Lessons
    l8 = Lesson(id=8, skill_id=s4.id, order=1, title="Lesson 1: Breakfast", xp_reward=15)
    l9 = Lesson(id=9, skill_id=s4.id, order=2, title="Lesson 2: Dinner", xp_reward=15)

    # Unit 3 Lessons
    l10 = Lesson(id=10, skill_id=s6.id, order=1, title="Lesson 1: The Airport", xp_reward=15)

    db.add_all([l1, l2, l3, l4, l5, l6, l7, l8, l9, l10])
    db.commit()

    # 6. Seed Varied Exercises for Lesson 1 (Showcases all 5 exercise types!)
    ex1_1 = Exercise(
        id=1,
        lesson_id=l1.id,
        order=1,
        type="multiple_choice",
        prompt="Select the correct translation for 'Hello':",
        target_text="Hello",
        audio_text="Hola",
        question_data=json.dumps({
            "options": [
                {"id": "opt1", "text": "Hola", "subtext": "Greeting"},
                {"id": "opt2", "text": "Adiós", "subtext": "Farewell"},
                {"id": "opt3", "text": "Por favor", "subtext": "Polite request"},
                {"id": "opt4", "text": "Gracias", "subtext": "Gratitude"}
            ]
        }),
        solution_data=json.dumps({
            "correct_option_id": "opt1",
            "correct_text": "Hola",
            "explanation": "‘¡Hola!’ is the standard Spanish greeting for ‘Hello’."
        })
    )

    ex1_2 = Exercise(
        id=2,
        lesson_id=l1.id,
        order=2,
        type="translate_words",
        prompt="Translate this sentence:",
        target_text="The boy drinks water",
        audio_text="El niño bebe agua",
        question_data=json.dumps({
            "tokens": ["El", "niño", "bebe", "agua", "la", "come", "manzana", "pan"]
        }),
        solution_data=json.dumps({
            "correct_tokens": ["El", "niño", "bebe", "agua"],
            "explanation": "‘El niño’ = The boy, ‘bebe’ = drinks, ‘agua’ = water."
        })
    )

    ex1_3 = Exercise(
        id=3,
        lesson_id=l1.id,
        order=3,
        type="match_pairs",
        prompt="Tap the matching pairs:",
        target_text=None,
        audio_text=None,
        question_data=json.dumps({
            "pairs": [
                {"left": "hola", "right": "hello"},
                {"left": "adiós", "right": "goodbye"},
                {"left": "agua", "right": "water"},
                {"left": "niño", "right": "boy"},
                {"left": "gracias", "right": "thank you"}
            ]
        }),
        solution_data=json.dumps({
            "pairs": {
                "hola": "hello",
                "adiós": "goodbye",
                "agua": "water",
                "niño": "boy",
                "gracias": "thank you"
            },
            "explanation": "Match all five Spanish and English vocabulary words."
        })
    )

    ex1_4 = Exercise(
        id=4,
        lesson_id=l1.id,
        order=4,
        type="fill_blank",
        prompt="Fill in the blank:",
        target_text="Yo ___ pan.",
        audio_text="Yo como pan.",
        question_data=json.dumps({
            "sentence_template": "Yo [blank] pan.",
            "translation": "I eat bread.",
            "options": ["como", "comes", "come", "bebo"]
        }),
        solution_data=json.dumps({
            "correct_word": "como",
            "explanation": "For the first person singular 'Yo' (I), the present tense of comer is 'como'."
        })
    )

    ex1_5 = Exercise(
        id=5,
        lesson_id=l1.id,
        order=5,
        type="type_answer",
        prompt="Write this in Spanish:",
        target_text="The girl",
        audio_text="La niña",
        question_data=json.dumps({
            "placeholder": "Type in Spanish...",
            "special_chars": ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]
        }),
        solution_data=json.dumps({
            "acceptable_answers": ["la niña", "la nina", "La niña", "La nina"],
            "primary_answer": "La niña",
            "explanation": "‘Girl’ is feminine in Spanish, so it takes the feminine article ‘la’: ‘La niña’."
        })
    )

    # Lesson 2 Exercises (Eating & Drinking)
    ex2_1 = Exercise(
        id=6,
        lesson_id=l2.id,
        order=1,
        type="multiple_choice",
        prompt="Which of these is 'The apple'?",
        target_text="The apple",
        audio_text="La manzana",
        question_data=json.dumps({
            "options": [
                {"id": "opt1", "text": "La manzana", "subtext": "Fruit"},
                {"id": "opt2", "text": "El pan", "subtext": "Grain"},
                {"id": "opt3", "text": "La leche", "subtext": "Drink"},
                {"id": "opt4", "text": "El agua", "subtext": "Drink"}
            ]
        }),
        solution_data=json.dumps({
            "correct_option_id": "opt1",
            "correct_text": "La manzana",
            "explanation": "‘Manzana’ means apple and is feminine."
        })
    )

    ex2_2 = Exercise(
        id=7,
        lesson_id=l2.id,
        order=2,
        type="translate_words",
        prompt="Translate this sentence:",
        target_text="She eats an apple",
        audio_text="Ella come una manzana",
        question_data=json.dumps({
            "tokens": ["Ella", "come", "una", "manzana", "bebe", "un", "hombre", "pan"]
        }),
        solution_data=json.dumps({
            "correct_tokens": ["Ella", "come", "una", "manzana"],
            "explanation": "‘Ella come una manzana’ translates directly to ‘She eats an apple’."
        })
    )

    ex2_3 = Exercise(
        id=8,
        lesson_id=l2.id,
        order=3,
        type="match_pairs",
        prompt="Match the vocabulary:",
        target_text=None,
        audio_text=None,
        question_data=json.dumps({
            "pairs": [
                {"left": "manzana", "right": "apple"},
                {"left": "leche", "right": "milk"},
                {"left": "pan", "right": "bread"},
                {"left": "ella", "right": "she"},
                {"left": "él", "right": "he"}
            ]
        }),
        solution_data=json.dumps({
            "pairs": {
                "manzana": "apple",
                "leche": "milk",
                "pan": "bread",
                "ella": "she",
                "él": "he"
            },
            "explanation": "Food and pronoun matching."
        })
    )

    ex2_4 = Exercise(
        id=9,
        lesson_id=l2.id,
        order=4,
        type="type_answer",
        prompt="Translate to English:",
        target_text="Él bebe leche",
        audio_text="Él bebe leche",
        question_data=json.dumps({
            "placeholder": "Type in English...",
            "special_chars": []
        }),
        solution_data=json.dumps({
            "acceptable_answers": ["He drinks milk", "he drinks milk", "He is drinking milk"],
            "primary_answer": "He drinks milk",
            "explanation": "‘Él’ is ‘He’, ‘bebe’ is ‘drinks’, ‘leche’ is ‘milk’."
        })
    )

    # Lesson 3 Exercises (Complete Sentences)
    ex3_1 = Exercise(
        id=10,
        lesson_id=l3.id,
        order=1,
        type="translate_words",
        prompt="Translate this sentence:",
        target_text="I am a man and she is a woman",
        audio_text="Yo soy un hombre y ella es una mujer",
        question_data=json.dumps({
            "tokens": ["Yo", "soy", "un", "hombre", "y", "ella", "es", "una", "mujer", "el", "come"]
        }),
        solution_data=json.dumps({
            "correct_tokens": ["Yo", "soy", "un", "hombre", "y", "ella", "es", "una", "mujer"],
            "explanation": "Combining two simple clauses with ‘y’ (and)."
        })
    )

    ex3_2 = Exercise(
        id=11,
        lesson_id=l3.id,
        order=2,
        type="fill_blank",
        prompt="Complete the sentence:",
        target_text="Tú ___ leche y agua.",
        audio_text="Tú bebes leche y agua.",
        question_data=json.dumps({
            "sentence_template": "Tú [blank] leche y agua.",
            "translation": "You drink milk and water.",
            "options": ["bebes", "bebo", "bebe", "comemos"]
        }),
        solution_data=json.dumps({
            "correct_word": "bebes",
            "explanation": "The second-person singular (tú) form of 'beber' is 'bebes'."
        })
    )

    ex3_3 = Exercise(
        id=12,
        lesson_id=l3.id,
        order=3,
        type="match_pairs",
        prompt="Tap the matching pairs:",
        target_text=None,
        audio_text=None,
        question_data=json.dumps({
            "pairs": [
                {"left": "hombre", "right": "man"},
                {"left": "mujer", "right": "woman"},
                {"left": "tú", "right": "you"},
                {"left": "yo", "right": "I"},
                {"left": "sí", "right": "yes"}
            ]
        }),
        solution_data=json.dumps({
            "pairs": {
                "hombre": "man",
                "mujer": "woman",
                "tú": "you",
                "yo": "I",
                "sí": "yes"
            },
            "explanation": "Personal pronouns and nouns."
        })
    )

    # Lesson 4 Exercises (Skill 2 Greetings)
    ex4_1 = Exercise(
        id=13,
        lesson_id=l4.id,
        order=1,
        type="translate_words",
        prompt="Translate this sentence:",
        target_text="Good morning, how are you?",
        audio_text="Buenos días, ¿cómo estás?",
        question_data=json.dumps({
            "tokens": ["Buenos", "días,", "¿cómo", "estás?", "noches", "gracias", "bien", "mucho"]
        }),
        solution_data=json.dumps({
            "correct_tokens": ["Buenos", "días,", "¿cómo", "estás?"],
            "explanation": "‘Buenos días’ means good morning, and ‘¿cómo estás?’ asks how you are."
        })
    )

    ex4_2 = Exercise(
        id=14,
        lesson_id=l4.id,
        order=2,
        type="multiple_choice",
        prompt="What does 'Mucho gusto' mean?",
        target_text="Mucho gusto",
        audio_text="Mucho gusto",
        question_data=json.dumps({
            "options": [
                {"id": "opt1", "text": "Nice to meet you", "subtext": "Common greeting"},
                {"id": "opt2", "text": "See you later", "subtext": "Hasta luego"},
                {"id": "opt3", "text": "Good night", "subtext": "Buenas noches"},
                {"id": "opt4", "text": "Excuse me", "subtext": "Disculpe"}
            ]
        }),
        solution_data=json.dumps({
            "correct_option_id": "opt1",
            "correct_text": "Nice to meet you",
            "explanation": "‘Mucho gusto’ literally translates to ‘much pleasure’ = ‘nice to meet you’."
        })
    )

    ex4_3 = Exercise(
        id=15,
        lesson_id=l4.id,
        order=3,
        type="type_answer",
        prompt="Write in Spanish:",
        target_text="Please",
        audio_text="Por favor",
        question_data=json.dumps({
            "placeholder": "Type in Spanish...",
            "special_chars": ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]
        }),
        solution_data=json.dumps({
            "acceptable_answers": ["por favor", "Por favor", "porfavor"],
            "primary_answer": "Por favor",
            "explanation": "‘Por favor’ means please."
        })
    )

    db.add_all([
        ex1_1, ex1_2, ex1_3, ex1_4, ex1_5,
        ex2_1, ex2_2, ex2_3, ex2_4,
        ex3_1, ex3_2, ex3_3,
        ex4_1, ex4_2, ex4_3
    ])
    db.commit()

    # 7. Seed Initial User Progress:
    # Skill 1 has 3 lessons. Give user lesson 1 already completed!
    p1 = UserLessonProgress(
        user_id=main_user.id,
        lesson_id=l1.id,
        completed=True,
        score=1.0,
        completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(p1)

    sp1 = UserSkillProgress(
        user_id=main_user.id,
        skill_id=s1.id,
        completed_lessons=1,
        is_unlocked=True,
        is_completed=False
    )
    sp2 = UserSkillProgress(
        user_id=main_user.id,
        skill_id=s2.id,
        completed_lessons=0,
        is_unlocked=False,
        is_completed=False
    )
    sp3 = UserSkillProgress(
        user_id=main_user.id,
        skill_id=s3.id,
        completed_lessons=0,
        is_unlocked=False,
        is_completed=False
    )
    db.add_all([sp1, sp2, sp3])
    db.commit()

    # 8. Seed Leaderboard Competitors
    leaderboard_seed = [
        LeaderboardUser(name="Sofia Chen", username="sofia_c", avatar="👩🏻‍💻", league="Silver", xp=650),
        LeaderboardUser(name="Mateo Ramos", username="mateo_r", avatar="🦊", league="Silver", xp=590),
        LeaderboardUser(name="Alex Rivera", username="learner_alex", avatar="🦉", league="Silver", xp=480, is_current_user=True),
        LeaderboardUser(name="Emma Watson", username="emma_w", avatar="👩🏼‍🎓", league="Silver", xp=440),
        LeaderboardUser(name="Lucas Silva", username="lucas_br", avatar="⚽", league="Silver", xp=410),
        LeaderboardUser(name="Aria Patel", username="aria_p", avatar="🎨", league="Silver", xp=380),
        LeaderboardUser(name="Dmitri Volkov", username="dmitri_v", avatar="🐻", league="Silver", xp=320),
        LeaderboardUser(name="Zara Kim", username="zara_k", avatar="🚀", league="Silver", xp=280),
        LeaderboardUser(name="Carlos Gomez", username="carlos_g", avatar="🌮", league="Silver", xp=210),
        LeaderboardUser(name="Yuki Tanaka", username="yuki_t", avatar="🌸", league="Silver", xp=160),
    ]
    db.add_all(leaderboard_seed)
    db.commit()

    # 9. Seed Quests
    q1 = Quest(
        user_id=main_user.id,
        title="Earn 50 XP today",
        description="Complete lessons and practice to gain XP",
        icon="lightning",
        current_progress=30,
        target_progress=50,
        reward_gems=20,
        is_claimed=False
    )
    q2 = Quest(
        user_id=main_user.id,
        title="Complete 3 lessons",
        description="Advance through your learning path",
        icon="book",
        current_progress=1,
        target_progress=3,
        reward_gems=30,
        is_claimed=False
    )
    q3 = Quest(
        user_id=main_user.id,
        title="Score 90% or higher",
        description="Test your accuracy in 2 exercises or lessons",
        icon="target",
        current_progress=1,
        target_progress=2,
        reward_gems=25,
        is_claimed=False
    )
    db.add_all([q1, q2, q3])
    db.commit()

    # 10. Seed Achievements
    achievements = [
        Achievement(
            code="wildfire",
            title="Wildfire",
            description="Reach a 7 day streak",
            icon="flame",
            tier=1,
            max_tier=5,
            progress=4,
            goal=7
        ),
        Achievement(
            code="sage",
            title="Sage",
            description="Earn 1,000 XP in total",
            icon="sparkles",
            tier=1,
            max_tier=5,
            progress=480,
            goal=1000
        ),
        Achievement(
            code="champion",
            title="Champion",
            description="Advance to the Gold League",
            icon="trophy",
            tier=1,
            max_tier=3,
            progress=2,
            goal=3
        ),
        Achievement(
            code="scholar",
            title="Scholar",
            description="Learn 50 new words",
            icon="book-open",
            tier=1,
            max_tier=5,
            progress=24,
            goal=50
        )
    ]
    db.add_all(achievements)
    db.commit()

    print("Duolingo database successfully seeded with courses, skills, lessons, exercises, and learner progress!")
