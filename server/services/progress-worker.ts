import { pool } from "../db";
import { emitTransferUpdate } from "../data-socket";

interface ProgressJob {
  transferId: string;
  userId: string;
  targetPercent: number;
  startPercent: number;
}

const activeJobs = new Map<string, NodeJS.Timeout>();

export function enqueueProgressJob(job: ProgressJob): void {
  const jobKey = `progress:${job.transferId}`;
  
  if (activeJobs.has(jobKey)) {
    clearInterval(activeJobs.get(jobKey)!);
    activeJobs.delete(jobKey);
  }
  
  if (job.startPercent >= job.targetPercent) {
    console.log(`[PROGRESS WORKER] Job ${jobKey}: Already at or above target (${job.startPercent} >= ${job.targetPercent})`);
    return;
  }
  
  console.log(`[PROGRESS WORKER] Enqueuing job ${jobKey}: ${job.startPercent}% -> ${job.targetPercent}%`);
  
  let currentPercent = job.startPercent;
  const incrementStep = 0.5;
  const intervalMs = 1000;
  
  const timer = setInterval(async () => {
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT id, user_id, progress_percent, is_paused, pause_percent, status, 
                  codes_validated, required_codes, current_step, updated_at
           FROM transfers WHERE id = $1 FOR UPDATE`,
          [job.transferId]
        );
        
        if (result.rows.length === 0) {
          console.log(`[PROGRESS WORKER] Transfer ${job.transferId} not found, stopping job`);
          clearInterval(timer);
          activeJobs.delete(jobKey);
          return;
        }
        
        const transfer = result.rows[0];
        
        if (transfer.status === 'completed' || transfer.status === 'cancelled') {
          console.log(`[PROGRESS WORKER] Transfer ${job.transferId} is ${transfer.status}, stopping job`);
          clearInterval(timer);
          activeJobs.delete(jobKey);
          return;
        }
        
        if (transfer.progress_percent >= job.targetPercent) {
          console.log(`[PROGRESS WORKER] Transfer ${job.transferId} reached target ${job.targetPercent}%, stopping job`);
          clearInterval(timer);
          activeJobs.delete(jobKey);
          return;
        }
        
        const newPercent = Math.min(currentPercent + incrementStep, job.targetPercent);
        
        const updateResult = await client.query(
          `UPDATE transfers SET progress_percent = $2, updated_at = now() 
           WHERE id = $1 
           RETURNING id, user_id, progress_percent, is_paused, pause_percent, status, 
                     codes_validated, required_codes, current_step, updated_at`,
          [job.transferId, newPercent]
        );
        
        currentPercent = newPercent;
        
        const updatedTransfer = updateResult.rows[0];
        
        // Emit complete transfer state to keep frontend consistent
        emitTransferUpdate(job.userId, 'updated', job.transferId, {
          id: updatedTransfer.id,
          progressPercent: updatedTransfer.progress_percent,
          isPaused: updatedTransfer.is_paused,
          pausePercent: updatedTransfer.pause_percent,
          status: updatedTransfer.status,
          codesValidated: updatedTransfer.codes_validated,
          requiredCodes: updatedTransfer.required_codes,
          currentStep: updatedTransfer.current_step,
          updatedAt: updatedTransfer.updated_at,
        });
        
        console.log(`[PROGRESS WORKER] Transfer ${job.transferId}: Progress updated to ${newPercent}%`);
        
        if (newPercent >= job.targetPercent) {
          console.log(`[PROGRESS WORKER] Transfer ${job.transferId} reached target ${job.targetPercent}%, job complete`);
          clearInterval(timer);
          activeJobs.delete(jobKey);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`[PROGRESS WORKER] Error processing job ${jobKey}:`, error);
      clearInterval(timer);
      activeJobs.delete(jobKey);
    }
  }, intervalMs);
  
  activeJobs.set(jobKey, timer);
}

export function cancelProgressJob(transferId: string): void {
  const jobKey = `progress:${transferId}`;
  
  if (activeJobs.has(jobKey)) {
    clearInterval(activeJobs.get(jobKey)!);
    activeJobs.delete(jobKey);
    console.log(`[PROGRESS WORKER] Cancelled job ${jobKey}`);
  }
}

export function getActiveJobsCount(): number {
  return activeJobs.size;
}
