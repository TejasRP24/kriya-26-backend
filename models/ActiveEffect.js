import mongoose from "mongoose";

const activeEffectSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            unique: true
        },
        // Card 2: Davy Jones’ Mercy
        ignoreTestcase: {
            type: Boolean,
            default: false
        },
        // Card 3: Isla de Muerta Treasure
        bonusPointsNextSuccess: {
            type: Boolean,
            default: false
        },
        // Card 5: Chest of Cortés
        doubleMiniGameReward: {
            type: Boolean,
            default: false
        },
        bonusPointsMiniGame: {
            type: Number,
            default: 0
        },
        // Card 7: Anchor Drop
        freezeDifficulty: {
            type: Boolean,
            default: false
        },
        // Card 8: Spyglass Focus
        revealFailedTestcase: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("ActiveEffect", activeEffectSchema);
