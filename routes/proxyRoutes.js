const router = require('express').Router();
const proxyController = require('../controllers/proxyController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Proxies
 *   description: Proxy management
 */

/**
 * @swagger
 * /proxies:
 *   post:
 *     summary: Create a proxy (without linking to Facebook account)
 *     tags: [Proxies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip:
 *                 type: string
 *               port:
 *                 type: integer
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proxy created successfully
 */
router.post('/', authMiddleware, proxyController.addProxy);

/**
 * @swagger
 * /proxies:
 *   get:
 *     summary: Get all proxies
 *     tags: [Proxies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of proxies
 */
router.get('/', authMiddleware, proxyController.getProxies);

/**
 * @swagger
 * /proxies/{id}/link:
 *   patch:
 *     summary: Link a proxy to a Facebook account
 *     tags: [Proxies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facebookAccountId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Proxy linked successfully
 */
router.patch('/:id/link', authMiddleware, proxyController.linkProxy);

module.exports = router;
