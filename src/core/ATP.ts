import {
    Client,
    GroupMessageEvent,
    MessageElem,
    PrivateMessageEvent,
    segment,
    TextElem
} from 'oicq';
import { AtpRobotConfig } from './config';
import { pluginInit, Plugin } from '../plugin';

export class ATP {
    robot: Client;
    botQQ: {
        uin: number;
        password: string;
    };
    masterQQ: number;
    config: AtpRobotConfig;
    plugins: { [name: string]: Plugin[] };
    helpInfo: string;

    constructor(client: Client, config: AtpRobotConfig) {
        this.robot = client;
        this.botQQ = config.botQQ;
        this.masterQQ = config.masterQQ;
        this.config = config;

        const plugsObj = pluginInit(config.plugin);
        this.plugins = plugsObj.plugins;
        this.helpInfo = plugsObj.helpInfo;
    }

    parseMessage = async (message: MessageElem[], senderQQ: number) => {
        let replyElem;

        /* text commnd ******************************************************/
        const textElem = message.find((elem) => elem.type === 'text') as TextElem | undefined;

        if (textElem !== undefined) {
            const text = textElem.text.trimStart();
            const textCmd = this.plugins.text;

            const opcode = text.split(/\s+/, 1)[0];
            const cmd = textCmd.find((cmd) => opcode === cmd.opcode);

            if (cmd !== undefined && (!cmd.master || senderQQ === this.masterQQ)) {
                const { func } = cmd;
                replyElem = func(text.substring(opcode.length).trim());
            } else if (text.includes('help')) {
                replyElem = this.helpInfo;
            }

            return replyElem;
        }
    };

    parsePrivateMessage = (msg: PrivateMessageEvent) =>
        this.parseMessage(msg.message, msg.from_id)
            .then((replyElem) => {
                if (replyElem !== undefined) msg.reply(replyElem);
            })
            .catch((err: Error) => {
                msg.reply(err.message);
            });

    parseGroupMessage = (msg: GroupMessageEvent) => {
        // 监听 @机器人 的请求
        if (msg.atme === true) {
            this.parseMessage(msg.message, msg.sender.user_id)
                .then((replyElem) => {
                    if (replyElem !== undefined) msg.reply(replyElem, true);
                })
                .catch((err: Error) => {
                    msg.reply([err.message, segment.at(this.masterQQ)], true);
                });
        }
    };
}
