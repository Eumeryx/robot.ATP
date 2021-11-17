import { httpsGet, svg2png } from '../utils';
import { segment } from 'oicq';

const url = 'https://i.upmath.me/svg/';

const upmath = async (tex: string) => {
    const fullUrl = url + encodeURIComponent(tex);
    const { data, statusCode, contentType } = await httpsGet(fullUrl);

    let reply;
    if (statusCode === 200) {
        const png = await svg2png(data.toString('utf-8'));
        reply = segment.image(png);
    } else {
        reply = 'Temporary problem with the API, please try again.';
    }

    return reply;
};

const upmathPlugin = () => {
    return {
        type: 'text',
        opcode: '#upmath',
        help: '#upmath CODE\n// See https://i.upmath.me/',
        func: upmath
    };
};

export default upmathPlugin;
