import Leaderboard from "../models/leaderboard.js";
import Team from "../models/Team.js";
import { getShipConfig } from "../config/shipConfig.js";

/**
 * Calculate the final score for a problem based on ship type.
 * @param {number} baseScore - Raw score before multiplier
 * @param {string} shipType - "WARSHIP" | "MERCHANT" | "GHOST"
 * @returns {number} Final score after applying ship multiplier
 */
export function calculateScore(baseScore, shipType) {
    const config = getShipConfig(shipType);
    if (!config) return baseScore;
    return Math.round(baseScore * config.multiplier);
}

/**
 * Sync leaderboard entry for a specific team.
 * Upserts the leaderboard document and recalculates all ranks.
 * @param {string} teamId - The team's ObjectId
 */
export async function syncLeaderboard(teamId) {
    const team = await Team.findById(teamId);
    if (!team) return;

    // Upsert leaderboard entry for this team
    await Leaderboard.findOneAndUpdate(
        { teamId: team._id },
        {
            teamId: team._id,
            teamName: team.teamName,
            round1Score: team.round1?.score || 0,
            round2Score: team.round2?.score || 0,
            totalScore: team.totalScore || 0
        },
        { upsert: true, new: true }
    );

    // Recalculate ranks for all teams (sorted by totalScore descending)
    const allEntries = await Leaderboard.find().sort({ totalScore: -1 });
    for (let i = 0; i < allEntries.length; i++) {
        allEntries[i].rank = i + 1;
        await allEntries[i].save();
    }
}
