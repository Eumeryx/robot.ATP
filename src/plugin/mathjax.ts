import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';
import { segment } from 'oicq';
import { execSync } from 'child_process';

export interface MathjaxOptions {
    enable: boolean;
    macros: {
        [name: string]: string;
    };
}

export const mathjaxPlugin = (options: MathjaxOptions) => {
    const adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);

    const tex = new TeX({
        packages: AllPackages.sort(),
        macros: options.macros
    });
    const svg = new SVG({ fontCache: 'local' });
    const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

    return async (tex: string) => {
        const svgString = `<?xml version="1.0"?>${adaptor.innerHTML(
            html.convert(tex, { display: true })
        )}`;

        let replyElem;
        if (svgString.includes('data-mml-node="merror"')) {
            const errorMessage = svgString.match(/<title>(.*?)<\/title>/)![1];
            replyElem = segment.text(errorMessage);
        } else {
            replyElem = segment.image(
                `base64://${execSync('rsvg-convert -x 6 -y 6 -b white -f png | base64', {
                    input: svgString,
                    encoding: 'utf-8'
                })}`
            );
        }

        return [replyElem];
    };
};
