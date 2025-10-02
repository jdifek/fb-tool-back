const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require("axios");

const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

// вспомогательный класс для работы с Facebook API
class FacebookService {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  // оставить комментарий под постом (или рекламным креативом)
  async commentOnPost(postId, message) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${postId}/comments`,
        {
          message,
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error posting comment:", error.response?.data || error.message);
      throw error;
    }
  }

  // получить список постов страницы (если нужно)
  async getPosts(pageId) {
    try {
      const response = await axios.get(
        `${GRAPH_API_URL}/${pageId}/posts`,
        { params: { access_token: this.accessToken } }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching posts:", error.response?.data || error.message);
      throw error;
    }
  }
}

// ================== ROUTES ==================

// GET /ad-accounts
exports.getAdAccounts = async (req, res, next) => {
  try {
    const adAccounts = await prisma.adAccount.findMany({
      where: req.user.role === 'SUPERADMIN'
        ? {}
        : {
            facebookAccount: {
              userId: req.user.id
            }
          },
      include: { facebookAccount: true }
    });

    res.json(adAccounts);
  } catch (err) {
    next(err);
  }
};

// POST /ad-accounts
exports.createAdAccount = async (req, res, next) => {
  const { facebookAccountId, adAccountId, name, businessId, currency, timezone, hasCard, hasPixel } = req.body;

  try {
    const facebookAccount = await prisma.facebookAccount.findUnique({
      where: { id: facebookAccountId }
    });

    if (!facebookAccount) {
      return res.status(404).json({ message: 'Facebook account not found' });
    }

    const isOwner = facebookAccount.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const adAccount = await prisma.adAccount.create({
      data: {
        facebookAccountId,
        adAccountId,
        name,
        businessId,
        currency,
        timezone,
        status: 'ACTIVE',
        hasCard: hasCard || false,
        hasPixel: hasPixel || false
      }
    });

    res.status(201).json(adAccount);
  } catch (err) {
    next(err);
  }
};

// DELETE /ad-accounts/:id
exports.deleteAdAccount = async (req, res, next) => {
  const adAccountId = parseInt(req.params.id);

  try {
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
      include: { facebookAccount: true }
    });

    if (!adAccount) return res.status(404).json({ message: 'AdAccount not found' });

    const isOwner = adAccount.facebookAccount.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.adAccount.delete({
      where: { id: adAccountId }
    });

    res.json({ message: 'AdAccount deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /ad-accounts/:id
exports.updateAdAccount = async (req, res, next) => {
  const adAccountId = parseInt(req.params.id);
  const { name, notifications, hasCard, hasPixel } = req.body;

  try {
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
      include: { facebookAccount: true }
    });

    if (!adAccount) return res.status(404).json({ message: 'AdAccount not found' });

    const isOwner = adAccount.facebookAccount.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.adAccount.update({
      where: { id: adAccountId },
      data: {
        name,
        notifications,
        hasCard,
        hasPixel
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// PATCH /ad-accounts/:id/auto-commenting
exports.toggleAutoCommenting = async (req, res, next) => {
  const adAccountId = parseInt(req.params.id);
  const { enabled, testPostId } = req.body;

  try {
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
      include: { facebookAccount: true }
    });

    if (!adAccount) return res.status(404).json({ message: 'AdAccount not found' });

    const isOwner = adAccount.facebookAccount.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.adAccount.update({
      where: { id: adAccountId },
      data: { autoCommenting: enabled }
    });

    // если включили и передали testPostId → пробуем оставить комментарий
    if (enabled && testPostId) {
      try {
        const fbService = new FacebookService(adAccount.facebookAccount.accessToken);
        await fbService.commentOnPost(testPostId, "🔥 Авто-комментарии активированы!");
      } catch (e) {
        console.error("Не удалось оставить тестовый комментарий:", e.message);
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// PATCH /ad-accounts/bulk
exports.bulkUpdate = async (req, res, next) => {
  const { ids, data } = req.body;

  try {
    const updatedAccounts = await prisma.adAccount.updateMany({
      where: {
        id: { in: ids }
      },
      data
    });

    res.json({ updated: updatedAccounts.count });
  } catch (err) {
    next(err);
  }
};
