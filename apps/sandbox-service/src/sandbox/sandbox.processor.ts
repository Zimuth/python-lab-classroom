import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as WebSocket from 'ws';

@Processor('python-execution', { concurrency: 1 })
export class SandboxProcessor extends WorkerHost {
  async process(job: Job<{ code: string }, any, string>): Promise<any> {
    const { code } = job.data;

    return new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:8500/ws/execute');

      ws.on('open', () => {
        ws.send(code);
      });

      ws.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data.toString());

          if (parsed.stream === 'system' && parsed.status !== 'running') {
            await job.updateProgress(parsed);

            if (parsed.status === 'error' && parsed.returncode === -1) {
              reject(new Error(parsed.output));
            } else {
              resolve(parsed);
            }
          } else {
            await job.updateProgress(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });

      ws.on('close', () => {
        resolve({ status: 'closed' });
      });

      ws.on('error', (err) => {
        reject(err);
      });
    });
  }
}
