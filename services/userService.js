const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllUsers = () => {
  return prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
};

exports.updateRole = (id, role) => {
  return prisma.user.update({ where: { id: Number(id) }, data: { role } });
};
