import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';

import { segment } from 'oicq';
import { svg2png } from '../utils';

interface MathjaxOptions {
    enable: boolean;
    macros: {
        [name: string]: string;
    };
}

const mathjaxPlugin = (options?: MathjaxOptions) => {
    if (!options || !options.enable) {
        return undefined;
    }

    const adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);

    const tex = new TeX({
        packages: AllPackages.sort(),
        macros: options.macros
    });
    const svg = new SVG({ fontCache: 'local' });
    const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

    return {
        type: 'text',
        opcode: '#tex',
        help: '#tex CODE\n// MathJax',
        func: async (tex: string) => {
            const svgString = adaptor.innerHTML(html.convert(tex, { display: true }));
            const png = await svg2png(svgString);

            return segment.image(png);
        }
    };
};

export default mathjaxPlugin;
