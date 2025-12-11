// backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createQuestion, getQuestions, updateQuestion, deleteQuestion } = require('../controllers/questionController');

router.use(authMiddleware);

router.post('/', createQuestion);
router.get('/', getQuestions);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
