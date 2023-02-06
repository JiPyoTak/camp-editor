import LinkedList from '@/utils/class/LinkedList';
import { splitTextNode } from '@/utils/dom';

interface ILinesInfo {
  $nodes: Node[];
  $from: Node | null;
  $to: Node | null;
  range: Range;
}

class Lines implements ILinesInfo {
  $nodes: Node[];
  $from: Node | null;
  $to: Node | null;
  range: Range;

  constructor($lines: Node[], range: Range) {
    this.$from = null;
    this.$to = null;
    this.range = range;
    this.$nodes = $lines.map(($line) => this.copyLine($line));
  }

  copyLine($line: Node) {
    const $copiedRoot = $line.cloneNode(false);

    $line.childNodes.forEach(($child) => {
      this.copyDFS($child, new LinkedList($copiedRoot));
    });

    return $copiedRoot;
  }

  copyDFS($current: Node, parentLink: LinkedList<Node>) {
    const { startContainer, endContainer, startOffset, endOffset } = this.range;
    const { childNodes } = $current;
    const isStart = $current === startContainer;
    const isEnd = $current === endContainer;

    // 복사하는 노드가 startContainer or endContainer 일 때
    // TODO : startContainer와 endContainer가 p 태그일 때 작동
    // TODO : 중복 코드 리팩토링하기
    if (isStart) {
      if ($current.nodeType === Node.TEXT_NODE) {
        let [$copiedLeft, $copiedRight] = splitTextNode($current, startOffset);

        const { $nowUnderRoot } = this.saveContainers($copiedLeft, parentLink);
        this.$from = $nowUnderRoot ?? $copiedRight;
        console.log($copiedRight, $nowUnderRoot);

        if ($copiedRight) {
          const $currentParent = parentLink.getValue();
          $currentParent.appendChild($copiedRight);
        }
      } else {
        const { childNodes: $childNodes } = startContainer;
        let $copiedLeft = startOffset === 0 ? null : $current.cloneNode(false);
        const leftChildNodes = Array.prototype.slice.call(
          $childNodes,
          0,
          startOffset,
        );
        let $copiedRight =
          startOffset === $childNodes.length ? null : $current.cloneNode(false);
        const rightChildNodes = Array.prototype.slice.call(
          $childNodes,
          startOffset,
        );

        const { $nowUnderRoot } = this.saveContainers(
          $copiedLeft,
          parentLink,
          leftChildNodes,
        );
        this.$from = $nowUnderRoot ?? $copiedRight;

        if ($copiedRight) {
          const currentLink = new LinkedList($copiedRight as Node, parentLink);
          const $currentParent = parentLink.getValue();
          $currentParent.appendChild($copiedRight);
          rightChildNodes.forEach((node) => {
            this.copyDFS(node, currentLink);
          });
        }
      }
    } else if (isEnd) {
      if ($current.nodeType === Node.TEXT_NODE) {
        let [$copiedLeft, $copiedRight] = splitTextNode($current, endOffset);

        const { $prevUnderRoot } = this.saveContainers($copiedLeft, parentLink);
        this.$to = $prevUnderRoot ?? $copiedLeft;

        if ($copiedRight) {
          const $currentParent = parentLink.getValue();
          $currentParent.appendChild($copiedRight);
        }
      } else {
        const { childNodes: $childNodes } = endContainer;
        let $copiedLeft = endOffset === 0 ? null : $current.cloneNode(false);
        const leftChildNodes = Array.prototype.slice.call(
          $childNodes,
          0,
          endOffset,
        );
        let $copiedRight =
          endOffset === $childNodes.length ? null : $current.cloneNode(false);
        const rightChildNodes = Array.prototype.slice.call(
          $childNodes,
          endOffset,
        );

        const { $prevUnderRoot } = this.saveContainers(
          $copiedLeft,
          parentLink,
          leftChildNodes,
        );
        this.$to = $prevUnderRoot ?? $copiedLeft;

        if ($copiedRight) {
          const currentLink = new LinkedList($copiedRight as Node, parentLink);
          const $currentParent = parentLink.getValue();
          $currentParent.appendChild($copiedRight);
          rightChildNodes.forEach((node) => {
            this.copyDFS(node, currentLink);
          });
        }
      }
    } else {
      const $currentCopied: Node = $current.cloneNode(false);
      const currentLink = new LinkedList($currentCopied as Node, parentLink);
      const $currentParent = parentLink.getValue();
      $currentParent.appendChild($currentCopied);

      childNodes.forEach((node) => {
        this.copyDFS(node, currentLink);
      });
    }
  }

  saveContainers(
    $targetLeft: Node | null,
    parentLink: LinkedList<Node>,
    $targetChilds: Node[] = [] as Node[],
  ) {
    // 자기 자신 넣고
    //// 자식들 넣고
    if ($targetLeft) {
      const $currentParent = parentLink.getValue();
      $currentParent.appendChild($targetLeft);
      const currentLink = new LinkedList($targetLeft as Node, parentLink);
      $targetChilds.forEach(($child) => {
        this.copyDFS($child, currentLink);
      });
    }

    let nowLink: LinkedList<Node> | null = parentLink;
    let $prevNode: Node | null = null;
    let $nowUnderRoot: Node | null = null;
    let $prevUnderRoot: Node | null = null;

    // 위로 복사하며 부모 참조 바꾸기
    while (nowLink?.getPrev()) {
      const $currentParent = nowLink.getValue();
      const $copiedParent = $currentParent.cloneNode(false);

      if ($prevNode) {
        $copiedParent.appendChild($prevNode);
      }

      nowLink.setValue($copiedParent);
      nowLink = nowLink.getPrev();
      $nowUnderRoot = $copiedParent;
      $prevUnderRoot = $currentParent;
      $prevNode = $copiedParent;
    }

    // P 아래로 복사한 게 있다면 넣어주기
    if ($nowUnderRoot) {
      const $line = nowLink?.getValue();
      $line?.appendChild($nowUnderRoot);
    }

    return { $prevUnderRoot, $nowUnderRoot };
  }
}

export default Lines;
