const facebookService = require('../services/facebookService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addAccount = async (req, res, next) => {
  const userId = req.user.id;
  const { accessToken } = req.body;

  try {
    const fbUser = await facebookService.getMe(accessToken);
    const fbAdAccounts = await facebookService.getAdAccounts(accessToken);

    let account = await prisma.facebookAccount.upsert({
      where: { fbUserId: fbUser.id },
      update: { accessToken, name: fbUser.name },
      create: {
        userId,
        fbUserId: fbUser.id,
        name: fbUser.name,
        accessToken,
      }
    });

    for (const ad of fbAdAccounts) {
      await prisma.adAccount.upsert({
        where: { adAccountId: ad.id },
        update: {
          name: ad.name,
          status: mapStatus(ad.account_status),
          currency: ad.currency,
          timezone: ad.timezone_name,
          businessId: ad.business?.id ?? null,
        },
        create: {
          facebookAccountId: account.id,
          adAccountId: ad.id,
          name: ad.name,
          status: mapStatus(ad.account_status),
          currency: ad.currency,
          timezone: ad.timezone_name,
          businessId: ad.business?.id ?? null,
          hasCard: false,
          hasPixel: false
        }
      });
    }

    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};

exports.getAccounts = async (req, res, next) => {
  const user = req.user;
  const where = user.role === 'SUPERADMIN' ? {} : { userId: user.id };

  const accounts = await prisma.facebookAccount.findMany({ where });
  res.json(accounts);
};

exports.getAdAccounts = async (req, res, next) => {
  const accountId = parseInt(req.params.id);
  const account = await prisma.facebookAccount.findUnique({
    where: { id: accountId },
    include: { adAccounts: true }
  });

  if (!account) return res.status(404).json({ message: 'Account not found' });

  if (req.user.role !== 'SUPERADMIN' && account.userId !== req.user.id)
    return res.status(403).json({ message: 'Forbidden' });

  res.json(account.adAccounts);
};

function mapStatus(apiStatus) {
  const statusMap = {
    1: 'ACTIVE',
    2: 'GRACE',
    3: 'CLOSED',
    7: 'BLOCKED'
  };
  return statusMap[apiStatus] || 'BLOCKED';
}
