import { EditorController } from './EditorController';
import { CampEditorOptions } from '@/types';
import { CEImage } from '@/plugins/image/CEImage';

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

    $element.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    $element.appendChild(defaultParagraph);
    $element.classList.add('ce-editor-content-area');
    $element.setAttribute('contenteditable', 'true');
    $element.setAttribute('placeholder', '석호짱');
    $element.style.height = options.height;

    // $element.innerHTML = `<p>ㄱㄴㄷ<strong>ㄹ</strong><em><strong>ㅁ<u>ㅂ</u></strong></em><strong><u>ㅅ</u></strong>ㅇㅈ<strong>ㅊㅋㅌㅍㅎㅏㅑㅓㅕ<u>ㅗㅛㅜㅠㅡㅣ<br></u></strong></p><p><strong><u>ㄱㄴㄷㄹㅁㅂㅅㅇ</u>ㅈ</strong>ㅊ<em>ㅋㅌ<strong>ㅍㅎㅏㅑㅓㅕㅗ</strong></em><del><em><strong>ㅛㅜㅠㅡㅣ<br></strong></em></del></p><p><del><em><strong>ㄱㄴㄷㄹㅁㅂㅅㅇ</strong></em><u><em><strong>ㅈㅊㅋㅌㅍㅎㅏ</strong>ㅑㅓㅕㅗㅛㅜㅠㅡㅣ<br></em></u></del></p><p><del><u><em>ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌ</em></u><em>ㅍ</em>ㅎㅏㅑㅓㅕㅗㅛ</del>ㅜㅠㅡㅣ</p><p></p>`;

    /************ 이미지 ************/
    const imageProps = {
      src: 'https://picsum.photos/200/300',
      width: 200,
      height: 300,
      onUploadBefore: () => console.log('upload before'),
      onUploadAfter: () => console.log('upload after'),
      onResizeStart: () => console.log('resize start'),
      onResizeEnd: () => console.log('resize end'),
      onResize: () => console.log('resize'),
      $contentArea: $element,
    };
    const $image = new CEImage(imageProps);
    $element.appendChild($image.$element);
    const $image2 = new CEImage(imageProps);
    $element.appendChild($image2.$element);
    /******************************/

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
