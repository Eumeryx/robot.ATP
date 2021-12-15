import { segment } from 'oicq';
import { svg2png } from '../utils';
import { MathJaxConfig } from 'mathjax-full/ts/components/global';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';

const { init:mathjaxInit } = require('mathjax-full');
const { source } = require('mathjax-full/components/src/source.js');

interface MathjaxOptions {
    enable: boolean;
    macros: {
        [name: string]: string;
    };
}

const mathjaxConfig: MathJaxConfig = {
    options: {
        enableAssistiveMml: false
    },
    loader: {
        source: source,
        load: ['adaptors/liteDOM', 'tex-svg', '[tex]/all-packages']
    },
    tex: {
        packages: ['require', ...AllPackages].sort()
    },
    svg: {
        fontCache: 'local'
    },
    startup: {
        typeset: false
    }
};

const mathjaxPlugin = (options?: MathjaxOptions) => {
    if (!options || !options.enable) {
        return undefined;
    } else if (options.macros) {
        mathjaxConfig.tex.macros = options.macros
    }

    return {
        type: 'text',
        opcode: '#tex',
        help: '#tex CODE\n// MathJax',
        func: async (tex: string) => {
            const mathjax = await mathjaxInit(mathjaxConfig);
            const htmlNode = await mathjax.tex2svgPromise(tex, { display: true });

            const svgString = mathjax.startup.adaptor.innerHTML(htmlNode);
            const png = await svg2png(svgString);

            return segment.image(png);
        }
    };
};

export default mathjaxPlugin;
