import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';
import { SandboxService } from './sandbox.service';

@WebSocketGateway({ path: '/sandbox/execute', cors: true })
export class SandboxGateway {
  constructor(private readonly sandboxService: SandboxService) {}

  @SubscribeMessage('execute')
  handleExecute(
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

    this.sandboxService.executePython(
      code,
      (msg) => {
        client.send(JSON.stringify({ event: 'execution_result', data: msg }));
      },
      () => {
        client.send(JSON.stringify({ event: 'execution_complete' }));
      },
      (err) => {
        client.send(
          JSON.stringify({
            event: 'execution_error',
            data: { message: err.message },
          }),
        );
      },
    );
  }
}
