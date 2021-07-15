import { FileElem, Gfs, GfsFileStat, segment } from 'oicq';
import Download from 'nodejs-file-downloader';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ForwardGroupFileOptions {
    enable: boolean;
    gidList: number[];
    tmpDir: string;
    refreshToken: string;
    shareLink: string;
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
