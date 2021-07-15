import { MessageElem } from 'oicq';
import { ForwardGroupFileOptions } from './forwardGroupFile';
import { MathjaxOptions, mathjaxPlugin } from './mathjax';
import { WolframOptions, wolframPlugin } from './wolfram';

export interface PluginOptions {
    mathjax: MathjaxOptions;
    wolfram: WolframOptions;
    forwardGroudFile: ForwardGroupFileOptions;
}

/**
 * opcode: 命令操作码
 * helpInfo: 帮助信息
 * func: 插件的接口函数，返回 Promise<MessageElem>
 */
interface CommandHook {
    opcode: string;
    helpInfo: string;
    func: (elem: string) => Promise<MessageElem[]>;
}

export interface ParseMessageHook {
    commandHook: CommandHook[];
}

export const pluginInit = (options: PluginOptions, masterQQ?: number) => {
    /* prase text command ****************************************************/
    let commandHook: CommandHook[] = [];

    // mathjax pulgin
    if (options.mathjax.enable === true) {
        const mathjax = mathjaxPlugin(options.mathjax);
        commandHook.push({
            opcode: '#tex',
            helpInfo: '\n#tex CODE  //MathJax',
            func: mathjax
        });
    }

    // wolfram pulgin
    if (options.wolfram.enable === true) {
        commandHook.push({
            opcode: '#mma',
            helpInfo: '\n#mma CODE  //Wolfram|Alpha',
            func: (elem: string) => wolframPlugin(elem, options.wolfram.alphaId)
        });
    }

    return {
        commandHook: commandHook
    };
};
