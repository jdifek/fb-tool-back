const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async addProxy(req, res) {
    try {
      const { ip, port, username, password } = req.body;
  
      const proxy = await prisma.proxy.create({
        data: { ip, port, username, password, status: 'INACTIVE' }
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
  }
  
};
