import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export const stdinExec = (
    command: string,
    args?: string[],
    input?: Buffer | string,
    options?: SpawnOptionsWithoutStdio
): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        const prog = spawn(command, args, options);

        if (input) {
            prog.stdin.write(input);
            prog.stdin.end();
        }

        let stdout: Buffer[] = [];
        prog.stdout.on('data', (data) => {
            stdout.push(data);
        });

        let stderr: string = '';
        prog.stderr.on('data', (data: Buffer) => {
            stderr += data.toString('utf-8');
        });

        prog.on('close', (code) => {
            if (code === 0) {
                resolve(Buffer.concat(stdout));
            } else {
                reject(new Error(stderr));
            }
        });
    });
