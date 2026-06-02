import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxGateway } from './sandbox.gateway';

@Module({
  providers: [SandboxService, SandboxGateway],
})
export class SandboxModule {}
