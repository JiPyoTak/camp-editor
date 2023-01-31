export function setRange(
  startCon: Node,
  startOffset: number,
  endCon: Node,
  endOffset: number
) {
  const selection = document.getSelection();

  if (!selection) return;

  const range = new Range();

  range.setStart(startCon, startOffset);
  range.setEnd(endCon, endOffset);
  selection.addRange(range);

  return selection;
}
