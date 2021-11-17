import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const shellPlugin = async (content: string): Promise<string> =>
    execPromise(content)
        .then((ret) => ret.stdout)
        .catch((ret) => ret.stderr);

export default () => {
    return {
        type: 'text',
        master: true,
        opcode: '#sh',
        func: shellPlugin
    };
};
