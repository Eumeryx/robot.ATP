import {
    Client,
    GroupMessageEventData,
    MessageElem,
    PrivateMessageEventData,
    segment,
    TextElem
} from 'oicq';
import { AtpRobotConfig } from './config';
import { pluginInit, ParseMessageHook } from '../plugin';
import { forwardGroupFile } from '../plugin/forwardGroupFile';
import { rmdirSync } from 'fs';
import path from 'path';

export class ATP {
    robot: Client;
    botQQ: {
        uin: number;
        password: string;
    };
    masterQQ: number;
    config: AtpRobotConfig;
    parseMessageHook: ParseMessageHook;

    constructor(client: Client, config: AtpRobotConfig) {
        this.robot = client;
        this.botQQ = config.botQQ;
        this.masterQQ = config.masterQQ;
        this.config = config;

        this.parseMessageHook = pluginInit(config.plugin, config.masterQQ);
    }

    parseMessage = async (message: MessageElem[]) => {
        let replyElem;
        const { commandHook } = this.parseMessageHook;

        /* command hook ******************************************************/
        const textElem = message.find((elem) => elem.type === 'text') as TextElem | undefined;

        if (textElem !== undefined) {
            const { text } = textElem.data;
            const opcode = text.trimStart().split(/\s+/, 1)[0];
            const command = commandHook.find((hook) => opcode === hook.opcode);

            if (command !== undefined) {
                const { opcode, func } = command;
                replyElem = func(text.replace(opcode, ''));
            } else if (text.includes('help')) {
                let helpInfo = '';
                //搜集已启用插件的帮助信息
                commandHook.forEach((hook) => (helpInfo += hook.helpInfo));
                helpInfo += `\nsrc: https://github.com/Eumeryx/robot.ATP`;
                replyElem = [segment.text(helpInfo)];
            }
        }

        return replyElem;
    };

    parsePrivateMessage = (data: PrivateMessageEventData) =>
        this.parseMessage(data.message)
            .then((replyElem) => {
                if (replyElem !== undefined) data.reply(replyElem);
            })
            .catch((err) => {
                this.robot.sendPrivateMsg(this.masterQQ, err.message);
                console.error(err);
            });

    parseGroupMessage = (data: GroupMessageEventData) => {
        const groupReply = (replyElem: MessageElem[]) => {
            replyElem.unshift(segment.at(data.user_id, `@${data.sender.nickname}`));
            replyElem.unshift(segment.reply(data.message_id));
            data.reply(replyElem);
        };

        // 监听 @机器人 的请求
        const atBot =
            data.message[0].type === 'at' ? data.message[0].data.qq === this.botQQ.uin : false;

        if (atBot === true) {
            this.parseMessage(data.message)
                .then((replyElem) => {
                    if (replyElem !== undefined) groupReply(replyElem);
                })
                .catch((err) => {
                    this.robot.sendPrivateMsg(this.masterQQ, err.message);
                    console.error(err);
                });
        }

        const { enable, gidList } = this.config.plugin.forwardGroudFile;
        // 监听群文件，并转存到其他地方。
        if (
            atBot === false &&
            enable === true &&
            data.message[0].type === 'file' &&
            gidList.includes(data.group_id) // 群号必需在监听列表中
        ) {
            const fileElemData = data.message[0].data;
            const gfs = this.robot.acquireGfs(data.group_id);
            const config = this.config.plugin.forwardGroudFile;
            const tmpDirPath = path.join(config.tmpDir, fileElemData.fid);
            const groupDirPath = path.join(tmpDirPath, data.group_id.toString());

            forwardGroupFile(gfs, groupDirPath, fileElemData, config)
                .then((replyElem) => replyElem !== undefined && groupReply(replyElem))
                .catch((err) => {
                    this.robot.sendPrivateMsg(this.masterQQ, err.message);
                    console.error(err);
                })
                .finally(() => rmdirSync(tmpDirPath, { recursive: true }));
        }
    };
}
