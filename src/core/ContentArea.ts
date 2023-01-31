import { EditorController } from './EditorController';
import { CampEditorOptions } from '@t/.';

class ContentArea {
  options: CampEditorOptions;
  $element: HTMLElement;
  controller: EditorController;

  constructor(options: CampEditorOptions, controller: EditorController) {
    this.controller = controller;
    this.options = options;

    this.$element = this.createContentArea(options);
    this.addParagraph();
  }

  createContentArea(options: CampEditorOptions) {
    const defaultParagraph = document.createElement('p');
    defaultParagraph.innerHTML = '<br />';

    const $element = document.createElement('div');
    $element.appendChild(defaultParagraph);
    $element.classList.add('ce-editor-content-area');
    $element.setAttribute('contenteditable', 'true');
    $element.setAttribute('placeholder', '석호짱');
    $element.style.height = options.height;

    return $element;
  }

  addParagraph() {
    this.$element.addEventListener('keydown', (e) => {
      const key = e.key;
      const { children } = e.target as HTMLElement;

      if (key === 'Enter') {
        const selection = document.getSelection();
        if (selection?.anchorNode?.parentElement?.tagName === 'LI') return;
        // todo
        // document.execCommand('formatBlock', false, 'p');
      } else if (
        key === 'Backspace' &&
        children.length === 1 &&
        children[0].textContent === ''
      ) {
        e.preventDefault();
      }
    });
  }
}

export { ContentArea };
