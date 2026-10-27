const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/restaurantController');

const rules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('cuisine').trim().notEmpty().withMessage('Cuisine is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
];

router.get('/', c.list);
router.get('/:id', c.getOne);
router.get('/:id/menu', c.menu);
router.get('/:id/tables', c.tables);
router.get('/:id/availability', c.availability);

router.post('/', protect, authorize('admin'), rules, validate, c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
