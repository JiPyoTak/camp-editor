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
  setPrev(prev: LinkedList<T> | null) {
    this.prev = prev;
  }
  getPrev() {
    return this.prev;
  }
}

export default LinkedList;
