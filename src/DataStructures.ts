class LinkedNode<T> {

  private _value: T;
  private _previous: LinkedNode<T> = null;
  private _next: LinkedNode<T> = null;

  constructor(value: T) {
    this._value = value;
  }

  get previous(): LinkedNode<T> {
    return this._previous;
  }

  set previous(value: LinkedNode<T>) {
    this._previous = value;
  }

  get next(): LinkedNode<T> {
    return this._next;
  }

  set next(value: LinkedNode<T>) {
    this._next = value;
  }

  get value(): T {
    return this._value;
  }
}

export class LinkedList<T> {

  private head: LinkedNode<T> = null;
  private size: number = 0;

  addHead(value: T): void {
    if(!this.createHeadIfNeeded(value)) {
      const nextNode = this.head.next;
      const newHeadNode = new LinkedNode<T>(value);
      if(nextNode != null) {
        nextNode.previous = newHeadNode;
        newHeadNode.next = nextNode;
      }
      this.head = newHeadNode;
    }
    this.size++;
  }

  addTail(value : T): void {
    if(!this.createHeadIfNeeded(value)) {
      const oldTailNode = this.getTailNode();
      const newTailNode = new LinkedNode<T>(value);
      oldTailNode.next = newTailNode;
      newTailNode.previous = oldTailNode;
    }
    this.size++;
  }

  clear() {
    this.head = null;
    this.size = 0;
  }

  getHead(): T {
    if(this.head != null) {
      return this.head.value;
    }
    return null;
  }

  removeHead(): T {
    if(this.head != null) {
      const oldHead = this.head;
      const value = oldHead.value;
      this.head = oldHead.next;
      this.size --;
      return value;
    }
    return null;
  }

  getTail(): T {
    const node = this.getTailNode();
    if(node != null) {
      return node.value;
    }
    return null;
  }

  removeTail(): T {
    const node = this.getTailNode();
    if(node != null) {
      if(node === this.head) {
        this.head = null;
      }
      else {
        const previousNode = node.previous;
        previousNode.next = null;
      }
      this.size--;
      return node.value;
    }
    return null;
  }

  getSize(): number {
    return this.size;
  }

  private createHeadIfNeeded(value: T): boolean {
    if(this.head == null) {
      this.head = new LinkedNode(value);
      return true;
    }
    return false;
  }

  private getTailNode(): LinkedNode<T> {
    if(this.head == null) {
      return null;
    }

    let node = this.head;
    while(node.next != null) {
      node = node.next;
    }

    return node;
  }
}

export class SimpleMap<V> {

  private array: { [key: string]: V } = {};

  put(key: string, value: V): void {
    if(value === undefined) {
      throw new Error("Undefined value is not allowed, null is.");
    }
    this.array[key] = value;
  }

  get(key: string): V {
    const value = this.array[key];
    if(value !== undefined) {
      return value;
    }
    return null;
  }

  exists(key: string): boolean {
    const value = this.array[key];
    if(value !== undefined) {
      return true;
    }
    return false;
  }

  remove(key: string): V {
    const value = this.array[key];
    if(value !== undefined) {
      delete this.array[key];
    }
    return value;
  }

  clear(): void {
    this.array = {};
  }
}