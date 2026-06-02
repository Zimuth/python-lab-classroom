import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

@Injectable()
export class SandboxService {
  executePython(
    code: string,
    onMessage: (data: any) => void,
    onClose: () => void,
    onError: (err: any) => void,
  ) {
    const ws = new WebSocket('ws://localhost:8500/ws/execute');

    ws.on('open', () => {
      ws.send(code);
    });

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        onMessage(parsed);
      } catch {
        onMessage({
          status: 'error',
          output: data.toString(),
          stream: 'system',
        });
      }
    });

    ws.on('close', () => {
      onClose();
    });

    ws.on('error', (err) => {
      onError(err);
    });
  }
}
