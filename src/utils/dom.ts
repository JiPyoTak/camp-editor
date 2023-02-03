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

  console.log(firstRange);
  console.log(lastRange);

  return [firstRange.cloneContents(), lastRange.cloneContents()];
}

export function splitTextNode(node: Node, ...offset: number[]): Node[] {
  const ret = [];
  let head = 0,
    tail;

  for (let i = 0; i < offset.length; i++) {
    tail = offset[i];
    ret.push(document.createTextNode(node.textContent!.slice(head, tail)));
    head = tail;
  }
  ret.push(document.createTextNode(node.textContent!.slice(head)));

  return ret;
}
export function copyUntilParagraph(node: Node | null, appendNode: Node) {
  let ret: Node | null = null;
  while (node && !isParagraph(node)) {
    if (node.nodeType !== Node.TEXT_NODE) {
      if (ret) {
        const tmp = node.cloneNode(false);
        tmp.appendChild(ret);
        ret = tmp;
      } else {
        ret = node.cloneNode(false);
        appendNode && ret.appendChild(appendNode);
      }
    }
    node = node.parentNode;
  }
  return ret;
}

export function isBreak(node?: string | Node): boolean {
  return !!node && /^BR$/i.test(node instanceof Node ? node.nodeName : node);
}

export function copyWithFormatting(
  selection: Selection,
  $root: Node,
  tagName: string,
) {
  let startPass = false;
  let endPass = false;
  const newInnerNode = document.createElement(tagName);

  const pNodeBefore = $root.cloneNode(false);
  const pNodeAfter = $root.cloneNode(false);
  const { startContainer, endContainer, startOffset, endOffset } =
    selection.getRangeAt(0);

  (function recursive($curNode, parentBefore, parentAfter) {
    const childNodes = $curNode.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (!child) continue;
      let cloneBefore, cloneAfter;
      let copiedUntilP;

      // startContainer를 만난 경우
      // internal node
      if (child.nodeType === Node.ELEMENT_NODE) {
        cloneBefore = child.cloneNode(false);
        cloneAfter = child.cloneNode(false);
        parentBefore.appendChild(cloneBefore);
        recursive(child, cloneBefore, cloneAfter);
        if (cloneAfter.childNodes.length > 0) {
          parentAfter.appendChild(cloneAfter);
        }
      }
      // startContainer와 endContainer가 같으면서 만난 경우
      else if (child === startContainer && startContainer === endContainer) {
        const [beforeNode, middleNode, afterNode] = splitTextNode(
          child,
          startOffset,
          endOffset,
        );
        parentBefore.appendChild(beforeNode);
        copiedUntilP = copyUntilParagraph(child, middleNode);
        if (copiedUntilP) {
          newInnerNode.appendChild(copiedUntilP);
        }
        pNodeBefore.appendChild(newInnerNode);
        parentAfter.appendChild(afterNode);
        startPass = endPass = true;
      }
      // startContainer 만난 경우
      else if (child === startContainer) {
        const [beforeNode, afterNode] = splitTextNode(child, startOffset);
        parentBefore.appendChild(beforeNode);
        copiedUntilP = copyUntilParagraph(child, afterNode);
        if (copiedUntilP) {
          newInnerNode.appendChild(copiedUntilP);
        }
        pNodeBefore.appendChild(newInnerNode);
        startPass = true;
      }
      // endContainer 만난 경우
      else if (child === endContainer) {
        const [beforeNode, afterNode] = splitTextNode(child, endOffset);
        copiedUntilP = copyUntilParagraph(child, beforeNode);
        if (copiedUntilP) {
          newInnerNode.appendChild(copiedUntilP);
        }
        parentAfter.appendChild(afterNode);
        endPass = true;
      }
      // startContainer와 endContainer 사이 & endContainer 이후
      else if (child.nodeType === Node.TEXT_NODE) {
        // startContainer 이전
        if (!startPass) {
          parentBefore.appendChild(child.cloneNode(true));
        }
        // endContainer 이후
        else if (endPass) {
          parentAfter.appendChild(child.cloneNode(true));
        }
        // startContainer ~ endContainer 사이
        else {
          copiedUntilP = copyUntilParagraph(child, child.cloneNode(true));
          if (copiedUntilP) {
            newInnerNode.appendChild(copiedUntilP);
          }
        }
      }
    }
  })($root, pNodeBefore, pNodeAfter);

  for (let child; (child = pNodeAfter.firstChild); ) {
    pNodeBefore.appendChild(child);
  }

  return pNodeBefore;
}
