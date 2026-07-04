const express = require('express');
const {
  getRoles,
  startInterview,
  submitAnswer,
  getInterview,
  getIdealAnswerForQuestion,
  getUserInterviews,
  getUserStats,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All interview routes are protected and require a valid token.
router.use(protect);

router.get('/roles', getRoles);
router.get('/stats', getUserStats);
router.get('/history', getUserInterviews);
router.post('/start', startInterview);
router.get('/:id', getInterview);
router.post('/:id/answer', submitAnswer);
router.get('/:id/question/:questionIndex/ideal-answer', getIdealAnswerForQuestion);

module.exports = router;
