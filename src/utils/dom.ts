/**
 * Provide closest with custom function
 * @param compareFunction - (target) => boolean
 * @returns Element | Node | null
 */
function customClosest<T extends Element | Node>(
  this: T,
  compareFunction = (_: T) => false,
) {
  let target: T | null = this;
  while (target) {
    if (compareFunction(target)) {
      return target;
    }
    if ('tagName' in target) target = target.parentElement as T | null;
    else target = target.parentNode as T | null;
  }
  return null;
}

function isParagraph(el: Element | Node) {
  return Boolean(el.parentElement?.getAttribute('contenteditable'));
}

// 선택된 모든 라인을 반환해야겠다고 생각함
export function getEditorLines(selection: Selection): Element[] {
  const [anchorNode, focusNode] = selection.getForwardNodes();

  const anchorLine = customClosest.call(anchorNode, (el) => isParagraph(el));
  const focusLine = customClosest.call(focusNode, (el) => isParagraph(el));

  const content = anchorLine?.parentElement?.children;

  if (!content) return [];

  // 이 노드를 가져와서 parentElement에서 indexOf 사용해서 다 잘라내고 가져올 생각했었음 // anchor / focus를 타고 올라가서 parent parent === $root p태그 잖아
  const anchorIdx = Array.prototype.indexOf.call(content, anchorLine);
  const focusIdx = Array.prototype.indexOf.call(content, focusLine);

  return Array.prototype.slice.call(content, anchorIdx, focusIdx + 1);
}

export function getFirstNode(node: Node) {
  let ret = node;
  while (ret.firstChild) {
    ret = ret.firstChild;
  }
  return ret;
}

/**
 * @description 선택된 영역 안에 tagName이 존재하는지 검사하는 함수
 * @param rootNode - startContainer와 endContainer가 모두 담겨진 노드
 * @param startContainer
 * @param endContainer
 * @param tagName - 검사할 태그 이름
 */
export function isWrappedInTag(
  rootNode: Node,
  startContainer: Node,
  endContainer: Node,
  tagName: string,
) {
  let passEnd = false,
    goingUp = false;
  let curNode: Node = startContainer;

  while (curNode) {
    // 먼저 자기 자신이 tagName인지 검사
    if (curNode.nodeName === tagName.toUpperCase()) {
      return true;
    }
    // 루트 노드가 되면 더 이상 nextSibling 및 parent 볼 필요 없으므로 false return
    else if (curNode === rootNode) {
      return false;
    }
    // endContainer 만나거나 이미 만났으면 계속 부모로 올라가며 검사만 해도 됨
    else if ((curNode === endContainer || passEnd) && curNode.parentNode) {
      passEnd = true;
      curNode = curNode.parentNode;
      goingUp = true;
    }
    // 올라온 직후가 아니라면 (부모로부터 내려왔다면) childNodes를 검사해야함
    else if (!goingUp && curNode.firstChild) {
      goingUp = false;
      curNode = curNode.firstChild;
    }
    // 올라온 직후라면 nextSibling을 검사해야함
    else if (curNode.nextSibling) {
      goingUp = false;
      curNode = curNode.nextSibling;
    }
    // 올라온 직후지만 nextSibling이 없다면 부모로 올라가야함
    else if (curNode.parentNode) {
      goingUp = true;
      curNode = curNode.parentNode;
    }
  }

  return false;
}

export function sliceNode(node: Node, offset: number) {
  const firstRange = new Range();
  const lastRange = new Range();

  firstRange.setStart(node, 0);
  firstRange.setEnd(node, offset);

  lastRange.setStart(node, offset);
  lastRange.setEndAfter(node);

  return [firstRange.cloneContents(), lastRange.cloneContents()];
}

/**
 * If this is TextNode, slice textContent and insert it where you want
 * If this is not TextNode or has no parentNode, just return null
 * @param $node - TextNode
 * @param standardPoint - standard of slicing index
 * @returns [Node | null, Node | null]
 */
