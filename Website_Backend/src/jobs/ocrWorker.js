/**
 * ocrWorker.js — Redis-free no-op stub
 * OCR jobs are now processed inline via ocrQueue.js (no Redis/BullMQ needed).
 */

// No-op exported function — server.js calls startOcrWorker() on startup
export const startOcrWorker = () => {
  console.log('[OCR Worker] Running in inline mode (no Redis required). Jobs processed directly via ocrQueue.js');
};
