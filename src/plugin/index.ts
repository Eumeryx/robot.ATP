import { readdirSync } from 'fs';
import { Sendable } from 'oicq';
import path from 'path';

/**
 * type: 插件类型
 * master： 是否为管理员命令
 * opcode: 命令操作码
 * help: 命令的帮助信息
 * func: 插件的接口函数，返回 Promise<Sendable>
 */
export interface Plugin {
    type: string;
    master?: boolean;
    opcode?: string;
    help?: string;
    func: (msg: Sendable) => Promise<Sendable>;
}

export interface PluginOptions {
    [name: string]: any;
}

export const pluginInit = (options: PluginOptions) => {
    let helpInfo: string = '';
    let plugins: { [name: string]: Plugin[] } = {};

    for (let pathName of readdirSync(__dirname)) {
        const { name: fileName, ext: fileExt } = path.parse(pathName);

        if (fileExt === '.js' && fileName !== 'index') {
            let plug: Plugin | Plugin[] | undefined = require('./' + fileName).default(
                options[fileName]
            );

            if (plug) {
                plug = Array.isArray(plug) ? plug : [plug];

                for (let p of plug) {
                    plugins[p.type] ? plugins[p.type].push(p) : (plugins[p.type] = [p]);

                    if (p.help) helpInfo += `\n\n${p.help}`;
                }
            }
        }
    }

    return { plugins, helpInfo: helpInfo.trim() };
};
