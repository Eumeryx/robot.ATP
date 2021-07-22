import * as fs from 'fs';
const JSON5 = require('json5');
import { exit } from 'process';
import { PluginOptions } from '../plugin/index';

export interface AtpRobotConfig {
    botQQ: {
        uin: number;
        password: string;
    };
    masterQQ: number;
    plugin: PluginOptions;
}

export const getConfig = (): AtpRobotConfig => {
    try {
        return JSON5.parse(fs.readFileSync('config.json5', 'utf-8'));
    } catch (error) {
        console.error(error.message);
        exit(1);
    }
};
