import type Lines from '@/utils/class/Lines';

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

/**
 * @description 여러 Offset을 기준으로 텍스트를 분리해 TextNode 배열로 반환하는 함수
 * @param $node - 분리할 TextNode
 * @param offset - 분리할 TextNode의 분기점들
 */
export function splitTextNode(
  $node: Node,
  ...offset: number[]
): (Node | null)[] {
  const { nodeType, textContent, parentNode } = $node;
  if (nodeType !== Node.TEXT_NODE) return [];
  if (!textContent) return [];
  if (!parentNode) return [];

  const $textNodes = [];
  let head = 0,
    tail;
  offset.push(textContent.length);

  for (let i = 0; i < offset.length; i++) {
    tail = offset[i];

    if (typeof tail !== 'number') {
      throw Error('Split Text Node : wrong offset inserted');
    }

    const text = textContent.slice(head, tail);
    $textNodes.push(text ? document.createTextNode(text) : null);
    head = tail;
  }

  return $textNodes;
}

export function wrapLines(lineInfos: Lines, tagName: string) {
  const $lines = [];
  const { $nodes, $from, $to } = lineInfos;
  console.log(lineInfos);
  if (!$from || !$to) {
    throw new Error('Wrapping Lines : Invalid Range information');
  }

  for (let i = 0; i < $nodes.length; i++) {
    const $line = $nodes[i];
    const $childNodes = $line.childNodes;

    const fromIndex = Array.prototype.indexOf.call($childNodes, $from);
    const toIndex = Array.prototype.indexOf.call($childNodes, $to);
    const startIndex = fromIndex === -1 ? 0 : fromIndex;
    const endIndex = toIndex === -1 ? $childNodes.length : toIndex + 1;

    const targetChilds = Array.prototype.slice.call(
      $childNodes,
      startIndex,
      endIndex,
    );

    const $wrapper = document.createElement(tagName);
    if ($childNodes.length !== 0) {
      $line.insertBefore($wrapper, $childNodes.item(startIndex));
    } else {
      $line.appendChild($wrapper);
    }

    targetChilds.forEach(($child) => {
      $line.removeChild($child);
      $wrapper.appendChild($child);
    });
    $lines.push($line);
  }

  return { $lines, $startContainer: $from, $endContainer: $to };
}
