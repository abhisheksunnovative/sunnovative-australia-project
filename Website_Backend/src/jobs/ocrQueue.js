import { Queue } from 'bullmq';

export const billOcrQueue = new Queue('bill-ocr-queue', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  }
});

export const addBillToQueue = async (jobData) => {
  return await billOcrQueue.add('extract-bill', jobData);
};
