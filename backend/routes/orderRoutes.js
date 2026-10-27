const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/orderController');

router.use(protect);

router.post('/', authorize('customer'), [
  body('restaurant').isMongoId().withMessage('Valid restaurant id is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.menuItem').isMongoId().withMessage('Valid menu item id is required'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be 1-20'),
  body('orderType').optional().isIn(['pickup', 'delivery']).withMessage('orderType must be pickup or delivery'),
], validate, c.create);

router.get('/my', c.mine);                                   // must stay above '/:id'
router.get('/', authorize('admin'), c.listAll);
router.get('/:id', c.getOne);
router.patch('/:id/cancel', authorize('customer'), c.cancel);
router.patch('/:id/status', authorize('admin'), [
  body('status').isIn(['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Invalid status'),
], validate, c.setStatus);

module.exports = router;
