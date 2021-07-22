import { FileElem, Gfs, GfsFileStat, segment } from 'oicq';
import Download from 'nodejs-file-downloader';
import * as path from 'path';
import { exec } from 'child_process';

export interface ForwardGroupFileOptions {
    enable: boolean;
    gidList: number[];
    tmpDir: string;
    refreshToken: string;
    shareLink: string;
}

const aliYunPanUpload = (dirPath: string, refreshToken: string): Promise<string> =>
    new Promise((resolve, reject) =>
        exec(
            `./externalDepend/aliyunpan/main.py -t ${refreshToken} upload -r 5 -c -cs 2097152 -p "${dirPath}"`,
            { shell: '/bin/bash', encoding: 'utf-8' },
            (err, stdout, stderr) => {
                if (err !== null) {
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            }
        )
    );

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

            const downloadFile = new Download({
                url: encodeURI(fileUrl),
                directory: fullDirPath,
                fileName: fileName,
                maxAttempts: 3
            });
            await downloadFile.download();
            await aliYunPanUpload(groupDirPath, config.refreshToken);

            return [segment.text(`此文件已转存至：${config.shareLink}`)];
        }
    }
};
