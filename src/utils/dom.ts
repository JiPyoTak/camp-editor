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

interface CustomRange {
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
}

// rootNode = p
export function formatTag(
  rootNode: Node,
  { startContainer, startOffset, endContainer, endOffset }: CustomRange,
  tagName: string,
) {
  const $wrapperTag = document.createElement(rootNode.nodeName);

  const beforeStart = [];
  const startToEnd = [];
  const afterEnd = [];

  let isStart = false;
  let isEnd = false;

  let parentNode: Node | null = null;

  const orderStack = [rootNode];
  const workStack = [];

  while (orderStack.length !== 0) {
    const target = orderStack.pop();
    if (!target) continue;
    workStack.push(target);
    target.childNodes.forEach((n: Node) => orderStack.push(n));
  }

  // 1. 후위순회를 통해 가장 왼쪽 노드에 도착
  // 2. 만약 startContainer === targetNode 일 경우 offset 기준으로 노드를 나누고 각각 beforeStart와 startToEnd에 노드를 담음
  // 2. isStart === false 일 경우 beforeStart 에 노드를 담고 다음 노드 실행
  //  2.1 노드를 담고나서의 실행 과정, 현재 노드를 parentNode의 tagname으로 감싸서 담는다?
  //  2.2 만약 parentNode !== targetNode.parentNode라면 현재 테스크에 존재하는 노드를 targetNode.nodeName으로 감싸고 orderStack에 push
  // 3. isStart === true 일 경우 startToEnd 에 노드를 담고 다음 노드 실행
  // 4. 만약 endContainer === targetNode 일 경우 offset 기준으로 노드를 나누고 각각 startToEnd와 afterEnd에 노드를 담음
  // 5. isEnd === true 일 경우 afterEnd 에 노드를 담고 다음 노드 실행

  while (workStack.length !== 0) {
    const targetNode = workStack.pop();
  }

  return $wrapperTag;
}

export function sliceNode(node: Node, offset: number) {
  const firstRange = new Range();
  const lastRange = new Range();

  firstRange.setStart(node, 0);
  firstRange.setEnd(node, offset);

  lastRange.setStart(node, offset);
  lastRange.setEndAfter(node);

  return [
    firstRange.cloneContents().firstChild ?? document.createTextNode(''),
    lastRange.cloneContents().firstChild ?? document.createTextNode(''),
  ];
}

interface ICustomNode {
  $node: Node;
  isStart: boolean;
  isEnd: boolean;
}

