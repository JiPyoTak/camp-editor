type CampCommand =
  | 'undo'
  | 'redo'
  | 'font'
  | 'font-size'
  | 'bold'
  | 'underline'
  | 'italic'
  | 'strike'
  | 'subscript'
  | 'superscript'
  | 'remove-format'
  | 'heading'
  | 'font-color'
  | 'font-background-color'
  | 'code-block'
  | 'inline-code-block'
  | 'indent'
  | 'outdent'
  | 'order-list'
  | 'unorder-list'
  | 'align'
  | 'horizontal-line'
  | 'line-height'
  | 'table'
  | 'image'
  | 'video'
  | 'preview'
  | 'show-block'
  | 'full-screen'
  | 'help';

interface CampCommandDetail {
  icon: string;
  tagName?: keyof HTMLElementTagNameMap;
}

type CampCommandInfo = {
  [key in CampCommand]: CampCommandDetail;
};

export type { CampCommand, CampCommandDetail, CampCommandInfo };
