// backend/controllers/paperController.js
const db = require('../config/db');

const generatePaper = async (req, res) => {
    try {
        const { totalMarks, topics, difficultyDistribution } = req.body;

        if (!totalMarks || totalMarks <= 0) {
            return res.status(400).json({ message: 'totalMarks must be > 0' });
        }

        const allowedDifficulties = ['easy', 'medium', 'hard'];

        const dist = difficultyDistribution || { easy: 0.3, medium: 0.5, hard: 0.2 };

        const sumDist = (dist.easy || 0) + (dist.medium || 0) + (dist.hard || 0);
        const norm = sumDist === 0 ? 1 : sumDist;

        const targetMarks = {
            easy: Math.round((dist.easy || 0) / norm * totalMarks),
            medium: Math.round((dist.medium || 0) / norm * totalMarks),
            hard: Math.round((dist.hard || 0) / norm * totalMarks),
        };

        let baseSql = 'SELECT * FROM questions WHERE 1=1';
        const baseParams = [];

        if (topics && Array.isArray(topics) && topics.length > 0) {
            const placeholders = topics.map(() => '?').join(', ');
            baseSql += ` AND topic IN (${placeholders})`;
            baseParams.push(...topics);
        }

        const fetchByDifficulty = async (difficulty) => {
            let sql = baseSql + ' AND difficulty = ? ORDER BY RANDOM()';
            const params = [...baseParams, difficulty];
            const result = await db.query(sql, params);
            return result.rows;
        };

        const selectedQuestions = [];
        let totalSelectedMarks = 0;

        for (const difficulty of allowedDifficulties) {
            const desiredMarks = targetMarks[difficulty] || 0;
            if (desiredMarks <= 0) continue;

            const candidates = await fetchByDifficulty(difficulty);
            let currentMarks = 0;

            for (const q of candidates) {
                if (currentMarks >= desiredMarks) break;
                selectedQuestions.push(q);
                currentMarks += q.marks;
                totalSelectedMarks += q.marks;
            }
        }

        if (totalSelectedMarks < totalMarks) {
            let fillSql = baseSql + ' ORDER BY RANDOM()';
            const result = await db.query(fillSql, baseParams);
            const remaining = result.rows;

            for (const q of remaining) {
                if (selectedQuestions.find((s) => s.id === q.id)) continue;
                if (totalSelectedMarks >= totalMarks) break;
                selectedQuestions.push(q);
                totalSelectedMarks += q.marks;
            }
        }

        if (selectedQuestions.length === 0) {
            return res.status(400).json({ message: 'Not enough questions in the bank to generate a paper' });
        }

        return res.json({
            totalMarksRequested: totalMarks,
            totalMarksSelected: totalSelectedMarks,
            difficultyDistributionUsed: targetMarks,
            questionCount: selectedQuestions.length,
            questions: selectedQuestions,
        });
    } catch (error) {
        console.error('Generate paper error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { generatePaper };
