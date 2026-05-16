import Progress from "../models/Progress.js";

// GET /api/progress/stats
export const getUserStats = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      return res.json({
        totalSessions: 0,
        avgScore: 0,
        bestScore: 0,
        recentSessions: [],
      });
    }

    res.json({
      totalSessions: progress.totalSessions,
      avgScore: progress.avgScore,
      bestScore: progress.bestScore,
      recentSessions: progress.recentSessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};