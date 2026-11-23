import { HashTable } from './HashTable';
import { LinkedList } from './LinkedList';
import { Queue } from './Queue';

export type NodeType = 'user' | 'movie';

export interface GraphEdge {
  targetId: string;
  weight: number; // Escala 1 a 5
}

export class BipartiteGraph {
  private nodeTypes: HashTable<string, NodeType>;
  private adjacencyLists: HashTable<string, LinkedList<GraphEdge>>;
  private edgeCount: number = 0;

  constructor() {
    this.nodeTypes = new HashTable<string, NodeType>(32);
    this.adjacencyLists = new HashTable<string, LinkedList<GraphEdge>>(32);
  }

  public addNode(id: string, type: NodeType): void {
    if (!id || id.trim() === '') {
      throw new Error("El identificador del nodo no puede estar vacío");
    }
    if (this.nodeTypes.has(id)) {
      if (this.nodeTypes.get(id) !== type) {
        throw new Error(`El nodo ${id} ya existe con un tipo diferente`);
      }
      return;
    }

    this.nodeTypes.set(id, type);
    this.adjacencyLists.set(id, new LinkedList<GraphEdge>());
  }

  public hasNode(id: string): boolean {
    return this.nodeTypes.has(id);
  }


  public getNodeType(id: string): NodeType | undefined {
    return this.nodeTypes.get(id);
  }

  public removeNode(id: string): boolean {
    if (!this.nodeTypes.has(id)) return false;
    const edges = this.adjacencyLists.get(id);
    if (edges && !edges.isEmpty()) {
      edges.forEach((edge: GraphEdge) => {
        const targetList = this.adjacencyLists.get(edge.targetId);
        if (targetList) {
          targetList.remove((e: GraphEdge) => e.targetId === id);
          if (this.edgeCount > 0) this.edgeCount--;
        }
      });
    }
    this.adjacencyLists.remove(id);
    this.nodeTypes.remove(id);
    return true;
  }

  public addEdge(userId: string, movieId: string, weight: number): void {
    if (weight < 1 || weight > 5 || !Number.isFinite(weight)) {
      throw new Error(`Calificación inválida: ${weight}. Debe ser un número entre 1 y 5.`);
    }

    if (!this.hasNode(userId)) {
      this.addNode(userId, 'user');
    }
    if (!this.hasNode(movieId)) {
      this.addNode(movieId, 'movie');
    }

    const typeUser = this.nodeTypes.get(userId);
    const typeMovie = this.nodeTypes.get(movieId);

    if (typeUser !== 'user' || typeMovie !== 'movie') {
      throw new Error(
        `Violación de grafo bipartito: ${userId} (${typeUser}) y ${movieId} (${typeMovie}) no forman una conexión Usuario-Película válida.`
      );
    }

    const userEdges = this.adjacencyLists.get(userId)!;
    const movieEdges = this.adjacencyLists.get(movieId)!;

    let existingInUser = false;
    userEdges.forEach((edge: GraphEdge) => {
      if (edge.targetId === movieId) {
        edge.weight = weight; // Actualización
        existingInUser = true;
      }
    });

    movieEdges.forEach((edge: GraphEdge) => {
      if (edge.targetId === userId) {
        edge.weight = weight; // Actualización
      }
    });

    if (!existingInUser) {
      userEdges.append({ targetId: movieId, weight });
      movieEdges.append({ targetId: userId, weight });
      this.edgeCount++;
    }
  }


  public removeEdge(userId: string, movieId: string): boolean {
    const userEdges = this.adjacencyLists.get(userId);
    const movieEdges = this.adjacencyLists.get(movieId);
    if (!userEdges || !movieEdges) return false;

    const removedFromUser = userEdges.remove((e: GraphEdge) => e.targetId === movieId);
    const removedFromMovie = movieEdges.remove((e: GraphEdge) => e.targetId === userId);

    if (removedFromUser || removedFromMovie) {
      if (this.edgeCount > 0) {
        this.edgeCount--;
      }
      return true;
    }
    return false;
  }


  public getWeight(userId: string, movieId: string): number | null {
    const userEdges = this.adjacencyLists.get(userId);
    if (!userEdges) return null;

    const edge = userEdges.find((e: GraphEdge) => e.targetId === movieId);
    return edge ? edge.weight : null;
  }


  public getMoviesRatedByUser(userId: string): { movieId: string; score: number }[] {
    const edges = this.adjacencyLists.get(userId);
    if (!edges) return [];

    const result: { movieId: string; score: number }[] = [];
    edges.forEach((edge: GraphEdge) => {
      result.push({ movieId: edge.targetId, score: edge.weight });
    });
    return result;
  }

  public getUsersWhoRatedMovie(movieId: string): { userId: string; score: number }[] {
    const edges = this.adjacencyLists.get(movieId);
    if (!edges) return [];

    const result: { userId: string; score: number }[] = [];
    edges.forEach((edge: GraphEdge) => {
      result.push({ userId: edge.targetId, score: edge.weight });
    });
    return result;
  }


  public bfs(startNodeId: string, maxDepth: number = 2): { id: string; depth: number }[] {
    if (!this.hasNode(startNodeId)) {
      return [];
    }

    const visited = new HashTable<string, boolean>(32);
    const queue = new Queue<{ id: string; depth: number }>();
    const discovered: { id: string; depth: number }[] = [];

    visited.set(startNodeId, true);
    queue.enqueue({ id: startNodeId, depth: 0 });

    while (!queue.isEmpty()) {
      const current = queue.dequeue()!;
      if (current.id !== startNodeId) {
        discovered.push(current);
      }

      if (current.depth < maxDepth) {
        const edges = this.adjacencyLists.get(current.id);
        if (edges) {
          edges.forEach((edge: GraphEdge) => {
            if (!visited.has(edge.targetId)) {
              visited.set(edge.targetId, true);
              queue.enqueue({ id: edge.targetId, depth: current.depth + 1 });
            }
          });
        }
      }
    }

    return discovered;
  }

  public getSharedCandidateUsers(userId: string): string[] {
    if (!this.hasNode(userId)) return [];
    const bfsResult = this.bfs(userId, 2);
    const candidateUsers: string[] = [];

    for (const item of bfsResult) {
      if (item.depth === 2 && this.nodeTypes.get(item.id) === 'user' && item.id !== userId) {
        candidateUsers.push(item.id);
      }
    }

    return candidateUsers;
  }


  public getAllUserNodes(): string[] {
    const result: string[] = [];
    for (const [id, type] of this.nodeTypes.entries()) {
      if (type === 'user') {
        result.push(id);
      }
    }
    return result;
  }


  public getAllMovieNodes(): string[] {
    const result: string[] = [];
    for (const [id, type] of this.nodeTypes.entries()) {
      if (type === 'movie') {
        result.push(id);
      }
    }
    return result;
  }


  public getEdgeCount(): number {
    return this.edgeCount;
  }


  public getNodeCount(): number {
    return this.nodeTypes.getSize();
  }
}
