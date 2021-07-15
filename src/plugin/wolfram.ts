const WolframAlphaAPI = require('wolfram-alpha-api');
import { segment } from 'oicq';

export interface WolframOptions {
    enable: boolean;
    alphaId: string;
}

export const wolframPlugin = async (content: string, alphaId: string) => {
    const waApi = WolframAlphaAPI(alphaId);

    return (waApi.getSimple({ i: content, fontsize: 16 }) as Promise<string>)
        .then((image: string) => {
            // image head: "data:image/gif;base64,"
            const replyContent = `base64://${image.slice(22)}`;
            return [segment.image(replyContent)];
        })
        .catch((err: string) => [segment.text(err)]);
};
