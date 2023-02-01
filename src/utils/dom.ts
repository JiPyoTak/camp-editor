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

// Function to check if Selection is wrapped in tagName
export function isWrappedInTag(selection: Selection, tagName: string) {
  const { startContainer, endContainer } = selection.getRangeAt(0);
  const _start = customClosest.call(startContainer, (el) =>
    isParagraph(el.parentNode as Node),
  );
  const _end = customClosest.call(endContainer, (el) =>
    isParagraph(el.parentNode as Node),
  );

  const newRange = new Range();
  if (!_start || !_end) {
    throw new Error('이상한 노드를 반환했습니다.');
  }

  newRange.setStartBefore(_start);
  newRange.setEndAfter(_end);

  console.log('wrapped: ', newRange.cloneContents().querySelector(tagName));

  return !!newRange.cloneContents().querySelector(tagName);
}

export function recursiveChildToParent(node: Node, tagName: string): boolean {
  if (!node || node.nodeName === 'P') {
    return false;
  } else if (node.nodeName === tagName) {
    return true;
  } else {
    for (
      let parent: Node | null = node.parentNode;
      parent && parent.nodeName !== 'P';
      parent = parent.parentNode as Node
    ) {
      if (parent.nodeName === tagName) {
        return true;
      }
    }
  }
  return false;
}
