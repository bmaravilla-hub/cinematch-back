import { describe, it, expect } from 'vitest';
import { PriorityQueue } from '../../structures/PriorityQueue';

describe('Estructura 5: Cola de Prioridad Max-Heap (PriorityQueue)', () => {
  it('debe iniciar vacía con tamaño 0', () => {
    const pq = new PriorityQueue<string>();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.getSize()).toBe(0);
    expect(pq.peek()).toBeUndefined();
    expect(pq.extractMax()).toBeUndefined();
  });

  it('debe mantener en la cima el elemento de mayor prioridad (peek)', () => {
    const pq = new PriorityQueue<string>();
    pq.insert('tarea_baja', 1.5);
    pq.insert('tarea_alta', 4.8);
    pq.insert('tarea_media', 3.0);

    expect(pq.getSize()).toBe(3);
    expect(pq.peek()?.element).toBe('tarea_alta');
    expect(pq.peek()?.priority).toBe(4.8);
  });

  it('debe extraer elementos en orden estrictamente decreciente de prioridad (extractMax)', () => {
    const pq = new PriorityQueue<string>();
    const data = [
      { element: 'UsuarioA', priority: 0.45 },
      { element: 'UsuarioB', priority: 0.95 },
      { element: 'UsuarioC', priority: 0.80 },
      { element: 'UsuarioD', priority: 0.10 },
      { element: 'UsuarioE', priority: 0.88 }
    ];

    for (const item of data) {
      pq.insert(item.element, item.priority);
    }

    const extracted: string[] = [];
    while (!pq.isEmpty()) {
      const max = pq.extractMax();
      if (max) extracted.push(max.element);
    }

    expect(extracted).toEqual(['UsuarioB', 'UsuarioE', 'UsuarioC', 'UsuarioA', 'UsuarioD']);
  });

  it('debe desempatar de forma determinista (FIFO) ante prioridades idénticas', () => {
    const pq = new PriorityQueue<string>();
    // Tres películas con calificación promedio idéntica (4.5)
    pq.insert('Pelicula_1', 4.5);
    pq.insert('Pelicula_2', 4.5);
    pq.insert('Pelicula_3', 4.5);

    const first = pq.extractMax();
    const second = pq.extractMax();
    const third = pq.extractMax();

    expect(first?.element).toBe('Pelicula_1');
    expect(second?.element).toBe('Pelicula_2');
    expect(third?.element).toBe('Pelicula_3');
  });

  it('debe rechazar prioridades que no sean números finitos válidos', () => {
    const pq = new PriorityQueue<string>();
    expect(() => pq.insert('item', NaN)).toThrow(/Prioridad inválida/);
    expect(() => pq.insert('item', Infinity)).toThrow(/Prioridad inválida/);
  });

  it('debe permitir limpiar la cola con clear()', () => {
    const pq = new PriorityQueue<number>();
    pq.insert(1, 10);
    pq.insert(2, 20);
    expect(pq.getSize()).toBe(2);

    pq.clear();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.getSize()).toBe(0);
    expect(pq.extractMax()).toBeUndefined();
  });
});
