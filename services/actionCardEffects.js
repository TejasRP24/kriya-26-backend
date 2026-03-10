export function applyActionCardEffect(actionCard, { team }) {
  const cardNumber = actionCard.cardNumber;

  switch (cardNumber) {
    case 1: {
      // Add lives to all Round 2 problems
      if (team.round2 && Array.isArray(team.round2.problemsStatus)) {
        team.round2.problemsStatus = team.round2.problemsStatus.map((p) => ({
          ...(p.toObject?.() || p),
          livesLeft: (p.livesLeft || 0) + 2
        }));
      }

      return {
        code: "BLACK_PEARL_RESURGENCE",
        message: "Granted 2 extra lives for Round 2 problems.",
        livesAdded: 2
      };
    }
    case 2: {
      // Mark that the next failed testcase may be ignored
      team.round2 = team.round2 || {};
      team.round2.ignoreNextFailedTestcase = true;

      return {
        code: "DAVY_JONES_MERCY",
        message: "One failed testcase may be ignored for the next submission."
      };
    }
    case 3: {
      const bonus = 10;
      team.round2 = team.round2 || {};
      team.round2.score = (team.round2.score || 0) + bonus;
      team.totalScore = (team.totalScore || 0) + bonus;

      return {
        code: "ISLA_DE_MUERTA_TREASURE",
        message: `+${bonus} bonus points added to Round 2 and total score.`,
        bonusPoints: bonus
      };
    }
    case 4: {
      // Mark that a hint is available for the current problem
      team.round2 = team.round2 || {};
      team.round2.hasHintAvailable = true;

      return {
        code: "CAPTAINS_HIDDEN_MAP",
        message: "Hint should be revealed to the team for the current problem."
      };
    }
    case 5: {
      // Mark that the next mini‑game reward should be doubled
      team.round2 = team.round2 || {};
      team.round2.doubleNextMiniGameReward = true;

      return {
        code: "CHEST_OF_CORTES",
        message: "Next mini‑game reward should be doubled."
      };
    }
    case 6: {
      // Mark that the current question should be swapped on next attempt
      team.round2 = team.round2 || {};
      team.round2.swapCurrentQuestionOnNextAttempt = true;

      return {
        code: "TURN_THE_TIDE",
        message: "Current question should be swapped for a new one."
      };
    }
    case 7: {
      // Prevent difficulty from increasing for the next question
      team.round2 = team.round2 || {};
      team.round2.freezeDifficultyNextQuestion = true;

      return {
        code: "ANCHOR_DROP",
        message: "Next question difficulty should not increase."
      };
    }
    case 8: {
      // Reveal which testcase failed on the next run
      team.round2 = team.round2 || {};
      team.round2.revealFailedTestcaseNextRun = true;

      return {
        code: "SPYGLASS_FOCUS",
        message: "Reveal which testcase caused the failure for the next run.",
        revealFailedTestcase: true
      };
    }
    default:
      return {
        code: "UNKNOWN_CARD",
        message: "No effect is defined for this action card."
      };
  }
}

