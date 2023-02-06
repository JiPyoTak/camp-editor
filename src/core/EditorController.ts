import { getEditorLines, isWrappedInTag } from '@/utils/dom';
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

    const range = selection.getRangeAt(0);
    const { startContainer, endContainer } = range;

    const $textarea = this.$root.querySelector(
      '.ce-editor-content-area',
    ) as Node;
    if (
      !$textarea.contains(startContainer) ||
      !$textarea.contains(endContainer)
    )
      return;

    const tagName = COMMAND_INFO[command].tagName;
    if (!tagName) throw new Error('Apply Text : need tagName attribute');

    const existTag = isWrappedInTag(
      $textarea,
      startContainer,
      endContainer,
      tagName,
    );
  }
}

export { EditorController };
