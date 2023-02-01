import { isWrappedInTag } from '@/utils/dom';
import { COMMAND_INFO } from '@/constants/command';
import { CampCommand } from '@/types';

// Controller: 이벤트 실행
class EditorController {
  $root: HTMLElement;

  constructor($root: HTMLElement) {
    this.$root = $root;
  }

  execCommand(command: CampCommand) {
    // TODO: 많아지면 리팩토링 생각해보기
    switch (command) {
      case 'bold':
      case 'italic':
      case 'strike':
      case 'underline':
        this.applyFormat(command);
        break;

      default:
        break;
    }
  }

  applyFormat(command: CampCommand) {
    const selection = document.getSelection();
    if (!selection) return;

    const { startContainer, endContainer } = selection.getRangeAt(0);

    const existTag = isWrappedInTag(
      this.$root.querySelector('.ce-editor-content-area') as Node,
      startContainer,
      endContainer,
      COMMAND_INFO[command].tagName as string,
    );
  }
}

export { EditorController };
