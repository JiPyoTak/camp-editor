import { EditorView } from '@/core/EditorView';
import { getOptions } from '@/utils/option';
import type { CampEditorOptions } from '@/types';
import '@/core/Selection';

class Editor {
  $root: HTMLElement;
  options: CampEditorOptions;
  _editorView: EditorView;

  constructor(
    idOrEl: HTMLElement | string,
    options: Partial<CampEditorOptions> = {},
  ) {
    this.$root = this.getRootElement(idOrEl);
    this.options = getOptions(options);
    this._editorView = new EditorView(this.$root, this.options);
  }

  getRootElement(idOrEl: HTMLElement | string) {
    let $element = null;

    if (idOrEl instanceof HTMLElement) {
      $element = idOrEl;
    } else if (typeof idOrEl === 'string') {
      $element = document.getElementById(idOrEl);
    } else {
      throw new Error('초기화 에러 발생');
    }

    if (!$element) {
      throw new Error('태그가 존재하지 않습니다.');
    }
    return $element;
  }
}

export { Editor };
