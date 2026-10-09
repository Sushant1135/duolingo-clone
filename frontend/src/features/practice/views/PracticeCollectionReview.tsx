"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
} from "lucide-react";
import { sound } from "@/services/audio";

type Collection = "words" | "stories";

const vocabulary = [
  { german: "Hallo", english: "hello", topic: "Greetings" },
  { german: "Guten Morgen", english: "good morning", topic: "Greetings" },
  { german: "Guten Abend", english: "good evening", topic: "Greetings" },
  { german: "Tschüss", english: "goodbye", topic: "Greetings" },
  { german: "Danke", english: "thank you", topic: "Greetings" },
  { german: "Bitte", english: "please / you’re welcome", topic: "Greetings" },
  { german: "der Name", english: "name", topic: "Introductions" },
  { german: "Ich heiße …", english: "my name is …", topic: "Introductions" },
  { german: "kommen aus", english: "to come from", topic: "Introductions" },
  { german: "Freut mich", english: "nice to meet you", topic: "Introductions" },
  { german: "das Brot", english: "bread", topic: "Food & café" },
  { german: "der Apfel", english: "apple", topic: "Food & café" },
  { german: "der Käse", english: "cheese", topic: "Food & café" },
  { german: "die Suppe", english: "soup", topic: "Food & café" },
  { german: "das Wasser", english: "water", topic: "Food & café" },
  { german: "Ich hätte gern …", english: "I would like …", topic: "Food & café" },
  { german: "die Rechnung", english: "the bill", topic: "Food & café" },
  { german: "aufstehen", english: "to get up", topic: "Daily life" },
  { german: "arbeiten", english: "to work", topic: "Daily life" },
  { german: "lernen", english: "to study", topic: "Daily life" },
  { german: "heute", english: "today", topic: "Daily life" },
  { german: "morgen", english: "tomorrow", topic: "Daily life" },
  { german: "der Bahnhof", english: "train station", topic: "Travel" },
  { german: "die Fahrkarte", english: "ticket", topic: "Travel" },
  { german: "geradeaus", english: "straight ahead", topic: "Travel" },
  { german: "links", english: "left", topic: "Travel" },
  { german: "rechts", english: "right", topic: "Travel" },
  { german: "die Wohnung", english: "apartment", topic: "Home & work" },
  { german: "der Schlüssel", english: "key", topic: "Home & work" },
  { german: "die Besprechung", english: "meeting", topic: "Home & work" },
  { german: "die Größe", english: "size", topic: "Shopping" },
  { german: "bezahlen", english: "to pay", topic: "Shopping" },
];

