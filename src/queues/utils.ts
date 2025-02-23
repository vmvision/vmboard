import { redisConfig } from "@/db/redis";
import {  type Processor, Queue, Worker } from "bullmq";

export enum QueueEnum {
  ANALYSIS = "traffic",
  NOTIFICATION = "notification",
}

export const createQueue = (name: string) => {
  const queue = new Queue(name, { connection: redisConfig });
  queue.on("error", (error) => {
    if ((error as { code?: string })?.code === "ECONNREFUSED") {
      console.error(
        "Make sure you have installed Redis and it is running.",
        error,
      );
    }
  });

  queue.on("waiting", (job) => {
    console.log(`Job ${job.id} added`);
  });

  return queue;
};

export const createWorker = <
  // biome-ignore lint/suspicious/noExplicitAny: same as bullmq
  DataType = any,
  // biome-ignore lint/suspicious/noExplicitAny: same as bullmq
  ResultType = any,
  NameType extends string = string,
>(
  name: string,
  processor: Processor<DataType, ResultType, NameType>,
) => {
  const worker = new Worker(name, processor, {
    autorun: false,
    connection: redisConfig,
  });

  worker.on("completed", async (job) => {
    console.log(`Job completed for ${job.id}`);
  });

  worker.on("failed", async (job, err) => {
    console.error(`${job?.id} has failed with ${err.message}`);
  });

  worker.on("stalled", (str) => {
    console.log(`Job stalled: ${str}`);
  });

  return worker;
};
