import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SandboxModule } from './sandbox/sandbox.module';

@Module({
  imports: [SandboxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
