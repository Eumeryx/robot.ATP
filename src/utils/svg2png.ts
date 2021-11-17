import { stdinExec } from './stdinExec';

export const svg2png = (input: string) =>
    stdinExec('rsvg-convert', '-x 6 -y 6 -b white -f png'.split(' '), input);
