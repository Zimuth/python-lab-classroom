import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { SandboxService } from './sandbox.service';

@WebSocketGateway({ path: '/sandbox/execute', cors: true })
export class SandboxGateway {
  constructor(
    private readonly sandboxService: SandboxService,
    @InjectQueue('python-execution') private executionQueue: Queue,
  ) {}

  @SubscribeMessage('execute')
  async handleExecute(
    @MessageBody() data: { code: string } | string,
    @ConnectedSocket() client: WebSocket,
  ) {
    const code = typeof data === 'string' ? data : data?.code;

    if (!code) {
      client.send(
        JSON.stringify({
          event: 'execution_error',
          data: { message: 'Code is required' },
        }),
      );
      return;
    }

    const jobId = randomUUID();

    this.sandboxService.registerClient(jobId, client);

    const job = await this.executionQueue.add(
      'execute-python',
      { code },
      { jobId },
    );

    client.send(
      JSON.stringify({
        event: 'execution_queued',
        data: { jobId: job.id, message: 'Execution queued...' },
      }),
    );
  }
}
