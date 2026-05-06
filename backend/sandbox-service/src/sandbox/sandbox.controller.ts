import { Controller, Post, Body } from '@nestjs/common';
import { SandboxService } from './sandbox.service';

@Controller('sandbox')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('execute')
  async execute(@Body('code') code: string) {
    const result = await this.sandboxService.executePython(code);
    return { output: result };
  }
}
