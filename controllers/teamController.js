import Team from "../models/Team.js";
import ActionCard from "../models/actionCard.model.js";
import Round1Question from "../models/round1questions.js";
import Round1Submission from "../models/round1submission.js";
import Round2Question from "../models/round2questions.js";
import Round2Submission from "../models/round2submission.js";
import { applyActionCardEffect } from "../services/actionCardEffects.js";
import { getShipConfig } from "../config/shipConfig.js";
import { syncLeaderboard } from "../services/scoringService.js";

export const getTeams = async (_req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching teams", error: err });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ msg: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching team", error: err });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { teamName, kriyaID, captainName, regMail, shipConfig } = req.body;

    if (!teamName || !kriyaID || !captainName || !regMail || !shipConfig) {
      return res.status(400).json({ msg: "All required fields must be provided" });
    }

    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ msg: "Error creating team", error: err.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) return res.status(404).json({ msg: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ msg: "Error updating team", error: err });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ msg: "Team not found" });
    res.json({ msg: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting team", error: err });
  }
};

/**
 * Choose ship configuration for the team.
 * Sets the shipConfig string (WARSHIP, MERCHANT, GHOST).
 */
export const chooseShipConfig = async (req, res) => {
  try {
    const { shipConfig } = req.body;
    if (!shipConfig) {
      return res.status(400).json({ msg: "shipConfig is required" });
    }

    const validShips = ["WARSHIP", "MERCHANT", "GHOST"];
    if (!validShips.includes(shipConfig.toUpperCase())) {
      return res.status(400).json({ msg: `Invalid ship. Must be one of: ${validShips.join(", ")}` });
    }

    const team = await Team.findById(req.team._id);
    if (!team) return res.status(404).json({ msg: "Team not found" });

    team.shipConfig = shipConfig.toUpperCase();
    await team.save();

    const config = getShipConfig(team.shipConfig);
    res.json({
      msg: "Ship configuration selected",
      shipConfig: team.shipConfig,
      details: config
    });
  } catch (err) {
    res.status(500).json({ msg: "Error choosing ship config", error: err.message });
  }
};

/**
 * Submit Round 1 answers.
 * Creates Round1Submission records and updates team score.
 */
export const round1Answers = async (req, res) => {
  try {
    const { questionId, submittedAnswer, timeTaken } = req.body;

    if (!questionId || submittedAnswer === undefined) {
      return res.status(400).json({ msg: "questionId and submittedAnswer are required" });
    }

    const team = await Team.findById(req.team._id);
    if (!team) return res.status(404).json({ msg: "Team not found" });

    const question = await Round1Question.findById(questionId);
    if (!question) return res.status(404).json({ msg: "Question not found" });

    // Check if correct (case-insensitive)
    const isCorrect = question.correctAnswer.trim().toLowerCase() === submittedAnswer.trim().toLowerCase();

    // Create submission record
    const submission = new Round1Submission({
      teamId: team._id,
      questionId,
      submittedAnswer,
      isCorrect,
      timeTaken: timeTaken || 0
    });
    await submission.save();

    // Update score if correct
    if (isCorrect) {
      const points = 10; // base points per question
      team.round1.score = (team.round1.score || 0) + points;
      team.totalScore = (team.totalScore || 0) + points;
      await team.save();
      await syncLeaderboard(team._id);
    }

    res.json({
      msg: isCorrect ? "Correct answer!" : "Wrong answer",
      isCorrect,
      submission: submission._id,
      round1Score: team.round1.score,
      totalScore: team.totalScore
    });
  } catch (err) {
    res.status(500).json({ msg: "Error submitting round 1 answer", error: err.message });
  }
};

/**
 * Round 2 session initialization.
 * Maps team's selectedScrolls (algorithm card IDs) to Round 2 problems.
 * Sets problemsStatus with initial lives based on ship type.
 */
export const round2Answers = async (req, res) => {
  try {
    const team = await Team.findById(req.team._id);
    if (!team) return res.status(404).json({ msg: "Team not found" });

    const selectedScrolls = team.round1.selectedScrolls;
    if (!selectedScrolls || selectedScrolls.length === 0) {
      return res.status(400).json({ msg: "No scrolls selected in Round 1" });
    }

    // Enforce exactly 3 distinct scrolls
    const uniqueScrolls = [...new Set(selectedScrolls.map(String))];
    if (uniqueScrolls.length !== 3) {
      return res.status(400).json({ msg: "Exactly 3 distinct scrolls are required" });
    }

    // Get ship lives
    const shipConfig = getShipConfig(team.shipConfig);
    const lives = shipConfig ? shipConfig.round2Lives : 3;

    // Map each scroll to a Round 2 problem
    const problemsStatus = [];
    for (const scrollId of uniqueScrolls) {
      const problem = await Round2Question.findOne({
        allowedAlgorithms: scrollId
      });

      if (!problem) {
        return res.status(400).json({
          msg: `No Round 2 problem found for scroll (algorithm card) ${scrollId}`
        });
      }

      problemsStatus.push({
        problemId: problem._id,
        livesLeft: lives,
        wrongSubmissions: 0,
        status: "NOT_STARTED"
      });
    }

    team.round2.problemsStatus = problemsStatus;
    await team.save();

    res.json({
      msg: "Round 2 initialized",
      problemsStatus: team.round2.problemsStatus
    });
  } catch (err) {
    res.status(500).json({ msg: "Error initializing Round 2", error: err.message });
  }
};

