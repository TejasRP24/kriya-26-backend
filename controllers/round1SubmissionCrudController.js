import Round1Submission from "../models/round1submission.js";

/**
 * Create a new Round 1 submission.
 */
export const createSubmission = async (req, res) => {
    try {
        const { teamId, questionId, submittedAnswer, isCorrect, timeTaken } = req.body;

        if (!teamId || !questionId || submittedAnswer === undefined) {
            return res.status(400).json({ msg: "teamId, questionId, and submittedAnswer are required" });
        }

        const submission = new Round1Submission({
            teamId,
            questionId,
            submittedAnswer,
            isCorrect: isCorrect || false,
            timeTaken: timeTaken || 0
        });
        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        res.status(400).json({ msg: "Error creating submission", error: err.message });
    }
};

/**
 * Get all submissions for a specific team.
 */
export const getByTeam = async (req, res) => {
    try {
        const submissions = await Round1Submission.find({ teamId: req.params.id })
            .populate("questionId");
        res.json(submissions);
    } catch (err) {
        res.status(400).json({ msg: "Error fetching submissions", error: err.message });
    }
};

/**
 * Get all submissions for a specific question.
 */
export const getByQuestion = async (req, res) => {
    try {
        const submissions = await Round1Submission.find({ questionId: req.params.id })
            .populate("teamId");
        res.json(submissions);
    } catch (err) {
        res.status(400).json({ msg: "Error fetching submissions", error: err.message });
    }
};

/**
 * Update a submission by ID.
 */
export const updateSubmission = async (req, res) => {
    try {
        const submission = await Round1Submission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!submission) return res.status(404).json({ msg: "Submission not found" });
        res.json(submission);
    } catch (err) {
        res.status(400).json({ msg: "Error updating submission", error: err.message });
    }
};

/**
 * Delete a submission by ID.
 */
export const deleteSubmission = async (req, res) => {
    try {
        const submission = await Round1Submission.findByIdAndDelete(req.params.id);
        if (!submission) return res.status(404).json({ msg: "Submission not found" });
        res.json({ msg: "Submission deleted" });
    } catch (err) {
        res.status(400).json({ msg: "Error deleting submission", error: err.message });
    }
};
