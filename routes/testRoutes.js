const router = require('express').Router();
const { processCommentTask } = require("../services/commentTasksService");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
router.get('/', async (req, res) => {

  const task = await prisma.commentTask.findUnique({
    where: { id: 2 },
    include: { facebookAccount: { include: { Proxy: true } } },
  });

  const taskResult = await processCommentTask(task);

  res.json(taskResult)
});

module.exports = router;