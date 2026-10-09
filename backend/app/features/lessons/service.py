import re
import unicodedata
from typing import Any, NamedTuple


class AnswerEvaluation(NamedTuple):
    is_correct: bool
    correct_solution: Any
    explanation: str


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.strip().lower()
    text = re.sub(r'[¿?¡!.,;:"\'()\[\]{}]', "", text)
    return " ".join(text.split())


def remove_accents(text: str) -> str:
    return "".join(
        character
        for character in unicodedata.normalize("NFD", text)
        if unicodedata.category(character) != "Mn"
    )


def evaluate_answer(
    exercise_type: str,
    solution: dict[str, Any],
    user_answer: Any,
) -> AnswerEvaluation:
    correct_solution: Any = None
    explanation = str(solution.get("explanation", ""))

    if exercise_type == "multiple_choice":
        correct_solution = solution.get("correct_text") or solution.get("correct_option_id")
    elif exercise_type == "translate_words":
        correct_solution = " ".join(solution.get("correct_tokens", []))
    elif exercise_type == "match_pairs":
        correct_solution = "All matching vocabulary pairs"
    elif exercise_type == "fill_blank":
        correct_solution = solution.get("correct_word", "")
    elif exercise_type == "type_answer":
        acceptable = solution.get("acceptable_answers", [])
        correct_solution = solution.get("primary_answer") or (acceptable[0] if acceptable else "")

    is_correct = False
    if user_answer == "__SKIPPED__":
        return AnswerEvaluation(False, correct_solution, explanation)
    if exercise_type == "multiple_choice":
        correct_option_id = solution.get("correct_option_id")
        correct_text = solution.get("correct_text")
        is_correct = (
            str(user_answer).strip().lower() == str(correct_option_id).strip().lower()
            or str(user_answer).strip().lower() == str(correct_text).strip().lower()
        )
    elif exercise_type == "translate_words":
        correct_tokens = solution.get("correct_tokens", [])
        if isinstance(user_answer, list):
            user_tokens = [str(token).strip() for token in user_answer]
            is_correct = len(user_tokens) == len(correct_tokens) and all(
                normalize_text(user_token) == normalize_text(correct_token)
                for user_token, correct_token in zip(user_tokens, correct_tokens)
            )
        elif isinstance(user_answer, str):
            is_correct = normalize_text(user_answer) == normalize_text(" ".join(correct_tokens))
    elif exercise_type == "match_pairs":
        pairs = solution.get("pairs", {})
        if isinstance(user_answer, dict):
            is_correct = all(
                str(user_answer.get(key, "")).strip().lower() == str(value).strip().lower()
                for key, value in pairs.items()
            )
        else:
            is_correct = user_answer is True or user_answer == "completed"
    elif exercise_type == "fill_blank":
        is_correct = normalize_text(str(user_answer)) == normalize_text(
            solution.get("correct_word", "")
        )
    elif exercise_type == "type_answer":
        normalized_user = normalize_text(str(user_answer))
        accentless_user = remove_accents(normalized_user)
        is_correct = any(
            normalized_user == normalized_answer
            or accentless_user == remove_accents(normalized_answer)
            for normalized_answer in (
                normalize_text(answer) for answer in solution.get("acceptable_answers", [])
            )
        )

    return AnswerEvaluation(is_correct, correct_solution, explanation)
