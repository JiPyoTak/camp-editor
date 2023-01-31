import type { CampCommandInfo } from '@t/.';

const COMMAND_INFO: CampCommandInfo = Object.freeze({
  bold: {
    tagName: 'strong',
    icon: 'https://img.icons8.com/fluency-systems-filled/48/000000/bold.png',
  },
  italic: {
    tagName: 'i',
    icon: 'https://img.icons8.com/fluency-systems-filled/48/000000/italic.png',
  },
  underline: {
    tagName: 'u',
    icon: 'https://img.icons8.com/fluency-systems-filled/48/000000/underline.png',
  },
  strike: {
    tagName: 'del',
    icon: 'https://img.icons8.com/fluency-systems-filled/30/000000/strikethrough.png',
  },
}) as CampCommandInfo;

export { COMMAND_INFO };
