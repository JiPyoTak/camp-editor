import { isWrappedInTag } from '@/utils/dom';
import { COMMAND_INFO } from '@/constants/command';
import { CampCommand } from '@/types';

// Controller: 이벤트 실행
class EditorController {
  $root: HTMLElement;
  $textarea: Node;

  constructor($root: HTMLElement) {
    this.$root = $root;
    this.$textarea = this.$root.querySelector(
      '.ce-editor-content-area',
    ) as Node;
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

    const { $textarea } = this;
    const { startContainer, endContainer } = selection.getRangeAt(0);

    if (
      !$textarea.contains(startContainer) ||
      !$textarea.contains(endContainer)
    )
      return;

    const existTag = isWrappedInTag(
      $textarea,
      startContainer,
      endContainer,
      COMMAND_INFO[command].tagName as string,
    );
  }
}

export { EditorController };
