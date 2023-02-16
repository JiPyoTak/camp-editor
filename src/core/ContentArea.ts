import { EditorController } from './EditorController';
import { CampEditorOptions } from '@/types';

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

    $element.innerHTML = `<p>ㄱㄴㄷ<strong>ㄹ</strong><em><strong>ㅁ<u>ㅂ</u></strong></em><strong><u>ㅅ</u></strong>ㅇㅈ<strong>ㅊㅋㅌㅍㅎㅏㅑㅓㅕ<u>ㅗㅛㅜㅠㅡㅣ<br></u></strong></p><p><strong><u>ㄱㄴㄷㄹㅁㅂㅅㅇ</u>ㅈ</strong>ㅊ<em>ㅋㅌ<strong>ㅍㅎㅏㅑㅓㅕㅗ</strong></em><del><em><strong>ㅛㅜㅠㅡㅣ<br></strong></em></del></p><p><del><em><strong>ㄱㄴㄷㄹㅁㅂㅅㅇ</strong></em><u><em><strong>ㅈㅊㅋㅌㅍㅎㅏ</strong>ㅑㅓㅕㅗㅛㅜㅠㅡㅣ<br></em></u></del></p><p><del><u><em>ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌ</em></u><em>ㅍ</em>ㅎㅏㅑㅓㅕㅗㅛ</del>ㅜㅠㅡㅣ</p><p> </p>`;

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
