import TableSubmenu from '@/core/submenu/Table';
import type { CampCommandInfo } from '@/types';

const COMMAND_INFO: Readonly<CampCommandInfo> = Object.freeze({
  bold: {
    tagName: 'strong',
    icon: 'https://img.icons8.com/fluency-systems-filled/48/000000/bold.png',
  },
  italic: {
    tagName: 'em',
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
  table: {
    icon: 'https://img.icons8.com/fluency-systems-filled/30/000000/grid.png',
    sub: new TableSubmenu(),
  },
} as CampCommandInfo);

export { COMMAND_INFO };
