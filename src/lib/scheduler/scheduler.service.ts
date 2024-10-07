import cronParser from 'cron-parser';
import { Queue } from '$lib/queue';
import { JobType, type Job } from './types';


let queue: Queue<Job>;
const workers: { [key: string]: Worker } = {};
const MAX_DEQUEUE_DELAY = parseInt(process.env.MAX_DEQUEUE_DELAY || '1000');
const workerMap: { [key: string]: string } = {
  [JobType.EMAIL]: `${import.meta.dir}/workers/email.worker.ts`,
};
let paused = true;
let isRunning = false;

export const init = async () => {
  queue = new Queue(process.env.QUEUE_DB_PATH || 'queue.db');
};

const getWorker = (type: string) => {
  const worker = workers[type];
  if (!worker) {
    console.log(`Worker not found for job ${type}, creating new worker`);
    return createWorker(type, workerMap[type]);
  }
  return worker;
};

const createWorker = (type: string, path: string) => {
  console.debug(`Creating worker for job ${type} at path ${path}`);
  // @ts-expect-error
  const worker = new Worker(path, { type, smol: true });
  workers[type] = worker;
  return worker;
};

const runQueue = () => {
  if (paused) {
    console.debug('Scheduler paused. Not running jobs.');
    isRunning = false;
    return;
  }
  isRunning = true;
  const item = queue.dequeue();
  if (item) {
    getWorker(item.payload.type).postMessage({
      id: item.id,
      job: item.payload,
    });
    return runQueue();
  }

  const nextExecutionTime = queue.getNextExecutionTime();
  if (!nextExecutionTime && queue.isEmpty()) {
    console.debug('No jobs to run. Exiting scheduler.');
    shutdown();
    return;
  }

  const delay = Math.min(
    nextExecutionTime ? nextExecutionTime.getTime() - Date.now() : MAX_DEQUEUE_DELAY,
    MAX_DEQUEUE_DELAY,
  );
  console.debug(`No jobs to run now. Next execution time is ${new Date(Date.now() + delay)}`);
  setTimeout(runQueue, delay);
};

export const start = () => {
  if (queue.isEmpty()) {
    console.debug('No jobs to run. Exiting scheduler.');
    return;
  }
  paused = false;
  runQueue();
};

export const pause = () => {
  paused = true;
};

export const resume = () => {
  paused = false;
  if (!isRunning) {
    runQueue();
  }
};

export function shutdown() {
  try {
    for (const key in workers) {
      workers[key].terminate();
      delete workers[key];
    }
    isRunning = false;
    paused = true;
  } catch (error) {
    console.error(`Failed to shutdown workers.`, error);
  }
}

export const schedule = (job: Job) => {
  if (!job.start && job.repeat) {
    // If job is set to repeat, get the next execution time based on the cron pattern if no start time is provided
    const interval = cronParser.parseExpression(job.repeat);
    job.start = interval.next().getTime();
  }
  const delay = job.start ? job.start - Date.now() : 0;
  queue.enqueue(job.id, job, Math.max(delay, 0));

  if (!isRunning) {
    start();
  }
};

export const unschedule = (jobId: string) => {
  console.debug(`Unscheduling job ${jobId}`);
  return queue.cancel(jobId);
};
