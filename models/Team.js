import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  kriyaID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  captainName: {
    type: String,
    required: true,
    trim: true
  },
  regMail: {
    type: String,
    required: true,
    unique: true
  },
  shipConfig: {
    type: String,
    enum: ["WARSHIP", "MERCHANT", "GHOST"],
    required: true,
    trim: true
  },
  round1: {
    selectedScrolls: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Problem" }
    ],
    score: { type: Number, default: 0 }
  },
  round2: {
    score: { type: Number, default: 0 },
    problemsStatus: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Round2Question" },
        livesLeft: { type: Number, default: 3 },
        wrongSubmissions: { type: Number, default: 0 },
        startTime: { type: Date, default: null },
        status: {
          type: String,
          enum: ["NOT_STARTED", "ACTIVE", "SOLVED", "SUNK"],
          default: "NOT_STARTED"
        }
      }
    ],
    // Action card usage + effect flags for Round 2
    actionCardsUsed: [
      {
        cardId: { type: mongoose.Schema.Types.ObjectId, ref: "ActionCard" },
        effectType: { type: String },
        effectValue: { type: Number },
        usedAt: { type: Date }
      }
    ],
    totalCardsUsed: { type: Number, default: 0 },
    // Card 2: ignore one failed testcase on next submission
    ignoreNextFailedTestcase: { type: Boolean, default: false },
    // Card 4: a hint is available for the current problem
    hasHintAvailable: { type: Boolean, default: false },
    // Card 5: next mini‑game reward will be doubled
    doubleNextMiniGameReward: { type: Boolean, default: false },
    // Card 6: swap current question for a new one on next attempt
    swapCurrentQuestionOnNextAttempt: { type: Boolean, default: false },
    // Card 7: prevent difficulty increase for the next question
    freezeDifficultyNextQuestion: { type: Boolean, default: false },
    // Card 8: reveal which testcase failed on the next run
    revealFailedTestcaseNextRun: { type: Boolean, default: false }
  },
  totalScore: { type: Number, default: 0 },
  currentIsland: {
    type: String,
    enum: ["ISLAND1", "ISLAND2", "ISLAND3"],
    default: "ISLAND1"
  },
  isEliminated: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);
