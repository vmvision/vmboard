import { queue as analysisQueue } from "./analysis";
import { queue as notificationQueue } from "./notification";

export default async () => {
  const { worker: analysisWorker } = await import("./analysis");
  const { worker: notificationWorker } = await import("./notification");

  Promise.all([analysisWorker.run(), notificationWorker.run()]).then((n) => {
    console.log(`[BullMQ] Queue Workers(${n.length}) started`);
  });
};

const getQueues = () => [analysisQueue, notificationQueue];

export { getQueues };
