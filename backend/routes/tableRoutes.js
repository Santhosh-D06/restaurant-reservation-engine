const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/tableController');

router.use(protect, authorize('admin'));

router.post('/', [
  body('restaurant').isMongoId().withMessage('Valid restaurant id is required'),
  body('tableNumber').trim().notEmpty().withMessage('Table number is required'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacity must be 1-20'),
], validate, c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
