import type { Job } from "bullmq";
import { QueueEnum, createQueue, createWorker } from "./utils";

const queue = createQueue(QueueEnum.ANALYSIS);

const worker = createWorker(QueueEnum.ANALYSIS, async (job: Job) => {});

export { worker, queue };
