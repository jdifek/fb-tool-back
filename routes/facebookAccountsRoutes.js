const router = require('express').Router();
const controller = require('../controllers/facebookAccountsController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: FacebookAccounts
 *   description: Facebook Accounts Management
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Add Facebook account via access token
 *     tags: [FacebookAccounts]
 */
router.post('/', authMiddleware, controller.addAccount);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all user Facebook accounts
 *     tags: [FacebookAccounts]
 */
router.get('/', authMiddleware, controller.getAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update Facebook account
 *     tags: [FacebookAccounts]
 */
router.put('/:id', authMiddleware, controller.updateAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   patch:
 *     summary: Partially update Facebook account
 *     tags: [FacebookAccounts]
 */
router.patch('/:id', authMiddleware, controller.patchAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete Facebook account
 *     tags: [FacebookAccounts]
 */
router.delete('/:id', authMiddleware, controller.deleteAccount);

/**
 * @swagger
 * /accounts/{id}/ad-accounts:
 *   get:
 *     summary: Get all ad accounts linked to FB account
 *     tags: [FacebookAccounts]
 */
router.get('/:id/ad-accounts', authMiddleware, controller.getAdAccounts);



module.exports = router;
