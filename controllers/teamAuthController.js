import Team from "../models/Team.js";
import jwt from "jsonwebtoken";

/**
 * Team login via kriyaId.
 * Issues a JWT with { id, kriyaID, role: "team" }.
 */
export const login = async (req, res) => {
    try {
        const { kriyaId } = req.body;
        if (!kriyaId) {
            return res.status(400).json({ msg: "kriyaId is required" });
        }

        const team = await Team.findOne({ kriyaID: kriyaId });
        if (!team) {
            return res.status(404).json({ msg: "Team not found" });
        }

        const token = jwt.sign(
            { id: team._id, kriyaID: team.kriyaID, role: "team" },
            process.env.JWT_SECRET,
            { expiresIn: "6h" }
        );

        res.json({
            msg: "Login successful",
            token,
            team: {
                id: team._id,
                kriyaID: team.kriyaID,
                teamName: team.teamName,
                shipConfig: team.shipConfig
            }
        });
    } catch (err) {
        res.status(500).json({ msg: "Error logging in", error: err.message });
    }
};

/**
 * Team logout (stateless — just returns success).
 */
export const logout = async (_req, res) => {
    res.json({ msg: "Team logged out successfully" });
};
