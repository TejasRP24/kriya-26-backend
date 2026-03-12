import ActionCard from "../models/actionCard.model.js";
import ActionCardInventory from "../models/ActionCardInventory.js";
import ActiveEffect from "../models/ActiveEffect.js";
import Team from "../models/Team.js";
import Round2Question from "../models/round2questions.js";
import AlgorithmCard from "../models/AlgorithmCard.js";

/**
 * GET /actionCards
 * Return all card definitions.
 */
export const getActionCards = async (req, res) => {
    try {
        const cards = await ActionCard.find().sort({ cardNumber: 1 });
        res.json(cards);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching action cards", error: err.message });
    }
};

/**
 * GET /players/:playerId/cards
 * Return cards owned by the player.
 */
export const getPlayerCards = async (req, res) => {
    try {
        const { kriyaID } = req.params;
        const team = await Team.findOne({ kriyaID });
        if (!team) return res.status(404).json({ msg: "Invalid player" });

        const inventory = await ActionCardInventory.find({ teamId: team._id, isUsed: false })
            .populate("cardId");
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching player inventory", error: err.message });
    }
};

/**
 * POST /players/:playerId/cards/:cardId/use
 * Activate the card.
 */
export const activateCard = async (req, res) => {
    try {
        const { kriyaID, cardId } = req.params;

        const team = await Team.findOne({ kriyaID });
        if (!team) return res.status(404).json({ msg: "Invalid player" });

        // 1. Check if card exists in inventory and is not used
        const inventoryItem = await ActionCardInventory.findOne({
            teamId: team._id,
            cardId: cardId,
            isUsed: false
        }).populate("cardId");

        if (!inventoryItem) {
            return res.status(404).json({ msg: "Card not owned by player or already used" });
        }

        const card = inventoryItem.cardId;
        let effectMessage = "";
        let data = {};

        // Ensure ActiveEffect document exists for the team
        let activeEffect = await ActiveEffect.findOne({ teamId: team._id });
        if (!activeEffect) {
            activeEffect = new ActiveEffect({ teamId: team._id });
        }

        // 2. Apply corresponding effect
        switch (card.cardNumber) {
            case 1: // Black Pearl’s Resurgence: Gain 2 extra lives
                if (team.round2 && Array.isArray(team.round2.problemsStatus)) {
                    team.round2.problemsStatus.forEach(p => {
                        p.livesLeft += 2;
                    });
                    await team.save();
                    effectMessage = "Added 2 extra lives to all assigned questions.";
                } else {
                    return res.status(400).json({ msg: "Round 2 not initialized for this team" });
                }
                break;

            case 2: // Davy Jones’ Mercy: Ignore 1 failed testcase
                activeEffect.ignoreTestcase = true;
                effectMessage = "One failed testcase will be ignored for the next submission.";
                break;

            case 3: // Isla de Muerta Treasure: +10 bonus points if next solved
                activeEffect.bonusPointsNextSuccess = true;
                effectMessage = "+10 bonus points will be added if the next question is solved successfully.";
                break;

            case 4: // Captain’s Hidden Map: Gives a hint
                // Logic: Find the current active question and return its hint (if any)
                // For now, we'll assume the request is made during a question.
                // We'll mark it as hint available or return it immediately if problemId provided.
                const activeProblem = team.round2.problemsStatus.find(p => p.status === "ACTIVE");
                if (activeProblem) {
                    const problem = await Round2Question.findById(activeProblem.problemId);
                    data.hint = problem.description; // Returning description as "hint" for now
                    effectMessage = "Hint retrieved from the current question.";
                } else {
                    effectMessage = "Captain's Map activated. Hint will be revealed for the next active question.";
                }
                break;

            case 5: // Chest of Cortés: Double mini-game reward + 5 bonus points
                activeEffect.doubleMiniGameReward = true;
                activeEffect.bonusPointsMiniGame = 5;
                effectMessage = "Next mini-game reward will be doubled and +5 bonus points will be added.";
                break;

            case 6: // Turn the Tide: Swap current question
                const problemToSwap = team.round2.problemsStatus.find(p => p.status === "ACTIVE" || p.status === "NOT_STARTED");
                if (problemToSwap) {
                    const oldProblem = await Round2Question.findById(problemToSwap.problemId).populate("allowedAlgorithms");
                    if (oldProblem && oldProblem.allowedAlgorithms && oldProblem.allowedAlgorithms.length > 0) {
                        const algorithmId = oldProblem.allowedAlgorithms[0]._id;
                        // Find another question with same algorithm/difficulty
                        const newProblem = await Round2Question.findOne({
                            allowedAlgorithms: algorithmId,
                            _id: { $ne: oldProblem._id }
                        });

                        if (newProblem) {
                            problemToSwap.problemId = newProblem._id;
                            await team.save();
                            effectMessage = "Current question swapped with another of the same difficulty.";
                            data.newQuestionId = newProblem._id;
                        } else {
                            return res.status(400).json({ msg: "No alternative question found for this difficulty" });
                        }
                    }
                } else {
                    return res.status(400).json({ msg: "No question available to swap" });
                }
                break;

            case 7: // Anchor Drop: Lock difficulty progression
                activeEffect.freezeDifficulty = true;
                effectMessage = "Difficulty progression locked for the next question.";
                break;

            case 8: // Spyglass Focus: Reveal failed testcase index
                activeEffect.revealFailedTestcase = true;
                effectMessage = "If the next submission fails, the specific failed testcase index will be revealed.";
                break;

            default:
                return res.status(400).json({ msg: "Unknown action card effect" });
        }

        // 3. Update Inventory (Consume card)
        inventoryItem.isUsed = true;
        inventoryItem.usedAt = new Date();
        await inventoryItem.save();

        // 4. Save Active Effects
        await activeEffect.save();

        res.json({
            msg: "Card activated successfully",
            effect: effectMessage,
            card: card.name,
            ...data
        });

    } catch (err) {
        res.status(500).json({ msg: "Error activating card", error: err.message });
    }
};
