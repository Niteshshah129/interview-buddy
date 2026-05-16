
import Interview from "../models/Interview.js";
import Progress from "../models/Progress.js";

export const saveInterview = async (req, res) => {
  try {
    const {
      company, branch, answers, score, totalQuestions, answeredQuestions, feedback, duration,
    } = req.body;

    const processedAnswers =
      answers?.map((a) => ({
        ...a,
        questionId: String(a.questionId || ""),
      })) || [];

    const interview = await Interview.create({
      user: req.user._id,
      company,
      branch,
      answers: processedAnswers,
      score,
      totalQuestions,
      answeredQuestions,
      feedback,
      duration,
    });

    let progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        totalSessions: 1,
        totalScore: score,
        bestScore: score,
        avgScore: score,
        recentSessions: [
          {
            company,
            branch,
            score,
            date: new Date(),
          },
        ],
      });
    } else {
      progress.totalSessions += 1;
      progress.totalScore += score;
      progress.avgScore = Math.round(
        progress.totalScore / progress.totalSessions
      );

      if (score > progress.bestScore) {
        progress.bestScore = score;
      }

      progress.recentSessions.unshift({
        company,
        branch,
        score,
        date: new Date(),
      });

      if (progress.recentSessions.length > 10) {
        progress.recentSessions.pop();
      }

      await progress.save();
    }

    res.status(201).json({
      message: "Interview saved!",
      interview,
    });
  } catch (error) {
    console.log("Save interview error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await interview.deleteOne();

    const allInterviews = await Interview.find({ user: req.user._id });
    let progress = await Progress.findOne({ user: req.user._id });

    if (progress) {
      if (allInterviews.length === 0) {
        progress.totalSessions = 0;
        progress.totalScore = 0;
        progress.avgScore = 0;
        progress.bestScore = 0;
        progress.recentSessions = [];
      } else {
        const totalScore = allInterviews.reduce((sum, i) => sum + i.score, 0);
        progress.totalSessions = allInterviews.length;
        progress.totalScore = totalScore;
        progress.avgScore = Math.round(totalScore / allInterviews.length);
        progress.bestScore = Math.max(...allInterviews.map(i => i.score));
        progress.recentSessions = allInterviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
          .map(i => ({ company: i.company, branch: i.branch, score: i.score, date: i.createdAt }));
      }
      await progress.save();
    }

    res.json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.log("Delete interview error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET /api/interview/detail/:id
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};