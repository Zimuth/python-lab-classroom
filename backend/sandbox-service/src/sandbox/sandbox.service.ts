import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { randomUUID } from 'crypto';

@Injectable()
export class SandboxService {
  private readonly containerName = 'python-sandbox';
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
    const codeBase64 = Buffer.from(code).toString('base64');

    // Escribe el script dentro del contenedor
    await this.execPromise(
      `docker exec ${this.containerName} sh -c "echo ${codeBase64} | base64 -d > ${filename}"`,
    );

    // Ejecuta el script y devuelve el resultado
    const result = await this.execPromise(
      `docker exec ${this.containerName} python ${filename}`,
    );

    return result;
  }

  async listScripts(): Promise<string> {
    return this.execPromise(
      `docker exec ${this.containerName} ls ${this.sandboxDir}`,
    );
  }

  async readScript(filename: string): Promise<string> {
    return this.execPromise(
      `docker exec ${this.containerName} cat ${this.sandboxDir}/${filename}`,
    );
  }

  async clearScripts(): Promise<void> {
    await this.execPromise(
      `docker exec ${this.containerName} sh -c "rm -f ${this.sandboxDir}/*.py"`,
    );
  }
}
