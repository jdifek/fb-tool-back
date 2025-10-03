const router = require('express').Router();
const proxyController = require('../controllers/proxyController');
const authMiddleware = require('../middlewares/authMiddleware');
/**
 * @swagger
 * components:
 *   schemas:
 *     Proxy:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         ip:
 *           type: string
 *         port:
 *           type: integer
 *         username:
 *           type: string
 *           nullable: true
 *         password:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [ACTIVE, DEAD]
 *         facebookAccountId:
 *           type: integer
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         facebookAccount:
 *           $ref: '#/components/schemas/FacebookAccount'
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
 *             required:
 *               - ip
 *               - port
 *             properties:
 *               ip:
 *                 type: string
 *                 example: "192.168.1.1"
 *               port:
 *                 type: integer
 *                 example: 8080
 *               username:
 *                 type: string
 *                 example: "proxyuser"
 *               password:
 *                 type: string
 *                 example: "proxypass"
 *     responses:
 *       200:
 *         description: Proxy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proxy'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proxy'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

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
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proxy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facebookAccountId
 *             properties:
 *               facebookAccountId:
 *                 type: integer
 *                 example: 1
 *                 description: Facebook account ID to link to
 *     responses:
 *       200:
 *         description: Proxy linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proxy'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Proxy not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /proxies/{id}:
 *   put:
 *     summary: Update proxy data
 *     tags: [Proxies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proxy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip:
 *                 type: string
 *                 example: "192.168.1.2"
 *               port:
 *                 type: integer
 *                 example: 8080
 *               username:
 *                 type: string
 *                 example: "newuser"
 *               password:
 *                 type: string
 *                 example: "newpass"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DEAD]
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Proxy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proxy'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Proxy not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /proxies/{id}:
 *   delete:
 *     summary: Delete proxy
 *     tags: [Proxies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Proxy ID
 *     responses:
 *       200:
 *         description: Proxy deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Proxy deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Proxy not found
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, proxyController.addProxy);


router.get('/', authMiddleware, proxyController.getProxies);

router.patch('/:id/link', authMiddleware, proxyController.linkProxy);

router.put('/:id', authMiddleware, proxyController.updateProxy);

router.delete('/:id', authMiddleware, proxyController.deleteProxy);

module.exports = router;
