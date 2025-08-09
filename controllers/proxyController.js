const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

module.exports = {
  async addProxy(req, res) {
    try {
      const { ip, port, username, password, facebookAccountId } = req.body;

      const proxy = await prisma.proxy.create({
        data: { ip, port, username, password, facebookAccountId }
      });

      res.json(proxy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProxies(req, res) {
    const proxies = await prisma.proxy.findMany({ include: { facebookAccount: true } });
    res.json(proxies);
  },

  async checkProxy(req, res) {
    try {
      const { id } = req.params;
      const proxy = await prisma.proxy.findUnique({ where: { id: Number(id) } });

      if (!proxy) return res.status(404).json({ error: "Proxy not found" });

      // Пример проверки доступности
      const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
      try {
        await axios.get('https://www.google.com', { proxy: {
          host: proxy.ip,
          port: proxy.port,
          auth: { username: proxy.username, password: proxy.password }
        }, timeout: 5000 });

        await prisma.proxy.update({
          where: { id: proxy.id },
          data: { status: 'ACTIVE' }
        });

        res.json({ status: 'ACTIVE' });
      } catch {
        await prisma.proxy.update({
          where: { id: proxy.id },
          data: { status: 'DEAD' }
        });
        res.json({ status: 'DEAD' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
