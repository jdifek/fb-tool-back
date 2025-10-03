const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

function generateTokens(user) {
  const payload = { userId: user.id, role: user.role };
  return {
    accessToken: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }),
    refreshToken: jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '7d' }),
  };
}

exports.register = async ({ email, password, firstName, lastName }) => {
  try {
    // Перевіряємо, чи юзер уже є
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Хешуємо пароль
    const hash = await bcrypt.hash(password, 10);

    // Створюємо нового юзера
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, firstName, lastName },
    });

    return { userId: user.id };

  } catch (error) {
    // Prisma помилка на унікальність (P2002)
    if (error.code === "P2002" && error.meta?.target.includes("email")) {
      return { error: "Email already registered" };
    }

    console.error("Registration error:", error);
    return { error: "Registration failed. Please try again later." };
  }
};

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid credentials');
  }
  return generateTokens(user);
};

exports.refresh = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new Error('User not found');
  return generateTokens(user);
};

exports.getProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
};

exports.changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
    throw new Error('Incorrect password');
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  return { message: 'Password updated' };
};
