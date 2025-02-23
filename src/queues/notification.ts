import type { Job } from "bullmq";
import { QueueEnum, createQueue, createWorker } from "./utils";

const queue = createQueue(QueueEnum.NOTIFICATION);
const worker = createWorker(QueueEnum.NOTIFICATION, async (job: Job) => {});

export { queue, worker };
