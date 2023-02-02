import {
  copyWithFormatting,
  getEditorLines,
  isWrappedInTag,
} from '@/utils/dom';
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

    const $lines = getEditorLines(selection);
    const newRange = new Range();
    let $st: Node | null = null;
    let $ed: Node | null = null;
    $lines
      .map(($l) => copyWithFormatting($l, range))
      .map(({ $line, $startNode, $endNode, startIndex, endIndex }) => {
        const targetChilds = Array.prototype.slice.call(
          $line.childNodes,
          startIndex,
          endIndex,
        );

        const $wrapper = document.createElement(tagName);
        if ($line.childNodes.length !== 0)
          $line.insertBefore($wrapper, $line.childNodes.item(startIndex));
        else $line.appendChild($wrapper);

        targetChilds.forEach(($cn) => {
          $line.removeChild($cn);
          $wrapper.appendChild($cn);
        });

        if ($startNode) $st = $startNode;
        if ($endNode) $ed = $endNode;
        return $line;
      })
      .forEach(($line, index) => {
        $textarea.replaceChild($line, $lines[index]);
      });
    if ($st) newRange.setStart($st, 0);
    if ($ed) newRange.setEndAfter($ed);
    console.log(newRange);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

export { EditorController };
