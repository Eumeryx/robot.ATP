import { FileElem, Gfs, GfsFileStat, GroupMessageEventData, segment } from 'oicq';
const download = require('download');
import { mkdirSync, writeFileSync, rmdirSync } from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ForwardGroupFileOptions {
    enable: boolean;
    gidList: number[];
    tmpDir: string;
    refreshToken: string;
    shareLink: string
}

const aliYunPanUpload = (dirPath: string, refreshToken: string): Promise<string> =>
    new Promise((resolve, reject) => {
        try {
            resolve(
                execSync(
                    `./externalDepend/aliyunpan/main.py -t ${refreshToken} upload -r 3 -p "${dirPath}"`,
                    { encoding: 'utf-8' }
                ).trim()
            );
        } catch (err) {
            reject(err);
        }
    });

export const forwardGroupFile = async (
    gfs: Gfs,
    groupDirPath: string,
    fileElemData: FileElem['data'],
    config: ForwardGroupFileOptions
) => {
    const fileStat = <GfsFileStat>await gfs.stat(fileElemData.fileid);

    if (fileStat.pid !== '/') {
        const rootIndex = await gfs.ls('/');
        const parDirStat = rootIndex.find((index) => index.fid === `/${fileStat.pid}`);

        if (parDirStat !== undefined) {
            const { name: fileName, url: fileUrl } = fileElemData;
            const fullDirPath = path.join(groupDirPath, parDirStat.name);

            mkdirSync(fullDirPath, { recursive: true });
            await download(encodeURI(fileUrl), fullDirPath, { filename: fileName });
            await aliYunPanUpload(groupDirPath, config.refreshToken);

            return [segment.text(`此文件已转存至：${config.shareLink}`)];
        }
    }  
};
