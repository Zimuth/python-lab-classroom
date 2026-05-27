import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';

@Injectable()
export class SandboxService {
  private readonly sandboxDir = '/sandbox';

  private execPromise(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(stderr);
        else resolve(stdout);
      });
    });
  }

  async executePython(code: string): Promise<string> {
    const filename = `${this.sandboxDir}/script-${randomUUID()}.py`;

    await writeFile(filename, code);

    try {
      const result = await this.execPromise(`python ${filename}`);
      return result;
    } finally {
      await this.execPromise(`rm -f ${filename}`);
    }
  }
}
