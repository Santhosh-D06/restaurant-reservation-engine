const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/stats', c.stats);
router.get('/customers', c.customers);

module.exports = router;
