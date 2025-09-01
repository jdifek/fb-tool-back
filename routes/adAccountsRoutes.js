const router = require('express').Router();
const controller = require('../controllers/adAccountsController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /ad-accounts:
 *   post:
 *     summary: Create a new ad account
 *     tags: [AdAccounts]
 */
router.post('/', authMiddleware, controller.createAdAccount);
/**
 * @swagger
 * tags:
 *   name: AdAccounts
 *   description: Facebook Ad Accounts management
 */

/**
 * @swagger
 * /ad-accounts/{id}:
 *   patch:
 *     summary: Update ad account info
 *     tags: [AdAccounts]
 */
router.patch('/:id', authMiddleware, controller.updateAdAccount);

/**
 * @swagger
 * /ad-accounts/{id}/auto-commenting:
 *   patch:
 *     summary: Toggle auto-commenting
 *     tags: [AdAccounts]
 */
router.patch('/:id/auto-commenting', authMiddleware, controller.toggleAutoCommenting);

/**
 * @swagger
 * /ad-accounts/bulk:
 *   patch:
 *     summary: Bulk update ad accounts
 *     tags: [AdAccounts]
 */
router.patch('/bulk', authMiddleware, controller.bulkUpdate);
/**
 * @swagger
 * /ad-accounts:
 *   get:
 *     summary: Get all ad accounts (filtered by role)
 *     tags: [AdAccounts]
 */
router.get('/', authMiddleware, controller.getAdAccounts);

/**
 * @swagger
 * /ad-accounts/{id}:
 *   delete:
 *     summary: Delete an ad account
 *     tags: [AdAccounts]
 */
router.delete('/:id', authMiddleware, controller.deleteAdAccount);

module.exports = router;
