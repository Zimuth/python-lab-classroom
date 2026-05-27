import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SandboxService {
  async executePython(code: string): Promise<string> {
    const filePath = path.join(__dirname, '../../temp/script.py');

    fs.writeFileSync(filePath, code);

    const command = `docker run --rm -v "${filePath}:/app/script.py" python-sandbox`;

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
}
