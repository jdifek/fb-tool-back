const { PrismaClient, ProxyStatus } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async addProxy(req, res) {
    try {
      const { ip, port, username, password } = req.body;

      const proxy = await prisma.proxy.create({
        data: {
          ip,
          port,
          username,
          password,
          status: ProxyStatus.DEAD // по умолчанию DEAD
        }
      });

      res.json(proxy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async linkProxy(req, res) {
    try {
      const { id } = req.params;
      const { facebookAccountId } = req.body;

      const proxy = await prisma.proxy.update({
        where: { id: Number(id) },
        data: { facebookAccountId }
      });

      res.json(proxy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProxies(req, res) {
    try {
      const proxies = await prisma.proxy.findMany();
      res.json(proxies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProxy(req, res) {
    try {
      const { id } = req.params;
      const { ip, port, username, password, status } = req.body;

      const proxy = await prisma.proxy.update({
        where: { id: Number(id) },
        data: {
          ip,
          port,
          username,
          password,
          status
        }
      });

      res.json(proxy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProxy(req, res) {
    try {
      const { id } = req.params;

      await prisma.proxy.delete({
        where: { id: Number(id) }
      });

      res.json({ message: 'Proxy deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
