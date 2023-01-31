interface Selection {
  isForward: boolean;
  getForwardNodes: () => [Node, Node];
}

/**
 * 정방향, 역방향 여부 판단
 * @returns boolean - true: 정방향 / false: 역방향
 */
Object.defineProperty(Selection.prototype, 'isForward', {
  get: function (this: Selection) {
    const { anchorNode, anchorOffset, focusNode, focusOffset } = this;

    if (!anchorNode || !focusNode) return true;

    const selectionPosition = anchorNode.compareDocumentPosition(focusNode);
    return !(
      (!selectionPosition && anchorOffset > focusOffset) ||
      selectionPosition === Node.DOCUMENT_POSITION_PRECEDING
    );
  },
});

Object.defineProperty(Selection.prototype, 'getForwardNodes', {
  value: function (this: Selection) {
    const { anchorNode, focusNode } = this;
    return this.isForward ? [anchorNode, focusNode] : [focusNode, anchorNode];
  },
});
