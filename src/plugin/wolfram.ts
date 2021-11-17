import { segment } from 'oicq';
import { httpsGet, stdinExec } from '../utils';

interface WolframOptions {
    enable: boolean;
    alphaId: string;
    params: { [name: string]: string };
}

const wapiUrl = 'https://api.wolframalpha.com/v1/simple';
const defaultParams = { ip: '127.0.0.1', units: 'metric' };

const wolfram = async (content: string, url: string) => {
    const fullUrl = url + encodeURIComponent(content);

    const { data, statusCode, contentType } = await httpsGet(fullUrl);

    let reply = undefined;
    if (statusCode === 200) {
        const png = await stdinExec('convert', ['-', 'png:-'], data);
        reply = segment.image(png);
    } else if (!contentType || /^text\/html/.test(contentType)) {
        // Rarely, there may be a catastrophic error where the API gives an HTML error page.
        reply = 'Temporary problem with the API, please try again.';
    } else {
        // This runs if non-full API input is empty, ambiguous, or otherwise invalid.
        reply = data.toString('utf-8');
    }

    return reply;
};

const wolframPlugin = (opts?: WolframOptions) => {
    if (!opts || !opts.enable || !opts.alphaId) {
        return undefined;
    }

    const params = Object.assign({ appid: opts.alphaId }, defaultParams, opts.params);
    const url = `${wapiUrl}?${new URLSearchParams(params).toString()}&i=`;

    return {
        type: 'text',
        opcode: '#mma',
        help: '#mma CODE\n// Wolfram|Alpha',
        func: (content: string) => wolfram(content, url)
    };
};

export default wolframPlugin;
