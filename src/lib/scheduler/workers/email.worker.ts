import createWorkerMessageHandler from '../lib/workerMessageHandler';
import type { EmailJob } from '../types';

const sendMail = async ({ jobId, job: { name, data } }: { jobId: number; job: EmailJob }) => {
  console.log(`Sending mail for job ${name} with data ${JSON.stringify(data)}`);

  self.postMessage({ name, data, status: 'completed' });
};

declare var self: Worker;
self.onmessage = createWorkerMessageHandler('email', sendMail);
