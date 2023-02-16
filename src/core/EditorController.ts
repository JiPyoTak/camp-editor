import {
  clearLine,
  getEditorLines,
  getRelativePosition,
  isWrappedInTag,
  wrapLine,
} from '@/utils/dom';
import { COMMAND_INFO } from '@/constants/command';
import Lines from '@/utils/class/Lines';
import { CampCommand, CampFormatCommand, CampSubmenuCommand } from '@/types';

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
      case 'table':
      case 'font-color':
        this.applyMenu(command, event);
        break;

      default:
        break;
    }
  }

  // 테이블 생성
  // 현재 선택된 줄에 컨텐츠가 존재한다면 endContainer의 부모요소의 다음줄에 생성
  // 존재하지 않는다면 현재 줄에 생성

  // 테이블 버튼 클릭시
  // 테이블 선택 메누 생성
  // 구조를 어떻게 잡아야 할까.. 고민
  // 초기 전역으로 테이블 메뉴를 하나 둔다? no..
  // 클릭된 버튼과 연결된 submenu를 어떻게 알아야할까?
  // 생각나는 방법은 객체에 등록하는것 or props로 넘겨주기 ( == 에반데)
  //
  applyMenu(command: CampSubmenuCommand, event: Event) {
    const target = (event.target as HTMLElement).closest('button');
    const currentTarget = event.currentTarget as HTMLElement;

    if (!target) return;

    const submenu = COMMAND_INFO[command].sub;

    if (!submenu) return;

    const { left, top } = getRelativePosition(currentTarget, target);

    submenu.initRoot(this.$root);
    submenu.setPosition(left, top);
    submenu.toggle();
  }

  applyFormat(command: CampFormatCommand) {
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
      // TODO: 태그 삭제하는 기능
      const copiedLines = new Lines($lines, range);

      copiedLines.forEachRange((...props) => {
        const [[$copiedLine], i] = props;
        clearLine(tagName, ...props[0]);
        $textarea.replaceChild($copiedLine, $lines[i]);
      });
    } else {
      const copiedLines = new Lines($lines, range);
      const { $from, fromOffset, $to, toOffset } = copiedLines;
      if (!$from || !$to) {
        throw new Error('Wrapping Lines : Invalid Range information');
      }

      copiedLines.forEachRange((...props) => {
        const [[$copiedLine], i] = props;
        wrapLine(tagName, ...props[0]);
        $textarea.replaceChild($copiedLine, $lines[i]);
      });

      const newRange = new Range();

      newRange.setStart($from, fromOffset);
      newRange.setEnd($to, toOffset);

      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }
}

export { EditorController };
