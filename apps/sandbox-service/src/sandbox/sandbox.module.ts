import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SandboxService } from './sandbox.service';
import { SandboxGateway } from './sandbox.gateway';
import { SandboxProcessor } from './sandbox.processor';
import { SandboxQueueEvents } from './sandbox.events';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'python-execution',
    }),
  ],
  providers: [
    SandboxService,
    SandboxGateway,
    SandboxProcessor,
    SandboxQueueEvents,
  ],
})
export class SandboxModule {}
