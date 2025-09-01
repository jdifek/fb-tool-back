const router = require('express').Router();
const controller = require('../controllers/facebookAccountsController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     FacebookAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         name:
 *           type: string
 *         fbUserId:
 *           type: string
 *         accessToken:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, CHECKPOINT, BANNED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         adAccounts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdAccount'
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Add Facebook account via access token
 *     tags: [FacebookAccounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Facebook access token
 *     responses:
 *       201:
 *         description: Facebook account added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FacebookAccount'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all user Facebook accounts
 *     tags: [FacebookAccounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Facebook accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FacebookAccount'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update Facebook account
 *     tags: [FacebookAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facebook account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               accessToken:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, CHECKPOINT, BANNED]
 *     responses:
 *       200:
 *         description: Facebook account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FacebookAccount'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accounts/{id}:
 *   patch:
 *     summary: Partially update Facebook account
 *     tags: [FacebookAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facebook account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               accessToken:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, CHECKPOINT, BANNED]
 *     responses:
 *       200:
 *         description: Facebook account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FacebookAccount'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete Facebook account
 *     tags: [FacebookAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facebook account ID
 *     responses:
 *       200:
 *         description: Facebook account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted"
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accounts/{id}/ad-accounts:
 *   get:
 *     summary: Get all ad accounts linked to FB account
 *     tags: [FacebookAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Facebook account ID
 *     responses:
 *       200:
 *         description: List of ad accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdAccount'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, controller.addAccount);

router.get('/', authMiddleware, controller.getAccounts);

router.put('/:id', authMiddleware, controller.updateAccount);


router.patch('/:id', authMiddleware, controller.patchAccount);


router.delete('/:id', authMiddleware, controller.deleteAccount);


router.get('/:id/ad-accounts', authMiddleware, controller.getAdAccounts);



module.exports = router;
