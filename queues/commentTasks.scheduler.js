const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { commentTasksQueue } = require('./commentTasks.queue');

const EVERY_2_MIN = 2 * 60 * 1000;

function jobKey(taskId) {
  return `commentTask:${taskId}`;
}

async function scheduleTask(taskId, everyMs = EVERY_2_MIN) {
  await commentTasksQueue.add(
    'checkComments',
    { taskId },
    {
      repeat: { every: everyMs },
      jobId: jobKey(taskId),
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}

async function unscheduleTask(taskId) {
  // видаляємо всі repeatable by key
  const repeatables = await commentTasksQueue.getRepeatableJobs();
  const target = repeatables.find(r => r.id === jobKey(taskId));
  if (target) {
    await commentTasksQueue.removeRepeatableByKey(target.key);
  }
}

async function bootstrapSchedule() {
  const tasks = await prisma.commentTask.findMany({ where: { isActive: true } });
  for (const t of tasks) {
    await scheduleTask(t.id);
  }
  console.log(`🕒 bootstrapped ${tasks.length} repeatable jobs`);
}

module.exports = { scheduleTask, unscheduleTask, bootstrapSchedule };
