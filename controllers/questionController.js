// backend/controllers/questionController.js
const db = require('../config/db');

const createQuestion = async (req, res) => {
    try {
        const { question_text, topic, difficulty, marks } = req.body;
        const userId = req.user.userId;

        if (!question_text || !topic || !difficulty || !marks) {
            return res.status(400).json({ message: 'question_text, topic, difficulty, and marks are required' });
        }

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ message: 'Invalid difficulty level' });
        }

        const result = await db.query(
            'INSERT INTO questions (question_text, topic, difficulty, marks, created_by) VALUES (?, ?, ?, ?, ?)',
            [question_text, topic, difficulty, marks, userId]
        );

        const inserted = await db.query('SELECT * FROM questions WHERE id = ?', [result.lastID]);

        res.status(201).json(inserted.rows[0]);
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getQuestions = async (req, res) => {
    try {
        const { topic, difficulty, minMarks, maxMarks } = req.query;
        let sql = 'SELECT * FROM questions WHERE 1=1';
        const params = [];

        if (topic) {
            sql += ' AND topic = ?';
            params.push(topic);
        }

        if (difficulty) {
            sql += ' AND difficulty = ?';
            params.push(difficulty);
        }

        if (minMarks) {
            sql += ' AND marks >= ?';
            params.push(Number(minMarks));
        }

        if (maxMarks) {
            sql += ' AND marks <= ?';
            params.push(Number(maxMarks));
        }

        sql += ' ORDER BY created_at DESC';

        const result = await db.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { question_text, topic, difficulty, marks } = req.body;

        const fields = [];
        const params = [];

        if (question_text !== undefined) { fields.push('question_text = ?'); params.push(question_text); }
        if (topic !== undefined) { fields.push('topic = ?'); params.push(topic); }
        if (difficulty !== undefined) {
            if (!['easy', 'medium', 'hard'].includes(difficulty)) {
                return res.status(400).json({ message: 'Invalid difficulty level' });
            }
            fields.push('difficulty = ?'); params.push(difficulty);
        }
        if (marks !== undefined) { fields.push('marks = ?'); params.push(marks); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nothing to update' });
        }

        params.push(questionId);

        const sql = `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`;
        const result = await db.query(sql, params);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const updated = await db.query('SELECT * FROM questions WHERE id = ?', [questionId]);

        res.json(updated.rows[0]);
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;

        const result = await db.query('DELETE FROM questions WHERE id = ?', [questionId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createQuestion, getQuestions, updateQuestion, deleteQuestion };