const stories = [
  {
    title: "Ein Morgen in Berlin",
    level: "A1 · Greetings",
    summary: "Lena meets her new neighbor before work.",
    paragraphs: [
      "Lena geht am Morgen aus dem Haus. Vor der Tür trifft sie ihren neuen Nachbarn.",
      "„Guten Morgen! Ich heiße Lena. Wie heißen Sie?“ fragt sie.",
      "„Ich heiße Paul. Freut mich!“, sagt der Nachbar. Zusammen gehen sie zur U-Bahn.",
    ],
    translation: [
      "In the morning, Lena leaves the house. At the door, she meets her new neighbor.",
      "“Good morning! My name is Lena. What is your name?” she asks.",
      "“My name is Paul. Nice to meet you!” says the neighbor. They walk to the subway together.",
    ],
    question: "Wen trifft Lena?",
    answers: ["ihren neuen Nachbarn", "ihre Lehrerin", "einen Kellner"],
    correct: "ihren neuen Nachbarn",
  },
  {
    title: "Im Café am Markt",
    level: "A1 · Food & café",
    summary: "Jonas orders breakfast and asks for the bill.",
    paragraphs: [
      "Jonas sitzt in einem kleinen Café. Er liest die Speisekarte und bestellt einen Kaffee und ein Brot mit Käse.",
      "Die Kellnerin bringt das Frühstück. „Möchten Sie noch Wasser?“ fragt sie. Jonas sagt: „Ja, bitte.“",
      "Nach dem Essen sagt Jonas: „Die Rechnung, bitte.“",
    ],
    translation: [
      "Jonas is sitting in a small café. He reads the menu and orders a coffee and bread with cheese.",
      "The waitress brings breakfast. “Would you like some water too?” she asks. Jonas says, “Yes, please.”",
      "After eating, Jonas says, “The bill, please.”",
    ],
    question: "Was bestellt Jonas zum Frühstück?",
    answers: ["Kaffee und Brot mit Käse", "Tee und Suppe", "Wasser und einen Apfel"],
    correct: "Kaffee und Brot mit Käse",
  },
  {
    title: "Der verpasste Zug",
    level: "A1 · Travel",
    summary: "Mira finds the right platform at the station.",
    paragraphs: [
      "Mira kommt um acht Uhr am Bahnhof an. Ihr Zug fährt von Gleis drei ab.",
      "Sie fragt einen Mitarbeiter: „Entschuldigung, wo ist Gleis drei?“",
      "„Gehen Sie geradeaus und dann rechts“, sagt er. Mira findet den Zug noch rechtzeitig.",
    ],
    translation: [
      "Mira arrives at the train station at eight o’clock. Her train leaves from platform three.",
      "She asks an employee, “Excuse me, where is platform three?”",
      "“Go straight ahead and then right,” he says. Mira finds the train just in time.",
    ],
    question: "Wo fährt Miras Zug ab?",
    answers: ["Von Gleis drei", "Von Gleis acht", "Von der Bushaltestelle"],
    correct: "Von Gleis drei",
  },
  {
    title: "Ein freier Samstag",
    level: "A1 · Daily life",
    summary: "Tom makes a relaxed plan for his day off.",
    paragraphs: [
      "Am Samstag steht Tom spät auf. Er frühstückt und liest ein Buch am Fenster.",
      "Am Nachmittag trifft er seine Freundin im Park. Sie gehen spazieren und trinken danach Tee.",
      "Am Abend kocht Tom zu Hause. Morgen muss er wieder arbeiten.",
    ],
    translation: [
      "On Saturday, Tom gets up late. He has breakfast and reads a book by the window.",
      "In the afternoon, he meets his friend in the park. They go for a walk and drink tea afterward.",
      "In the evening, Tom cooks at home. Tomorrow he has to work again.",
    ],
    question: "Was macht Tom am Nachmittag?",
    answers: ["Er geht im Park spazieren.", "Er fährt zum Bahnhof.", "Er arbeitet im Büro."],
    correct: "Er geht im Park spazieren.",
  },
  {
    title: "Ein Zimmer in Hamburg",
    level: "A2 · Home",
    summary: "Nora looks at a bright apartment near the harbor.",
    paragraphs: [
      "Nora sucht eine Wohnung in Hamburg. Heute besichtigt sie ein helles Zimmer mit einem großen Fenster.",
      "Der Vermieter zeigt ihr die Küche und den Balkon. Nora fragt: „Wie hoch ist die Miete?“",
      "Die Wohnung gefällt ihr, denn die Bushaltestelle ist gleich um die Ecke. Am Abend ruft sie den Vermieter an.",
    ],
    translation: [
      "Nora is looking for an apartment in Hamburg. Today she views a bright room with a large window.",
      "The landlord shows her the kitchen and balcony. Nora asks, “How much is the rent?”",
      "She likes the apartment because the bus stop is just around the corner. In the evening, she calls the landlord.",
    ],
    question: "Warum gefällt Nora die Wohnung?",
    answers: ["Die Bushaltestelle ist in der Nähe.", "Die Miete ist kostenlos.", "Das Zimmer hat kein Fenster."],
    correct: "Die Bushaltestelle ist in der Nähe.",
  },
  {
    title: "Die richtige Größe",
    level: "A2 · Shopping",
    summary: "Emil asks for help finding a jacket in a shop.",
    paragraphs: [
      "Emil braucht eine neue Jacke. Im Geschäft findet er eine blaue Jacke, aber sie ist zu klein.",
      "Er fragt die Verkäuferin: „Haben Sie diese Jacke auch in Größe L?“",
      "Sie bringt eine größere Jacke. Emil probiert sie an und bezahlt mit Karte.",
    ],
    translation: [
      "Emil needs a new jacket. In the shop, he finds a blue jacket, but it is too small.",
      "He asks the sales assistant, “Do you also have this jacket in size L?”",
      "She brings a larger jacket. Emil tries it on and pays by card.",
    ],
    question: "Wie bezahlt Emil?",
    answers: ["Mit Karte", "Mit Bargeld", "Mit einem Ticket"],
    correct: "Mit Karte",
  },
];

interface PracticeCollectionReviewProps {
  collection: Collection;
  onBack: () => void;
}

