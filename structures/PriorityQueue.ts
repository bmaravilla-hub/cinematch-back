export interface PriorityItem<T> {
  element: T;
  priority: number;
  insertionIndex: number; // Para desempate determinista
}

export class PriorityQueue<T> {
  private heap: PriorityItem<T>[] = [];
  private sequenceCounter: number = 0;

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public getSize(): number {
    return this.heap.length;
  }

  public peek(): PriorityItem<T> | undefined {
    return this.heap[0];
  }


  public insert(element: T, priority: number): void {
    if (!Number.isFinite(priority)) {
      throw new Error(`Prioridad inválida: ${priority}. Debe ser un número finito.`);
    }

    const item: PriorityItem<T> = {
      element,
      priority,
      insertionIndex: this.sequenceCounter++
    };

    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }


  public extractMax(): PriorityItem<T> | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const max = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }

    return max;
  }


  private siftUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.heap[current], this.heap[parent]) > 0) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }


  private siftDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * current + 1;
      const rightChild = 2 * current + 2;
      let largest = current;

      if (
        leftChild < length &&
        this.compare(this.heap[leftChild], this.heap[largest]) > 0
      ) {
        largest = leftChild;
      }

      if (
        rightChild < length &&
        this.compare(this.heap[rightChild], this.heap[largest]) > 0
      ) {
        largest = rightChild;
      }

      if (largest !== current) {
        this.swap(current, largest);
        current = largest;
      } else {
        break;
      }
    }
  }


  private compare(a: PriorityItem<T>, b: PriorityItem<T>): number {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.insertionIndex - a.insertionIndex;
  }


  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }


  public clear(): void {
    this.heap = [];
    this.sequenceCounter = 0;
  }

  public toArray(): PriorityItem<T>[] {
    return [...this.heap];
  }
}
