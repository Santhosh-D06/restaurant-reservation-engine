const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/menuController');

router.use(protect, authorize('admin'));

router.post('/', [
  body('restaurant').isMongoId().withMessage('Valid restaurant id is required'),
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
], validate, c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
