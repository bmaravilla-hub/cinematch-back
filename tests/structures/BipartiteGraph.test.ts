import { describe, it, expect } from 'vitest';
import { BipartiteGraph } from '../../structures/BipartiteGraph';

describe('Estructura 3: Grafo Bipartito Ponderado No Dirigido (BipartiteGraph)', () => {
  it('debe registrar nodos y validar sus particiones correctamente', () => {
    const graph = new BipartiteGraph();
    graph.addNode('u1', 'user');
    graph.addNode('m1', 'movie');

    expect(graph.hasNode('u1')).toBe(true);
    expect(graph.hasNode('m1')).toBe(true);
    expect(graph.getNodeType('u1')).toBe('user');
    expect(graph.getNodeType('m1')).toBe('movie');
    expect(graph.getNodeCount()).toBe(2);
  });

  it('debe rechazar aristas entre nodos de la misma partición (propiedad bipartita estricta)', () => {
    const graph = new BipartiteGraph();
    graph.addNode('u1', 'user');
    graph.addNode('u2', 'user');
    graph.addNode('m1', 'movie');
    graph.addNode('m2', 'movie');

    // Conexión Usuario-Usuario prohibida
    expect(() => graph.addEdge('u1', 'u2', 5)).toThrow(/Violación de grafo bipartito/);

    // Conexión Película-Película prohibida
    expect(() => graph.addEdge('m1', 'm2', 4)).toThrow(/Violación de grafo bipartito/);
  });

  it('debe rechazar calificaciones fuera del rango de 1 a 5 (RN03)', () => {
    const graph = new BipartiteGraph();
    expect(() => graph.addEdge('u1', 'm1', 0)).toThrow(/Calificación inválida/);
    expect(() => graph.addEdge('u1', 'm1', 6)).toThrow(/Calificación inválida/);
    expect(() => graph.addEdge('u1', 'm1', -1)).toThrow(/Calificación inválida/);
  });

  it('debe mantener consistencia simétrica no dirigida entre Usuario y Película', () => {
    const graph = new BipartiteGraph();
    graph.addEdge('u1', 'm1', 5);

    // Consultar peso desde u1 y m1
    expect(graph.getWeight('u1', 'm1')).toBe(5);

    // Lista de películas de u1
    const userMovies = graph.getMoviesRatedByUser('u1');
    expect(userMovies).toEqual([{ movieId: 'm1', score: 5 }]);

    // Lista de usuarios de m1
    const movieUsers = graph.getUsersWhoRatedMovie('m1');
    expect(movieUsers).toEqual([{ userId: 'u1', score: 5 }]);

    expect(graph.getEdgeCount()).toBe(1);
  });

  it('debe actualizar el peso sin duplicar aristas cuando se re-califica (RN04)', () => {
    const graph = new BipartiteGraph();
    graph.addEdge('u1', 'm1', 3);
    expect(graph.getWeight('u1', 'm1')).toBe(3);
    expect(graph.getEdgeCount()).toBe(1);

    // Nueva calificación sobre la misma película
    graph.addEdge('u1', 'm1', 5);
    expect(graph.getWeight('u1', 'm1')).toBe(5);
    expect(graph.getEdgeCount()).toBe(1); // Se conserva única arista

    const userMovies = graph.getMoviesRatedByUser('u1');
    expect(userMovies.length).toBe(1);
    expect(userMovies[0].score).toBe(5);
  });

  it('debe identificar usuarios candidatos con películas en común (getSharedCandidateUsers)', () => {
    const graph = new BipartiteGraph();
    // U1 califica P1 y P2
    graph.addEdge('U1', 'P1', 5);
    graph.addEdge('U1', 'P2', 3);

    // U2 califica P1 (en común con U1) y P3
    graph.addEdge('U2', 'P1', 4);
    graph.addEdge('U2', 'P3', 5);

    // U3 califica P2 (en común con U1)
    graph.addEdge('U3', 'P2', 4);

    // U4 califica sólo P4 (sin películas en común con U1)
    graph.addEdge('U4', 'P4', 5);

    const candidatesU1 = graph.getSharedCandidateUsers('U1');
    expect(candidatesU1.sort()).toEqual(['U2', 'U3']);

    // U4 no tiene películas compartidas con nadie más que sí mismo
    const candidatesU4 = graph.getSharedCandidateUsers('U4');
    expect(candidatesU4).toEqual([]);
  });
});
