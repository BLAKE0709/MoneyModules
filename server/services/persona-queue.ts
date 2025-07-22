import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { fileProcessor } from './file-processor';

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

// Create the persona processing queue
export const personaQueue = new Queue('persona-processing', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Queue job interface
interface PersonaProcessingJob {
  personaFileId: string;
  studentId: string;
  filename: string;
}

// Worker to process persona files
export const personaWorker = new Worker(
  'persona-processing',
  async (job: Job<PersonaProcessingJob>) => {
    const { personaFileId, studentId, filename } = job.data;
    
    console.log(`Processing persona file job: ${personaFileId} for student: ${studentId}`);
    
    try {
      await fileProcessor.processFile(personaFileId);
      console.log(`Successfully processed persona file: ${filename}`);
      return { success: true, personaFileId };
    } catch (error) {
      console.error(`Failed to process persona file ${filename}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process 2 files concurrently
  }
);

// Add event listeners
personaWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

personaWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

personaWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Add a job to the queue
export async function addPersonaProcessingJob(data: PersonaProcessingJob): Promise<Job<PersonaProcessingJob>> {
  return await personaQueue.add('process-persona-file', data, {
    // Add a delay to allow for file upload to complete
    delay: 1000,
  });
}

// Get queue statistics
export async function getQueueStats() {
  const waiting = await personaQueue.getWaiting();
  const active = await personaQueue.getActive();
  const completed = await personaQueue.getCompleted();
  const failed = await personaQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down persona worker...');
  await personaWorker.close();
  await personaQueue.close();
  await redis.quit();
});