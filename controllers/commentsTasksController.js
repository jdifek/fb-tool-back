const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /comments-tasks
 */
exports.getAll = async (req, res, next) => {
  try {
    const tasks = await prisma.commentTask.findMany({
      where: req.user.role === 'SUPERADMIN'
        ? {}
        : {
          userId: req.user.id
        },
      include: { facebookAccount: true }
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /comments-tasks/:id
 */
exports.getOne = async (req, res, next) => {
  const taskId = parseInt(req.params.id);

  try {
    const task = await prisma.commentTask.findUnique({
      where: { id: taskId },
      include: { facebookAccount: true }
    });

    if (!task) {
      return res.status(404).json({ message: 'CommentTask not found' });
    }

    const isOwner = task.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /comments-tasks
 */
exports.create = async (req, res, next) => {
  try {
    const facebookAccountId = parseInt(req.body.facebookAccountId);
    const { postId, action = 'TRACK', notification = false } = req.body;

    if (!facebookAccountId || !postId) {
      return res.status(400).json({ message: 'facebookAccountId and postId are required' });
    }

    const facebookAccount = await prisma.facebookAccount.findUnique({
      where: { id: facebookAccountId },
    });

    if (!facebookAccount) return res.status(404).json({ message: 'Facebook account not found' });

    const isOwner = facebookAccount.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const existing = await prisma.commentTask.findFirst({
      where: { facebookAccountId, postId },
    });
    if (existing) return res.status(409).json({ message: 'Task already exists' });

    const task = await prisma.commentTask.create({
      data: {
        userId: facebookAccount.userId,
        facebookAccountId,
        postId,
        knownCommentIds: [],
        isActive: true,
        action,
        notification,
      },
      include: { facebookAccount: true },
    });

    return res.status(201).json({
      message: 'Comment tracking task created',
      task,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /comments-tasks/:id
 */
exports.update = async (req, res, next) => {
  const taskId = parseInt(req.params.id);
  const { isActive, action, notification } = req.body;

  try {
    const task = await prisma.commentTask.findUnique({
      where: { id: taskId },
      include: { facebookAccount: true },
    });

    if (!task) return res.status(404).json({ message: 'CommentTask not found' });

    const isOwner = task.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.commentTask.update({
      where: { id: taskId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(action && { action }),
        ...(notification !== undefined && { notification }),
      },
      include: { facebookAccount: true },
    });

    res.json({
      message: 'CommentTask updated successfully',
      task: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /comments-tasks/:id
 */
exports.remove = async (req, res, next) => {
  const taskId = parseInt(req.params.id);

  try {
    const task = await prisma.commentTask.findUnique({
      where: { id: taskId },
      include: { facebookAccount: true }
    });

    if (!task) return res.status(404).json({ message: 'CommentTask not found' });

    const isOwner = task.userId === req.user.id;
    if (req.user.role !== 'SUPERADMIN' && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.commentTask.delete({
      where: { id: taskId }
    });

    res.json({ message: 'CommentTask deleted' });
  } catch (err) {
    next(err);
  }
};
