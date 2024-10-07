import type { Job } from "../types";

export default function createWorkerMessageHandler(
  workerName: string,
  executor: (_: { jobId: number; job: Job }) => Promise<void>,
) {
  return async (event: MessageEvent) => {
    const { jobId, job } = event.data as { jobId: number; job: Job };
    console.log(`${workerName} received job ${job.name} with data ${JSON.stringify(job.data)}`);
    await executor({ jobId, job });
  };
}
