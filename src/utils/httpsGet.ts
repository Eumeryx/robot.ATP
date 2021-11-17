import https, { RequestOptions } from 'https';

interface HttpsGetResults {
    data: Buffer;
    statusCode: number | undefined;
    contentType: string | undefined;
}

export const httpsGet = (url: string, options: RequestOptions = {}): Promise<HttpsGetResults> =>
    new Promise((resolve, reject) => {
        https
            .get(url, options, (res) => {
                let chunks: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    resolve({
                        data: Buffer.concat(chunks),
                        statusCode: res.statusCode,
                        contentType: res.headers['content-type']
                    });
                });
            })
            .on('error', (e) => {
                reject(e);
            });
    });
