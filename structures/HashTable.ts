export class HashNode<K, V> {
  public key: K;
  public value: V;
  public next: HashNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export class HashTable<K = string, V = unknown> {
  private buckets: (HashNode<K, V> | null)[];
  private capacity: number;
  private size: number;
  private readonly loadFactorThreshold: number = 0.75;
  private collisionCount: number = 0;

  constructor(initialCapacity: number = 16) {
    if (initialCapacity <= 0) {
      throw new Error("La capacidad inicial de la tabla hash debe ser mayor a 0");
    }
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
  }


  private hash(key: K): number {
    const strKey = String(key);
    let hashValue = 5381;
    for (let i = 0; i < strKey.length; i++) {
      hashValue = ((hashValue << 5) + hashValue) + strKey.charCodeAt(i);
      hashValue = hashValue & hashValue; // Convertir a entero de 32 bits
    }
    return Math.abs(hashValue) % this.capacity;
  }

  public set(key: K, value: V): void {
    if (key === undefined || key === null) {
      throw new Error("La clave no puede ser nula o indefinida");
    }

    const index = this.hash(key);
    let head = this.buckets[index];

    let current = head;
    while (current !== null) {
      if (current.key === key) {
        current.value = value; // Actualización
        return;
      }
      current = current.next;
    }

    const newNode = new HashNode<K, V>(key, value);
    if (head !== null) {
      this.collisionCount++;
    }
    newNode.next = head;
    this.buckets[index] = newNode;
    this.size++;

    if (this.size / this.capacity >= this.loadFactorThreshold) {
      this.resize(this.capacity * 2);
    }
  }


  public get(key: K): V | undefined {
    if (key === undefined || key === null) {
      return undefined;
    }

    const index = this.hash(key);
    let current = this.buckets[index];

    while (current !== null) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }

    return undefined;
  }


  public has(key: K): boolean {
    if (key === undefined || key === null) {
      return false;
    }

    const index = this.hash(key);
    let current = this.buckets[index];

    while (current !== null) {
      if (current.key === key) {
        return true;
      }
      current = current.next;
    }

    return false;
  }


  public remove(key: K): boolean {
    if (key === undefined || key === null) {
      return false;
    }

    const index = this.hash(key);
    let current = this.buckets[index];
    let prev: HashNode<K, V> | null = null;

    while (current !== null) {
      if (current.key === key) {
        if (prev === null) {
          this.buckets[index] = current.next;
        } else {
          prev.next = current.next;
        }
        this.size--;
        return true;
      }
      prev = current;
      current = current.next;
    }

    return false;
  }


  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.buckets = new Array(newCapacity).fill(null);
    this.size = 0;
    this.collisionCount = 0;

    for (const head of oldBuckets) {
      let current = head;
      while (current !== null) {
        this.set(current.key, current.value);
        current = current.next;
      }
    }
  }


  public getSize(): number {
    return this.size;
  }


  public getCapacity(): number {
    return this.capacity;
  }

  public getCollisionCount(): number {
    return this.collisionCount;
  }

  public keys(): K[] {
    const result: K[] = [];
    for (const head of this.buckets) {
      let current = head;
      while (current !== null) {
        result.push(current.key);
        current = current.next;
      }
    }
    return result;
  }


  public values(): V[] {
    const result: V[] = [];
    for (const head of this.buckets) {
      let current = head;
      while (current !== null) {
        result.push(current.value);
        current = current.next;
      }
    }
    return result;
  }


  public entries(): [K, V][] {
    const result: [K, V][] = [];
    for (const head of this.buckets) {
      let current = head;
      while (current !== null) {
        result.push([current.key, current.value]);
        current = current.next;
      }
    }
    return result;
  }


  public clear(): void {
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
    this.collisionCount = 0;
  }
}
