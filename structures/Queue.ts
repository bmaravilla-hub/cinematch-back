export class QueueNode<T> {
  public data: T;
  public next: QueueNode<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

export class Queue<T> {
  private front: QueueNode<T> | null = null;
  private rear: QueueNode<T> | null = null;
  private size: number = 0;

  public isEmpty(): boolean {
    return this.size === 0;
  }

  public getSize(): number {
    return this.size;
  }

  public peek(): T | undefined {
    return this.front ? this.front.data : undefined;
  }

  public enqueue(item: T): void {
    const newNode = new QueueNode<T>(item);
    if (this.isEmpty()) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear!.next = newNode;
      this.rear = newNode;
    }
    this.size++;
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const removedData = this.front!.data;
    this.front = this.front!.next;
    this.size--;

    if (this.front === null) {
      this.rear = null;
    }

    return removedData;
  }

  public clear(): void {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  public toArray(): T[] {
    const result: T[] = [];
    let current = this.front;
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  public *[Symbol.iterator](): Iterator<T> {
    let current = this.front;
    while (current !== null) {
      yield current.data;
      current = current.next;
    }
  }
}
