import Submenu from '@/core/submenu/Submenu';
import TableSubmenu from '@/core/submenu/Table';

type CampFormatCommand =
  | 'undo'
  | 'redo'
  | 'bold'
  | 'underline'
  | 'italic'
  | 'strike'
  | 'subscript'
  | 'superscript'
  | 'remove-format'
  | 'heading'
  | 'code-block'
  | 'inline-code-block'
  | 'indent'
  | 'outdent'
  | 'order-list'
  | 'unorder-list'
  | 'align'
  | 'horizontal-line'
  | 'line-height'
  | 'image'
  | 'video'
  | 'preview'
  | 'show-block'
  | 'full-screen'
  | 'help';

type CampSubmenuCommand =
  | 'table'
  | 'font'
  | 'font-size'
  | 'font-color'
  | 'font-background-color';

type CampCommand = CampFormatCommand | CampSubmenuCommand;

interface CampCommandDetail {
  icon: string;
  tagName?: keyof HTMLElementTagNameMap;
  sub?: TableSubmenu | Submenu;
}

interface CampCommandBaseDetail {
  icon: string;
}

type CampCommandInfo =
  | {
      [key in CampFormatCommand]: CampCommandBaseDetail & {
        tagName: keyof HTMLElementTagNameMap;
      };
    } & {
      [keu in CampSubmenuCommand]: CampCommandBaseDetail & {
        sub: TableSubmenu | Submenu;
      };
    };

export type {
  CampCommand,
  CampCommandDetail,
  CampCommandInfo,
  CampSubmenuCommand,
  CampFormatCommand,
};