export function temp(
  rootNode: Node,
  { startContainer, startOffset, endContainer, endOffset }: Range,
) {
  let $currentNode: Node | null = null;

  const beforeStart: Node[] = [];
  const startToEnd: Node[] = [];
  const afterEnd: Node[] = [];

  let isStart = false;
  let isEnd = false;

  function recursive($current: Node, nodes: ICustomNode[]) {
    const childNodes = $current.childNodes;
    const $cloneNode = $current.cloneNode();

    const result: ICustomNode[] = [];
    let arr: Node[] = [];

    childNodes.forEach((n) => {
      if ($current === rootNode) {
        $currentNode = n;
      }

      arr = isStart && isEnd ? afterEnd : isStart ? startToEnd : beforeStart;
      const resultNode = recursive(n, result);
      arr.push;
    });

    // 넣기전 분리해야함
    while (result.length) {
      const data = result.shift();

      if (!data) break;

      const { $node, isStart, isEnd } = data;

      $cloneNode.appendChild($node);
    }

    // const runningTask: Node[] =
    isStart && isEnd ? afterEnd : isStart ? startToEnd : beforeStart;

    if ($currentNode === $current) {
      const defaultTask = beforeStart;
      defaultTask.push($cloneNode);

      if (isStart || isEnd) {
        const startOrEndTask = isStart ? startToEnd : afterEnd;
      }
    }

    if (startContainer === $current || endContainer === $current) {
      const $targetNode = isStart ? startContainer : endContainer;
      const offset = isStart ? startOffset : endOffset;
      const [afterNode, beforeNode] = sliceNode($targetNode, offset);

      // startCon === current 일때
      // 변경 전: isStart = false, isEnd = false
      // 변경 후: isStart = true, isEnd = false
      // after { isStart: false, isEnd: false} before {isStart: true, isEnd: false }

      // endCon === current 일때
      // 변경 전: isStart = true, isEnd = false
      // 변경 후: isStart = false, isEnd = true
      // after { isStart: true, isEnd: false} before {isStart: false, isEnd: true }

      // startCon === current && endCon === current 일때
      // 그냥 해당 태그 offset 잘라서 태그 랩핑하고 반환
      // 그걸 여기서? 에바지

      console.log(
        {
          $node: afterNode,
          isStart,
          isEnd,
        },
        {
          $node: beforeNode,
          isStart: startContainer === $current,
          isEnd: endContainer === $current,
        },
      );
      nodes.push(
        {
          $node: afterNode,
          isStart,
          isEnd,
        },
        {
          $node: beforeNode,
          isStart: startContainer === $current,
          isEnd: endContainer === $current,
        },
      );

      if (startContainer === $current) isStart = startContainer === $current;
      if (endContainer === $current) isEnd = endContainer === $current;
    } else {
      nodes.push({
        $node: $cloneNode,
        isStart: false,
        isEnd: false,
      });
    }
    // nodes.push({
    //   $node: $cloneNode,
    //   isStart: false,
    //   isEnd: false,
    // });

    return $cloneNode;
  }

  const a = recursive(rootNode, []);

  console.log(beforeStart, startToEnd, afterEnd, a);
}

// startCon 일때 기존 currentNode를 바꿔줘야 한다. 다만... 현재 $current와

// startCon === current 일때
// isStart = true, isEnd = false
// after { isStart: false, isEnd: false} before {isStart: true, isEnd: false }

// endCon === current 일때
// isStart = false, isEnd = true
// after { isStart: true, isEnd: false} before {isStart: false, isEnd: true }

interface ICustomNode2 {
  $node: Node;
  $parent: Node | null;
}

export function temp2(
  rootNode: Node,
  { startContainer, startOffset, endContainer, endOffset }: Range,
) {
  let $beforeStartNode: Node | null = null;
  let $startToEndNode: Node | null = null;
  let $afterEndNode: Node | null = null;

  // 저장하는 큐
  const beforeStart: ICustomNode2[] = [];
  const startToEnd: ICustomNode2[] = [];
  const afterEnd: ICustomNode2[] = [];

  let isStart = false;
  let isEnd = false;

  function recursive($current: Node) {
    const childNodes = $current.childNodes;
    let $cloneNode = $current.cloneNode();

    const arr: ICustomNode2[] = [];

    childNodes.forEach((n) => {
      arr.push(...recursive(n));

      if ($current === rootNode) {
        if (isStart) $startToEndNode = $cloneNode;
        if (isEnd) $afterEndNode = $cloneNode;
        else $beforeStartNode = $cloneNode;
      }
    });

    if (startContainer === $current) {
      isStart = true;
      isEnd = false;

      const [a, b] = sliceNode($current, startOffset);

      return [
        { $node: a, $parent: $current.parentNode },
        { $node: b, $parent: $current.parentNode },
      ];
    }
    if (endContainer === $current) {
      isStart = false;
      isEnd = true;

      const [a, b] = sliceNode($current, startOffset);

      return [
        { $node: a, $parent: $current.parentNode },
        { $node: b, $parent: $current.parentNode },
      ];
    }

    return [{ $node: $cloneNode, $parent: $current.parentNode }];
  }

  const a = recursive(rootNode);

  console.log(beforeStart, startToEnd, afterEnd);
  console.log($beforeStartNode, $startToEndNode, $afterEndNode);
}
