import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { randomUUID } from 'crypto';

@Injectable()
export class SandboxService {
  private execPromise(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async executePython(code: string): Promise<string> {
    const volumeName = `sandbox-${randomUUID()}`;

    const codeBase64 = Buffer.from(code).toString('base64');

    try {
      await this.execPromise(`docker volume create ${volumeName}`);

      await this.execPromise(
        `docker run --rm -v ${volumeName}:/sandbox alpine sh -c "echo ${codeBase64} | base64 -d > /sandbox/script.py"`,
      );

      const result = await this.execPromise(
        `docker run --rm -v ${volumeName}:/sandbox python-sandbox`,
      );

      return result;
    } finally {
      await this.execPromise(`docker volume rm ${volumeName}`).catch(() => {});
    }
  }
}
