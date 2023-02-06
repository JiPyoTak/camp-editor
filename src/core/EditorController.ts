import { getEditorLines, isWrappedInTag, wrapLines } from '@/utils/dom';
import { COMMAND_INFO } from '@/constants/command';
import type { CampCommand } from '@/types';
import Lines from '@/utils/class/Lines';

// Controller: 이벤트 실행
class EditorController {
  $root: HTMLElement;

  constructor($root: HTMLElement) {
    this.$root = $root;
  }

  execCommand<T extends Event>(command: CampCommand, event?: T) {
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
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    const { startContainer, endContainer } = range;

    const $textarea = this.$root.querySelector(
      '.ce-editor-content-area',
    ) as Node;

    if (
      !$textarea.contains(startContainer) ||
      !$textarea.contains(endContainer)
    ) {
      return;
    }

    const tagName = COMMAND_INFO[command].tagName;
    if (!tagName) throw new Error('Apply Text : need tagName attribute');

    const existTag = isWrappedInTag(
      $textarea,
      startContainer,
      endContainer,
      tagName,
    );

    const $lines = getEditorLines(selection);

    // TODO : Text Container 가 start === end 일 때
    if (existTag) {
      const separatedLines = new Lines($lines, range);

      const {
        $lines: $copiedLines,
        $startContainer,
        $endContainer,
      } = wrapLines(separatedLines, tagName);

      for (let i = 0; i < $copiedLines.length; i++) {
        $textarea.replaceChild($copiedLines[i], $lines[i]);
      }

      const newRange = new Range();

      newRange.setStartBefore($startContainer);
      newRange.setEndAfter($endContainer);

      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }
  // TODO: 태그 삭제하는 기능
}

export { EditorController };
