export class AVLNode<T> {
  public key: string;
  public data: T;
  public height: number;
  public left: AVLNode<T> | null = null;
  public right: AVLNode<T> | null = null;

  constructor(key: string, data: T) {
    this.key = key;
    this.data = data;
    this.height = 1;
  }
}

export class AVLTree<T> {
  private root: AVLNode<T> | null = null;
  private size: number = 0;


  public static buildMovieKey(title: string, id: string): string {
    return `${title.trim().toLowerCase()}#${id.trim().toLowerCase()}`;
  }

  private getHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }


  public getBalanceFactor(node: AVLNode<T> | null): number {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }


  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;


    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }


  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node);
    const balanceFactor = this.getBalanceFactor(node);

    if (balanceFactor > 1) {
      if (this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left!);
      }
      return this.rotateRight(node);
    }

    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right!);
      }
      return this.rotateLeft(node);
    }

    return node;
  }


  public insert(key: string, data: T): void {
    if (!key || key.trim() === '') {
      throw new Error("La clave del nodo AVL no puede estar vacía");
    }
    this.root = this.insertNode(this.root, key, data);
  }

  private insertNode(node: AVLNode<T> | null, key: string, data: T): AVLNode<T> {
    if (node === null) {
      this.size++;
      return new AVLNode<T>(key, data);
    }

    if (key < node.key) {
      node.left = this.insertNode(node.left, key, data);
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key, data);
    } else {
      node.data = data;
      return node;
    }

    return this.balance(node);
  }


  public search(key: string): T | null {
    let current = this.root;
    while (current !== null) {
      if (key === current.key) {
        return current.data;
      }
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return null;
  }


  public delete(key: string): boolean {
    const initialSize = this.size;
    this.root = this.deleteNode(this.root, key);
    return this.size < initialSize;
  }

  private deleteNode(node: AVLNode<T> | null, key: string): AVLNode<T> | null {
    if (node === null) {
      return null;
    }

    if (key < node.key) {
      node.left = this.deleteNode(node.left, key);
    } else if (key > node.key) {
      node.right = this.deleteNode(node.right, key);
    } else {
      this.size--;

      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      }

      const successor = this.findMinNode(node.right);
      node.key = successor.key;
      node.data = successor.data;
      this.size++;
      node.right = this.deleteNode(node.right, successor.key);
    }

    return this.balance(node);
  }

  private findMinNode(node: AVLNode<T>): AVLNode<T> {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }


  public inOrder(): T[] {
    const result: T[] = [];
    this.inOrderTraversal(this.root, (data) => result.push(data));
    return result;
  }


  public inOrderEntries(): { key: string; data: T }[] {
    const result: { key: string; data: T }[] = [];
    this.inOrderTraversalWithNode(this.root, (node) => {
      result.push({ key: node.key, data: node.data });
    });
    return result;
  }

  private inOrderTraversal(node: AVLNode<T> | null, callback: (data: T) => void): void {
    if (node !== null) {
      this.inOrderTraversal(node.left, callback);
      callback(node.data);
      this.inOrderTraversal(node.right, callback);
    }
  }

  private inOrderTraversalWithNode(node: AVLNode<T> | null, callback: (node: AVLNode<T>) => void): void {
    if (node !== null) {
      this.inOrderTraversalWithNode(node.left, callback);
      callback(node);
      this.inOrderTraversalWithNode(node.right, callback);
    }
  }


  public isBalanced(): boolean {
    return this.verifyNodeInvariants(this.root) !== -1;
  }

  private verifyNodeInvariants(node: AVLNode<T> | null): number {
    if (node === null) return 0;

    const leftHeight = this.verifyNodeInvariants(node.left);
    if (leftHeight === -1) return -1;

    const rightHeight = this.verifyNodeInvariants(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) {
      return -1;
    }

    const expectedHeight = 1 + Math.max(leftHeight, rightHeight);
    if (node.height !== expectedHeight) {
      return -1;
    }

    return expectedHeight;
  }


  public getHeightOfTree(): number {
    return this.getHeight(this.root);
  }

  public getSize(): number {
    return this.size;
  }


  public isEmpty(): boolean {
    return this.root === null;
  }


  public clear(): void {
    this.root = null;
    this.size = 0;
  }
}
