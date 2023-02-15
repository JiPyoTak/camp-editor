import LinkedList from '@/utils/class/LinkedList';
import { customClosest, getLastOffset, splitTextNode } from '@/utils/dom';

interface CustomRange {
  startContainer: Node;
  endContainer: Node;
  startOffset: number;
  endOffset: number;
}

class Lines {
  $originalLines: Node[];
  originalRange: CustomRange;
  slicedNodes: {
    from: [Node | null, Node | null];
    to: [Node | null, Node | null];
  };

  $lines: Node[];
  $from: Node;
  fromOffset: number;
  $to: Node;
  toOffset: number;
  rangeIndex: number[][];

  constructor($lines: Node[], range: Range) {
    this.$originalLines = $lines;
    this.originalRange = this.getValidRange(range);
    this.slicedNodes = {
      from: [null, null],
      to: [null, null],
    };

    this.$lines = $lines.map(($line) => this.copyLine($line));

    const { $container: $from, offset: fromOffset } = this.normalizeContainer(
      this.slicedNodes.from,
    );
    this.$from = $from;
    this.fromOffset = fromOffset;

    const { $container: $to, offset: toOffset } = this.normalizeContainer(
      this.slicedNodes.to,
    );
    this.$to = $to;
    this.toOffset = toOffset;

    this.rangeIndex = this.getRangeIndex();
  }

  getValidRange(range: Range) {
    let { startContainer, endContainer, startOffset, endOffset } = range;

    const $lastLine = this.$originalLines[this.$originalLines.length - 1];
    // TODO : startContainer when Line
    if (endContainer === $lastLine) {
      endContainer = $lastLine.childNodes.item(endOffset);
      endOffset = 0;
    }

    return { startContainer, endContainer, startOffset, endOffset };
  }

  normalizeContainer(slicedNodes: [Node | null, Node | null]) {
    const [$left, $right] = slicedNodes;
    const $container = $right ?? $left;

    if (!$container) {
      throw new Error('Copy Lines : Unavailable sliced nodes');
    }

    const offset = $right ? 0 : getLastOffset($container);

    return { $container, offset };
  }

  getRangeIndex() {
    const length = this.$lines.length;

    const firstLine = this.$lines[0];
    const $fromUnderRoot = customClosest(
      this.$from,
      ($node) => $node.parentNode === firstLine,
    );

    const lastLine = this.$lines[length - 1];
    const $toUnderRoot = customClosest(
      this.$to,
      ($node) => $node.parentNode === lastLine,
    );

    const Indexes = this.$lines.map(($line) => [0, $line.childNodes.length]);

    const fromIndex = Array.prototype.indexOf.call(
      firstLine.childNodes,
      $fromUnderRoot,
    );
    const fromAdditional = !this.slicedNodes.from[1] ? 1 : 0;
    Indexes[0][0] = fromIndex + fromAdditional;
    const toIndex = Array.prototype.indexOf.call(
      lastLine.childNodes,
      $toUnderRoot,
    );
    const toAdditional = !this.slicedNodes.to[1] ? 1 : 0;
    Indexes[length - 1][1] = toIndex + toAdditional;

    return Indexes;
  }

  forEachRange(
    fn: (
      [$line, start, end]: [Node, number, number],
      index?: number,
      $lines?: Node[],
    ) => unknown,
  ) {
    for (let i = 0; i < this.$lines.length; i++) {
      const $line = this.$lines[i];
      const [startIndex, endIndex] = this.rangeIndex[i];
      fn([$line, startIndex, endIndex], i, this.$lines);
    }
  }

  copyLine($line: Node) {
    const $copiedRoot = $line.cloneNode(false);

    $line.childNodes.forEach(($child) => {
      this.copyDFS($child, new LinkedList($copiedRoot));
    });
    return $copiedRoot;
  }

  copyDFS($current: Node, parentLink: LinkedList<Node>) {
    const { startContainer, endContainer, startOffset, endOffset } =
      this.originalRange;
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

      this.saveAsOther($copiedRight, parentLink);

      if ($copiedRight) {
        this.appendAndCopyChildren($copiedRight, rightChildNodes, parentLink);
      }

      const saveAttribute = isStart ? 'from' : 'to';
      this.slicedNodes[saveAttribute] = [$copiedLeft, $copiedRight];
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
    }
  }
}

export default Lines;