function sliceTextNode($node: Node, standardPoint: number) {
  const { nodeType, textContent, parentNode } = $node;
  if (nodeType !== Node.TEXT_NODE) return [null, null];
  if (!textContent) return [null, null];
  if (!parentNode) return [null, null];

  const chars = textContent.split('');
  const textContent1 = chars.splice(0, standardPoint).join('');
  const textContent2 = chars.join('');

  const $node1 = textContent1 ? document.createTextNode(textContent1) : null;
  const $node2 = textContent2 ? document.createTextNode(textContent2) : null;

  return [$node1, $node2];
}

class LinkedList<T> {
  value: T;
  prev: LinkedList<T> | null;
  constructor(value: T, prev?: LinkedList<T>) {
    this.value = value;
    this.prev = prev ?? null;
  }
  setValue(value: T) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
}

export function copyWithFormatting(
  $root: Node,
  { startContainer, endContainer, startOffset, endOffset }: Range,
) {
  const $copiedRoot = $root.cloneNode(false);

  let $startNode: Node | null = null;
  let $endNode: Node | null = null;
  
  // let $startNode: Node | null = null;
  // let $endNode: Node | null = null;
  function recursive($current: Node, parentLink: LinkedList<Node>) {
    const { childNodes } = $current;
    const isStart = $current === startContainer;
    const isEnd = $current === endContainer;

    let $copiedNode: Node | null = $current.cloneNode(false);
    // start와 end 만났을 때
    //// 상위 DOM을 복제해서 진행해야 한다
    if (isStart || isEnd) {
      // TextNode를 잘라서 분배해야 함
      const [$slicedLeft, $slicedRight] = sliceTextNode(
        $current,
        isStart ? startOffset : endOffset,
      );
      //// 왼쪽 조각은 복사 직전에 넣어주기
      if ($slicedLeft) parentLink.getValue().appendChild($slicedLeft);
      //// 오른쪽 조각은 복사 후 넣어주기
      $copiedNode = $slicedRight;

      // 상위 DOM 까지 복사하는데, 참조까지 변경해야 한다
      let $targetUnderRoot: Node | null = null;
      let curLink: LinkedList<Node> | null = parentLink;
      let $beforeNode: Node | null = null;
      while (curLink.prev) {
        const $copiedParent = curLink.getValue();
        const $cloned = $copiedParent.cloneNode(false);

        $targetUnderRoot = isStart ? $cloned : $copiedParent;

        if ($beforeNode) $cloned.appendChild($beforeNode);
        $beforeNode = $cloned;

        curLink.setValue($cloned);
        curLink = curLink?.prev;
      }

      const $copiedParent = curLink.getValue();
      if ($beforeNode) $copiedParent.appendChild($beforeNode);

      if (isStart) {
        $startNode = $targetUnderRoot;
      }
      if (isEnd) {
        $endNode = $targetUnderRoot;
      }
    }

    // 1. 나를 복사해서 상위 부모에 넣기
    // 2. 나에 대한 LinkedList를 자식에게 넘겨주기
    const curLink = new LinkedList($copiedNode as Node, parentLink);

    const $copiedParent = parentLink.getValue();
    if ($copiedNode) $copiedParent.appendChild($copiedNode);

    // 자식 저장하러 ㄱㄱ
    childNodes.forEach((node) => recursive(node, curLink));
  }

  $root.childNodes.forEach(($node) => {
    recursive($node, new LinkedList($copiedRoot));
  });

  const startIndex = Array.prototype.indexOf.call(
    $copiedRoot.childNodes,
    $startNode,
  );
  const endIndex = Array.prototype.indexOf.call(
    $copiedRoot.childNodes,
    $endNode,
  );
  return {
    $line: $copiedRoot,
    $startNode,
    $endNode,
    startIndex: startIndex === -1 ? 0 : startIndex,
    endIndex: endIndex === -1 ? $copiedRoot.childNodes.length : endIndex + 1,
  };
}
