import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

@Injectable()
export class SandboxService {
  private clients = new Map<string, WebSocket>();

  registerClient(jobId: string, client: WebSocket) {
    this.clients.set(jobId, client);

    client.on('close', () => {
      this.unregisterClient(jobId);
    });
  }

  unregisterClient(jobId: string) {
    this.clients.delete(jobId);
  }

  sendToClient(jobId: string, data: any) {
    const client = this.clients.get(jobId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}
