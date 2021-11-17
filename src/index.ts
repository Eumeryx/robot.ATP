import { createClient } from 'oicq';

import { getConfig } from './core/config';
import { ATP } from './core/ATP';

const config = getConfig();
const robot = createClient(config.botQQ.uin, {
    log_level: 'error',
    platform: 5
});
const atp = new ATP(robot, config);

// 监听上线事件
robot.on('system.online', () => console.log('Logged in!'));

// 监听滑动验证码
robot.on('system.login.slider', () => {
    process.stdin.once('data', (input: string) => {
        robot.submitSlider(input);
    });
});

// 监听设备锁验证
robot.on('system.login.device', () => {
    robot.logger.info('验证完成后敲击Enter继续..');
    process.stdin.once('data', () => {
        robot.login();
    });
});

// 监听好友私聊
robot.on('message.private.friend', atp.parsePrivateMessage);

// 监听群聊
robot.on('message.group.normal', atp.parseGroupMessage);

// 登陆
robot.login(config.botQQ.password);
