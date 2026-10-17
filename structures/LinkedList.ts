export class ListNode<T> {
  public data: T;
  public next: ListNode<T> | null = null;

  constructor(data: T, next: ListNode<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

export class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private size: number = 0;


  public isEmpty(): boolean {
    return this.head === null;
  }


  public getSize(): number {
    return this.size;
  }

  public getHead(): ListNode<T> | null {
    return this.head;
  }


  public append(data: T): void {
    const newNode = new ListNode<T>(data);
    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.size++;
  }

  public prepend(data: T): void {
    const newNode = new ListNode<T>(data, this.head);
    this.head = newNode;
    if (this.tail === null) {
      this.tail = newNode;
    }
    this.size++;
  }


  public find(predicate: (item: T) => boolean): T | null {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }


  public update(predicate: (item: T) => boolean, newData: T): boolean {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.data)) {
        current.data = newData;
        return true;
      }
      current = current.next;
    }
    return false;
  }


  public remove(predicate: (item: T) => boolean): boolean {
    if (this.isEmpty()) {
      return false;
    }

    if (predicate(this.head!.data)) {
      this.head = this.head!.next;
      this.size--;
      if (this.head === null) {
        this.tail = null;
      }
      return true;
    }

    let current = this.head;
    while (current !== null && current.next !== null) {
      if (predicate(current.next.data)) {
        if (current.next === this.tail) {
          this.tail = current;
        }
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }


  public insertOrUpdate(
    matchPredicate: (item: T) => boolean,
    data: T,
    replaceIfExists: boolean = true
  ): boolean {
    let current = this.head;
    while (current !== null) {
      if (matchPredicate(current.data)) {
        if (replaceIfExists) {
          current.data = data;
          return true;
        }
        return false;
      }
      current = current.next;
    }

    this.append(data);
    return true;
  }


  public forEach(callback: (item: T, index: number) => void): void {
    let current = this.head;
    let index = 0;
    while (current !== null) {
      callback(current.data, index);
      current = current.next;
      index++;
    }
  }

  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  public filter(predicate: (item: T) => boolean): LinkedList<T> {
    const filteredList = new LinkedList<T>();
    let current = this.head;
    while (current !== null) {
      if (predicate(current.data)) {
        filteredList.append(current.data);
      }
      current = current.next;
    }
    return filteredList;
  }


  public clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }


  public *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.data;
      current = current.next;
    }
  }
}
