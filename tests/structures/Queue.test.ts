import { describe, it, expect } from 'vitest';
import { Queue } from '../../structures/Queue';

describe('Estructura Auxiliar: Cola FIFO (Queue)', () => {
  it('debe iniciar vacía con tamaño 0', () => {
    const queue = new Queue<string>();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.getSize()).toBe(0);
    expect(queue.peek()).toBeUndefined();
    expect(queue.dequeue()).toBeUndefined();
  });

  it('debe encolar (enqueue) y consultar el frente (peek) en tiempo O(1)', () => {
    const queue = new Queue<number>();
    queue.enqueue(10);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.getSize()).toBe(1);
    expect(queue.peek()).toBe(10);

    queue.enqueue(20);
    expect(queue.getSize()).toBe(2);
    expect(queue.peek()).toBe(10); // El frente sigue siendo el primero
  });

  it('debe desencolar (dequeue) en estricto orden First-In, First-Out (FIFO)', () => {
    const queue = new Queue<string>();
    queue.enqueue('primer_elemento');
    queue.enqueue('segundo_elemento');
    queue.enqueue('tercer_elemento');

    expect(queue.dequeue()).toBe('primer_elemento');
    expect(queue.dequeue()).toBe('segundo_elemento');
    expect(queue.dequeue()).toBe('tercer_elemento');
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.isEmpty()).toBe(true);
  });

  it('debe permitir iteración nativa con for...of y toArray()', () => {
    const queue = new Queue<number>();
    [1, 2, 3, 4, 5].forEach((n) => queue.enqueue(n));

    expect(queue.toArray()).toEqual([1, 2, 3, 4, 5]);

    const items: number[] = [];
    for (const val of queue) {
      items.push(val);
    }
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('debe vaciar la cola con clear() y aceptar nuevas inserciones posteriores', () => {
    const queue = new Queue<string>();
    queue.enqueue('A');
    queue.enqueue('B');
    expect(queue.getSize()).toBe(2);

    queue.clear();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.getSize()).toBe(0);
    expect(queue.peek()).toBeUndefined();

    queue.enqueue('C');
    expect(queue.getSize()).toBe(1);
    expect(queue.peek()).toBe('C');
    expect(queue.dequeue()).toBe('C');
  });
});
