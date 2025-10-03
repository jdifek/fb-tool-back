const facebookService = require('../services/facebookService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addAccount = async (req, res, next) => {
  const userId = req.user.userId;

  console.log(req.user);

  const { accessToken, proxyId, autoAssignProxy = false } = req.body;

  try {
    let proxy = null;

    // Если прокси явно указан
    if (proxyId) {
      proxy = await prisma.proxy.findUnique({ where: { id: proxyId } });

      if (!proxy) {
        throw new Error(`Proxy with ID ${proxyId} not found`);
      }

      if (proxy.facebookAccountId) {
        throw new Error(`Proxy with ID ${proxyId} is already linked to another account`);
      }
    }

    // Если включено авто-назначение и прокси ещё нет
    if (!proxy && autoAssignProxy) {
      proxy = await prisma.proxy.findFirst({
        where: {
          facebookAccountId: null,
          status: 'ACTIVE'
        }
      });

      if (!proxy) {
        throw new Error(`No free active proxies available`);
      }
    }

    // Ходим к Facebook уже через выбранный прокси (если есть)
    const fbUser = await facebookService.getMe(accessToken, proxy);
    const fbAdAccounts = await facebookService.getAdAccounts(accessToken, proxy);

    console.log(fbAdAccounts)

    // Используем транзакцию для атомарности
    const result = await prisma.$transaction(async (tx) => {
      // Создаем/обновляем Facebook аккаунт
      let account = await tx.facebookAccount.upsert({
        where: { fbUserId: fbUser.id },
        update: { accessToken, name: fbUser.name },
        create: {
          userId,
          fbUserId: fbUser.id,
          name: fbUser.name,
          accessToken
        }
      });

      // Привязка прокси к аккаунту (если выбран)
      if (proxy) {
        const updatedProxy = await tx.proxy.update({
          where: { id: proxy.id },
          data: { facebookAccountId: account.id }
        });
        account.proxy = updatedProxy;
      }

      // Создаем/обновляем рекламные аккаунты
      for (const ad of fbAdAccounts.data) {
        await tx.adAccount.upsert({
          where: { adAccountId: ad.id },
          update: {
            name: ad.name,
            status: mapStatus(ad.account_status),
            currency: ad.currency,
            timezone: ad.timezone_name,
            businessId: ad.business?.id ?? null
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

      return account;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};


exports.getAccounts = async (req, res, next) => {
  const user = req.user;
  const where = user.role === 'SUPERADMIN' ? {} : { userId: user.id };

  const accounts = await prisma.facebookAccount.findMany({
    where,
    include: { Proxy: true } // добавить это
  }); res.json(accounts);
};
// PUT /accounts/:id
exports.updateAccount = async (req, res, next) => {
  const accountId = parseInt(req.params.id);
  const { name, accessToken, status } = req.body;

  try {
    const account = await prisma.facebookAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (req.user.role !== 'SUPERADMIN' && account.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.facebookAccount.update({
      where: { id: accountId },
      data: { name, accessToken, status }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// PATCH /accounts/:id
exports.patchAccount = async (req, res, next) => {
  const accountId = parseInt(req.params.id);
  const updates = req.body;

  try {
    const account = await prisma.facebookAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (req.user.role !== 'SUPERADMIN' && account.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.facebookAccount.update({
      where: { id: accountId },
      data: updates
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /accounts/:id
exports.deleteAccount = async (req, res, next) => {
  const accountId = parseInt(req.params.id);

  try {
    const account = await prisma.facebookAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (req.user.role !== 'SUPERADMIN' && account.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.facebookAccount.delete({
      where: { id: accountId }
    });

    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
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