export function PracticeCollectionReview({
  collection,
  onBack,
}: PracticeCollectionReviewProps) {
  const [query, setQuery] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<string>>(() => new Set());
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const filteredVocabulary = useMemo(
    () =>
      vocabulary.filter((word) =>
        `${word.german} ${word.english} ${word.topic}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      ),
    [query],
  );
  const currentWord = filteredVocabulary[wordIndex];
  const activeStory = activeStoryIndex === null ? null : stories[activeStoryIndex];
  const knownCount = knownWords.size;

  const selectWord = (word: (typeof vocabulary)[number]) => {
    const nextIndex = filteredVocabulary.findIndex((item) => item.german === word.german);
    if (nextIndex >= 0) {
      setWordIndex(nextIndex);
      setIsWordRevealed(false);
    }
  };

  const moveWord = (offset: number) => {
    setWordIndex((index) => (index + offset + filteredVocabulary.length) % filteredVocabulary.length);
    setIsWordRevealed(false);
  };

  const openStory = (index: number) => {
    setActiveStoryIndex(index);
    setShowTranslation(false);
    setSelectedAnswer(null);
  };

  const closeStory = () => {
    setActiveStoryIndex(null);
    setShowTranslation(false);
    setSelectedAnswer(null);
  };

  return (
    <section className="mx-auto w-full max-w-[900px]">
      <button
        type="button"
        onClick={activeStory ? closeStory : onBack}
        className="mb-6 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[#1cb0f6]"
      >
        <ArrowLeft className="h-5 w-5" />
        {activeStory ? "All stories" : "Back to practice"}
      </button>

      {collection === "words" ? (
        <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1cb0f6]">Vocabulary builder</p>
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Your German words</h1>
              <p className="mt-2 font-semibold text-[var(--text-secondary)]">Tap a card to reveal its meaning, or listen to the pronunciation.</p>
            </div>
            <span className="rounded-full bg-[#e5f7ff] px-4 py-2 text-sm font-extrabold text-[#1687bd] dark:bg-[#173748] dark:text-[#8bd8ff]">
              {knownCount} / {vocabulary.length} learned
            </span>
          </div>

          <label className="mb-5 block">
            <span className="sr-only">Search vocabulary</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setWordIndex(0);
                setIsWordRevealed(false);
              }}
              placeholder="Search German, English, or topic"
              className="w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[#1cb0f6]"
            />
          </label>

          {currentWord ? (
            <div className="mb-6 rounded-[24px] border-2 border-[#2e4550] bg-[var(--surface)] p-5 shadow-[0_5px_0_rgba(0,0,0,0.08)] sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="rounded-full bg-[#173748] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#8bd8ff]">
                  {currentWord.topic}
                </span>
                <span className="text-sm font-extrabold text-[var(--text-secondary)]">
                  {wordIndex + 1} / {filteredVocabulary.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => sound.speak(currentWord.german, "de-DE")}
                aria-label={`Hear ${currentWord.german}`}
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#173748] text-[#1cb0f6] transition hover:bg-[#1b3848]"
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsWordRevealed((revealed) => !revealed)}
                className="block min-h-36 w-full rounded-2xl bg-[#132329] px-5 py-8 text-center transition hover:bg-[#1b2e35]"
              >
                <span className="block text-3xl font-extrabold text-white sm:text-4xl">{currentWord.german}</span>
                {isWordRevealed ? (
                  <span className="mt-3 block text-lg font-bold text-[#8bd8ff]">{currentWord.english}</span>
                ) : (
                  <span className="mt-3 block text-sm font-bold text-[#8b9eab]">Tap to reveal meaning</span>
                )}
                {knownWords.has(currentWord.german) && (
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-[#58cc02]">
                    <Check className="h-4 w-4" /> Learned
                  </span>
                )}
              </button>
              <div className="mt-5 flex items-center justify-between gap-3">
                <button type="button" onClick={() => moveWord(-1)} className="rounded-xl border-2 border-[var(--border)] px-4 py-2 font-extrabold text-[var(--text-primary)] hover:border-[#1cb0f6]">
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isWordRevealed) {
                      setIsWordRevealed(true);
                      return;
                    }
                    setKnownWords((current) => new Set(current).add(currentWord.german));
                    moveWord(1);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#58cc02] px-5 py-3 font-extrabold text-white shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none"
                >
                  {isWordRevealed ? "Got it" : "Reveal answer"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border-2 border-[var(--border)] p-6 font-bold text-[var(--text-secondary)]">No words match that search.</p>
          )}

          <h2 className="mb-3 text-xl font-extrabold text-[var(--text-primary)]">Browse by topic</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVocabulary.map((word) => (
              <button
                key={word.german}
                type="button"
                onClick={() => selectWord(word)}
                className={`rounded-2xl border-2 p-4 text-left transition hover:border-[#1cb0f6] ${
                  currentWord?.german === word.german
                    ? "border-[#1cb0f6] bg-[#e5f7ff] dark:bg-[#173748]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <span className="block font-extrabold text-[var(--text-primary)]">{word.german}</span>
                <span className="mt-1 block text-sm font-semibold text-[var(--text-secondary)]">{word.english}</span>
                <span className="mt-3 block text-[11px] font-extrabold uppercase tracking-wide text-[#1cb0f6]">{word.topic}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a560d4]">Read · Listen · Understand</p>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">German stories</h1>
            <p className="mt-2 font-semibold text-[var(--text-secondary)]">Six original mini-stories with audio, translations, and a quick comprehension check.</p>
          </div>

          {activeStory ? (
            <article className="rounded-[24px] border-2 border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-[#a560d4]">{activeStory.level}</span>
                  <h2 className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">{activeStory.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => sound.speak(activeStory.paragraphs.join(" "), "de-DE")}
                  className="flex items-center gap-2 rounded-xl bg-[#f4eaff] px-4 py-3 font-extrabold text-[#a560d4] dark:bg-[#2d2240]"
                >
                  <Volume2 className="h-5 w-5" /> Listen
                </button>
              </div>

              <div className="space-y-4 rounded-2xl bg-[var(--surface-secondary)] p-5 text-lg font-semibold leading-relaxed text-[var(--text-primary)]">
                {(showTranslation ? activeStory.translation : activeStory.paragraphs).map((paragraph, index) => (
                  <p key={`${activeStory.title}-${index}`}>{paragraph}</p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTranslation((shown) => !shown)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-[#1cb0f6] hover:underline"
              >
                {showTranslation ? "Hide English translation" : "Show English translation"}
                {showTranslation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <section className="mt-7 border-t-2 border-[var(--border)] pt-6">
                <h3 className="mb-4 text-lg font-extrabold text-[var(--text-primary)]">{activeStory.question}</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {activeStory.answers.map((answer) => {
                    const correct = answer === activeStory.correct;
                    const selected = selectedAnswer === answer;
                    return (
                      <button
                        key={answer}
                        type="button"
                        onClick={() => setSelectedAnswer(answer)}
                        className={`rounded-2xl border-2 p-4 text-left font-bold transition ${
                          selected
                            ? correct
                              ? "border-[#58cc02] bg-[#e8f8d9] text-[#347b00] dark:bg-[#18391f] dark:text-[#b8f28e]"
                              : "border-[#ff4b4b] bg-[#ffeded] text-[#c43d3d] dark:bg-[#381f24] dark:text-[#ffb4b4]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[#a560d4]"
                        }`}
                      >
                        {answer}
                      </button>
                    );
                  })}
                </div>
                {selectedAnswer && (
                  <p role="status" className={`mt-4 font-extrabold ${selectedAnswer === activeStory.correct ? "text-[#58a700] dark:text-[#8ee042]" : "text-[#c43d3d] dark:text-[#ff8c8c]"}`}>
                    {selectedAnswer === activeStory.correct ? "Richtig! Gut gelesen." : "Noch nicht ganz. Lies die Geschichte noch einmal."}
                  </p>
                )}
                <div className="mt-6 flex justify-between gap-3">
                  <button
                    type="button"
                    disabled={activeStoryIndex === 0}
                    onClick={() => openStory((activeStoryIndex ?? 0) - 1)}
                    className="rounded-xl border-2 border-[var(--border)] px-4 py-2 font-extrabold text-[var(--text-primary)] hover:border-[#a560d4] disabled:opacity-40"
                  >
                    Previous story
                  </button>
                  <button
                    type="button"
                    disabled={activeStoryIndex === stories.length - 1}
                    onClick={() => openStory((activeStoryIndex ?? 0) + 1)}
                    className="flex items-center gap-2 rounded-xl bg-[#a560d4] px-4 py-2 font-extrabold text-white hover:brightness-110 disabled:opacity-40"
                  >
                    Next story <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {stories.map((story, index) => (
                <button
                  key={story.title}
                  type="button"
                  onClick={() => openStory(index)}
                  className="group rounded-[22px] border-2 border-[var(--border)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-1 hover:border-[#a560d4]"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eaff] text-[#a560d4] dark:bg-[#2d2240]">
                    <BookOpen className="h-7 w-7" />
                  </span>
                  <span className="block text-xs font-extrabold uppercase tracking-wide text-[#a560d4]">{story.level}</span>
                  <span className="mt-1 block text-xl font-extrabold text-[var(--text-primary)]">{story.title}</span>
                  <span className="mt-2 block font-semibold leading-relaxed text-[var(--text-secondary)]">{story.summary}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-[#a560d4]">
                    Read story <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
