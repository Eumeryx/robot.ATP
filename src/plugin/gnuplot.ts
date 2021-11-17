import { segment } from 'oicq';
import { stdinExec } from '../utils';

const headPlt = "set term unknown;\nSIZE='';\n";
const tailPlt =
    '\nif (SIZE) {set term jpeg size @SIZE;} else {set term jpeg size 1080,720;};\nreplot;\n';
const errorWarning =
    /WARNING: Plotting with an 'unknown' terminal.\nNo output will be generated. Please select a terminal with 'set terminal'.\n"/g;

const gnuplot = async (content: string) => {
    if (/\bset[\s]+[to].*?([\n;]|$)/.test(content)) {
        return "禁止设置 output 或 terminal.\n如要设置图片大小，请定义 SIZE.\ne.g. SIZE='600,480'.";
    }

    const plt = headPlt + content + tailPlt;

    return stdinExec('gnuplot', ['-'], plt)
        .then((png) => segment.image(png))
        .catch((err: Error) =>
            err.message.replace(errorWarning, '').split('gnuplot> replot;', 1)[0].trim()
        );
};

const gnuplotPlugin = () => {
    return {
        type: 'text',
        opcode: '#plot',
        help: "#plot CODE\n// Gnuplot.\n如要设置图片大小，请定义 SIZE.\ne.g. SIZE='600,480'.",
        func: gnuplot
    };
};

export default gnuplotPlugin;
