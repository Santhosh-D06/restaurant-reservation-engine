const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/reservationController');

router.use(protect);

router.post('/', [
  body('restaurant').isMongoId().withMessage('Valid restaurant id is required'),
  body('table').isMongoId().withMessage('Valid table id is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('timeSlot').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('timeSlot must be HH:MM'),
  body('guests').isInt({ min: 1 }).withMessage('guests must be at least 1'),
], validate, c.create);

router.get('/my', c.mine);                                   // must stay above '/:id'
router.get('/', authorize('admin'), c.listAll);
router.get('/:id', c.getOne);
router.put('/:id', [
  body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('timeSlot').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('timeSlot must be HH:MM'),
  body('guests').optional().isInt({ min: 1 }).withMessage('guests must be at least 1'),
  body('table').optional().isMongoId().withMessage('Valid table id is required'),
], validate, c.modify);
router.patch('/:id/cancel', c.cancel);
router.patch('/:id/status', authorize('admin'), [
  body('status').isIn(['confirmed', 'cancelled']).withMessage('status must be confirmed or cancelled'),
], validate, c.setStatus);

module.exports = router;