/**
 * Get team profile by ID.
 */
export const getProfile = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .select("-otp -otpExpiry");
    if (!team) return res.status(404).json({ msg: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching profile", error: err.message });
  }
};

/**
 * Get team progress by ID (rounds, scores, problem statuses).
 */
export const getProgress = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .select("teamName shipConfig round1 round2 totalScore currentIsland");
    if (!team) return res.status(404).json({ msg: "Team not found" });

    const shipConfig = getShipConfig(team.shipConfig);
    res.json({
      teamName: team.teamName,
      shipConfig: team.shipConfig,
      shipDetails: shipConfig,
      round1: team.round1,
      round2: team.round2,
      totalScore: team.totalScore,
      currentIsland: team.currentIsland
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching progress", error: err.message });
  }
};

/**
 * Delete a Round 1 answer by submission ID.
 */
export const deleteRound1Answer = async (req, res) => {
  try {
    const submission = await Round1Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ msg: "Submission not found" });
    res.json({ msg: "Round 1 answer deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting answer", error: err.message });
  }
};

/**
 * Delete a Round 2 answer by submission ID.
 */
export const deleteRound2Answer = async (req, res) => {
  try {
    const submission = await Round2Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ msg: "Submission not found" });
    res.json({ msg: "Round 2 answer deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting answer", error: err.message });
  }
};

/**
 * Update an answer (Round 1 or Round 2) by submission ID.
 */
export const updateAnswer = async (req, res) => {
  try {
    // Try Round 1 first
    let submission = await Round1Submission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (submission) return res.json(submission);

    // Try Round 2
    submission = await Round2Submission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (submission) return res.json(submission);

    return res.status(404).json({ msg: "Answer not found" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating answer", error: err.message });
  }
};

export const selectActionCards = async (req, res) => {
  try {
    const { cardIds } = req.body;

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ msg: "cardIds array is required" });
    }

    if (cardIds.length > 4) {
      return res.status(400).json({ msg: "You can select at most 4 action cards" });
    }

    const uniqueIds = [...new Set(cardIds.map(String))];
    if (uniqueIds.length !== cardIds.length) {
      return res.status(400).json({ msg: "Duplicate cardIds are not allowed" });
    }

    const cards = await ActionCard.find({ _id: { $in: cardIds } });
    if (cards.length !== cardIds.length) {
      return res.status(400).json({ msg: "One or more action cards not found" });
    }

    const team = await Team.findById(req.team._id);
    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    team.round2.actionCardsUsed = cards.map((card) => ({
      cardId: card._id,
      effectType: card.effectType,
      effectValue: card.effectValue,
      usedAt: null
    }));
    team.round2.totalCardsUsed = 0;

    await team.save();

    res.json({
      msg: "Action cards selected successfully",
      round2: team.round2
    });
  } catch (err) {
    res.status(500).json({ msg: "Error selecting action cards", error: err.message });
  }
};

export const useActionCard = async (req, res) => {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ msg: "cardId is required" });
    }

    const team = await Team.findById(req.team._id);
    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    if (!team.round2 || !Array.isArray(team.round2.actionCardsUsed)) {
      return res.status(400).json({ msg: "No action cards selected for this team" });
    }

    if (team.round2.totalCardsUsed >= 4) {
      return res.status(400).json({ msg: "Maximum of 4 action cards can be used" });
    }

    const cardEntry = team.round2.actionCardsUsed.find(
      (entry) => entry.cardId.toString() === String(cardId)
    );

    if (!cardEntry) {
      return res.status(400).json({ msg: "This card is not in your selected action cards list" });
    }

    if (cardEntry.usedAt) {
      return res.status(400).json({ msg: "This card has already been used" });
    }

    cardEntry.usedAt = new Date();
    team.round2.totalCardsUsed += 1;

    // Load the full ActionCard document so we know which card/number it is
    const actionCard = await ActionCard.findById(cardEntry.cardId);
    const effectResult = actionCard
      ? applyActionCardEffect(actionCard, { team })
      : { code: "UNKNOWN_CARD", message: "Card not found when applying effect." };

    await team.save();

    res.json({
      msg: "Action card used successfully",
      effect: effectResult,
      round2: team.round2,
      totalScore: team.totalScore
    });
  } catch (err) {
    res.status(500).json({ msg: "Error using action card", error: err.message });
  }
};
