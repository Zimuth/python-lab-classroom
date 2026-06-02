import {
  QueueEventsListener,
  QueueEventsHost,
  OnQueueEvent,
} from '@nestjs/bullmq';
import { SandboxService } from './sandbox.service';

@QueueEventsListener('python-execution')
export class SandboxQueueEvents extends QueueEventsHost {
  constructor(private readonly sandboxService: SandboxService) {
    super();
  }

  @OnQueueEvent('progress')
  onProgress({ jobId, data }: { jobId: string; data: any }) {
    this.sandboxService.sendToClient(jobId, {
      event: 'execution_result',
      data,
    });
  }

  @OnQueueEvent('completed')
  onCompleted({ jobId, returnvalue }: { jobId: string; returnvalue: any }) {
    this.sandboxService.sendToClient(jobId, {
      event: 'execution_complete',
      data: returnvalue,
    });
    this.sandboxService.unregisterClient(jobId);
  }

  @OnQueueEvent('failed')
  onFailed({ jobId, failedReason }: { jobId: string; failedReason: string }) {
    this.sandboxService.sendToClient(jobId, {
      event: 'execution_error',
      data: { message: failedReason },
    });
    this.sandboxService.unregisterClient(jobId);
  }
}
