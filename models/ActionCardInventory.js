import mongoose from "mongoose";

const actionCardInventorySchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },
        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ActionCard",
            required: true
        },
        isUsed: {
            type: Boolean,
            default: false
        },
        acquiredAt: {
            type: Date,
            default: Date.now
        },
        usedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("ActionCardInventory", actionCardInventorySchema);
