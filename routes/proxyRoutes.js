const router = require('express').Router();
const controller = require('../controllers/proxyController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, controller.addProxy);
router.get('/', authMiddleware, controller.getProxies);
router.get('/:id/check', authMiddleware, controller.checkProxy);

module.exports = router;
