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

  setUnderRoot(attributeName: string, $target: Node | null) {
    if (attributeName === '$from') {
      this.$from = $target;
    } else if (attributeName === '$to') {
      this.$to = $target;
    }
  }

  copyLine($line: Node) {
    const { startContainer, endContainer, startOffset, endOffset } = this.range;
    const isStart = $line === startContainer;
    const isEnd = $line === endContainer;
    if (isStart || isEnd) {
      const $copiedRoot = $line.cloneNode(true);

      const offset = isStart ? startOffset : endOffset;
      const saveAttribute = isStart ? '$from' : '$to';
      this.setUnderRoot(saveAttribute, $copiedRoot.childNodes.item(offset));

      return $copiedRoot;
    }

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

    if (isStart || isEnd) {
      const offset = isStart ? startOffset : endOffset;
      let $copiedLeft: Node | null = null;
      let $copiedRight: Node | null = null;
      let leftChildNodes: Node[] = [];
      let rightChildNodes: Node[] = [];

      if ($current.nodeType === Node.TEXT_NODE) {
        [$copiedLeft, $copiedRight] = splitTextNode($current, offset);
      } else {
        const { childNodes: $childNodes } = $current;

        $copiedLeft = offset === 0 ? null : $current.cloneNode(false);
        leftChildNodes = Array.prototype.slice.call($childNodes, 0, offset);

        $copiedRight =
          offset === $childNodes.length ? null : $current.cloneNode(false);
        rightChildNodes = Array.prototype.slice.call($childNodes, offset);
      }

      if ($copiedLeft) {
        this.appendAndCopyChildren($copiedLeft, leftChildNodes, parentLink);
      }

      const { $nowUnderRoot } = this.saveAsOther($copiedRight, parentLink);
      const saveAttribute = isStart ? '$from' : '$to';
      const $saveUnderRoot = $nowUnderRoot ?? $copiedRight;
      this.setUnderRoot(saveAttribute, $saveUnderRoot);

      if ($copiedRight) {
        this.appendAndCopyChildren($copiedRight, rightChildNodes, parentLink);
      }
    } else {
      const $currentCopied: Node = $current.cloneNode(false);
      this.appendAndCopyChildren($currentCopied, childNodes, parentLink);
    }
  }

  appendAndCopyChildren(
    $target: Node,
    childNodes: Node[] | NodeListOf<ChildNode>,
    parentLink: LinkedList<Node>,
  ) {
    const currentLink = new LinkedList($target, parentLink);
    const $currentParent = parentLink.getValue();
    $currentParent.appendChild($target);

    childNodes.forEach(($node) => {
      this.copyDFS($node, currentLink);
    });
  }

  saveAsOther($target: Node | null, parentLink: LinkedList<Node>) {
    let nowLink: LinkedList<Node> | null = parentLink;
    let $prevCopiedNode: Node | null = $target;
    let $nowUnderRoot: Node | null = null;

    while (nowLink) {
      const $child = $prevCopiedNode;
      const $currentParent = nowLink.getValue();

      if (!nowLink.isRoot()) {
        $prevCopiedNode = $currentParent.cloneNode(false);
        nowLink.setValue($prevCopiedNode);
      }

      const $parent = nowLink.getValue();
      if ($child) {
        $parent.appendChild($child);
      }

      nowLink = nowLink.getPrev();
      $nowUnderRoot = $prevCopiedNode;
    }

    return { $nowUnderRoot };
  }
}

export default Lines;
