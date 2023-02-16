interface ICopiedLinesInfo {
  $line: Node;
  $startNode: Node | null;
  $endNode: Node | null;
  startIndex: number;
  endIndex: number;
}

export type { ICopiedLinesInfo };
