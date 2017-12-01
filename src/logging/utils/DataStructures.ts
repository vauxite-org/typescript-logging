class LinkedNode<T> {

  private _value: T;
  private _previous: LinkedNode<T> | null = null;
  private _next: LinkedNode<T> | null = null;

  constructor(value: T) {
    this._value = value;
  }

  get previous(): LinkedNode<T> | null {
    return this._previous;
  }

  set previous(value: LinkedNode<T> | null) {
    this._previous = value;
  }

  get next(): LinkedNode<T> | null {
    return this._next;
  }

  set next(value: LinkedNode<T> | null) {
    this._next = value;
  }

  get value(): T {
    return this._value;
  }
}

/**
 * Double linkedlist implementation.
 */
export class LinkedList<T> {

  private head: LinkedNode<T> | null = null;
  private size: number = 0;

  public addHead(value: T): void {
    if (!this.createHeadIfNeeded(value)) {
      if (this.head != null) {
        const nextNode = this.head.next;
        const newHeadNode = new LinkedNode<T>(value);
        if (nextNode != null) {
          nextNode.previous = newHeadNode;
          newHeadNode.next = nextNode;
        }
        this.head = newHeadNode;
      }
      else {
        throw new Error("This should never happen, list implementation broken");
      }
    }
    this.size++;
  }

  public addTail(value: T): void {
    if (!this.createHeadIfNeeded(value)) {
      const oldTailNode = this.getTailNode();
      if (oldTailNode != null) {
        const newTailNode = new LinkedNode<T>(value);
        oldTailNode.next = newTailNode;
        newTailNode.previous = oldTailNode;
      }
      else {
        throw new Error("List implementation broken");
      }
    }
    this.size++;
  }

  public clear() {
    this.head = null;
    this.size = 0;
  }

  public getHead(): T | null {
    if (this.head != null) {
      return this.head.value;
    }
    return null;
  }

  public removeHead(): T | null {
    if (this.head != null) {
      const oldHead = this.head;
      const value = oldHead.value;
      this.head = oldHead.next;
      this.size--;
      return value;
    }
    return null;
  }

  public getTail(): T | null {
    const node = this.getTailNode();
    if (node != null) {
      return node.value;
    }
    return null;
  }

  public removeTail(): T | null {
    const node = this.getTailNode();
    if (node != null) {
      if (node === this.head) {
        this.head = null;
      }
      else {
        const previousNode = node.previous;
        if (previousNode != null) {
          previousNode.next = null;
        }
        else {
          throw new Error("List implementation is broken");
        }
      }
      this.size--;
      return node.value;
    }
    return null;
  }

  public getSize(): number {
    return this.size;
  }

  public filter(f: (value: T) => boolean): T[] {
    const recurse = (fn: (value: T) => boolean, node: LinkedNode<T>, values: T[]) => {
      if (fn(node.value)) {
        values.push(node.value);
      }

      const nextNode = node.next;
      if (nextNode != null) {
        recurse(fn, nextNode, values);
      }
    };

    const result: T[] = [];
    const currentNode = this.head;
    if (currentNode != null) {
      recurse(f, currentNode, result);
    }
    return result;
  }

  private createHeadIfNeeded(value: T): boolean {
    if (this.head == null) {
      this.head = new LinkedNode(value);
      return true;
    }
    return false;
  }

  private getTailNode(): LinkedNode<T> | null {
    if (this.head == null) {
      return null;
    }

    let node = this.head;
    while (node.next != null) {
      node = node.next;
    }

    return node;
  }
}

/**
 * Map implementation keyed by string (always).
 */
export class SimpleMap<V> {

  private array: {[key: string]: V} = {};

  public put(key: string, value: V): void {
    this.array[key] = value;
  }

  public get(key: string): V | undefined {
    return this.array[key];
  }

  public exists(key: string): boolean {
    const value = this.array[key];
    return (typeof value !== "undefined");

  }

  public remove(key: string): V | undefined {
    const value = this.array[key];
    if (typeof value !== "undefined") {
      delete this.array[key];
    }
    return value;
  }

  public keys(): string[] {
    const keys: string[] = [];
    for (const key in this.array) {
      // To prevent random stuff to appear
      if (this.array.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  public values(): V[] {
    const values: V[] = [];
    for (const key in this.array) {
      // To prevent random stuff to appear
      if (this.array.hasOwnProperty(key)) {
        values.push(this.get(key) as V);
      }
    }
    return values;
  }

  public size(): number {
    return this.keys().length;
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public clear(): void {
    this.array = {};
  }

  public forEach(cbFunction: (key: string, value: V, index: number) => void): void {
    let count = 0;
    for (const key in this.array) {
      // To prevent random stuff to appear
      if (this.array.hasOwnProperty(key)) {
        const value = this.array[key];
        cbFunction(key, value, count);
        count++;
      }
    }
  }

  public forEachValue(cbFunction: (value: V, index: number) => void): void {
    let count = 0;
    for (const key in this.array) {
      // To prevent random stuff to appear
      if (this.array.hasOwnProperty(key)) {
        const value = this.array[key];
        cbFunction(value, count);
        count++;
      }
    }
  }

}

/**
 * Tuple to hold two values.
 */
export class TuplePair<X, Y> {

  private _x: X;
  private _y: Y;

  constructor(x: X, y: Y) {
    this._x = x;
    this._y = y;
  }

  get x(): X {
    return this._x;
  }

  set x(value: X) {
    this._x = value;
  }

  get y(): Y {
    return this._y;
  }

  set y(value: Y) {
    this._y = value;
  }
}

/**
 * Utility class to build up a string.
 */
export class StringBuilder {

  private data: string[] = [];

  public append(line: string): StringBuilder {
    if (line === undefined || line == null) {
      throw new Error("String must be set, cannot append null or undefined");
    }
    this.data.push(line);
    return this;
  }

  public appendLine(line: string): StringBuilder {
    this.data.push(line + "\n");
    return this;
  }

  public isEmpty(): boolean {
    return this.data.length === 0;
  }

  public clear(): void {
    this.data = [];
  }

  public toString(separator: string = ""): string {
    return this.data.join(separator);
  }
}
