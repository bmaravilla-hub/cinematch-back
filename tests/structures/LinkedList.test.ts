import { describe, it, expect } from 'vitest';
import { LinkedList } from '../../structures/LinkedList';

describe('Estructura 2: Lista Simplemente Enlazada (LinkedList)', () => {
  it('debe iniciar vacía con tamaño 0', () => {
    const list = new LinkedList<number>();
    expect(list.isEmpty()).toBe(true);
    expect(list.getSize()).toBe(0);
    expect(list.getHead()).toBeNull();
  });

  it('debe insertar elementos al final (append) y al frente (prepend)', () => {
    const list = new LinkedList<string>();
    list.append('B');
    list.append('C');
    list.prepend('A');

    expect(list.getSize()).toBe(3);
    expect(list.toArray()).toEqual(['A', 'B', 'C']);
  });

  it('debe permitir la iteración con for...of y forEach', () => {
    const list = new LinkedList<number>();
    list.append(10);
    list.append(20);
    list.append(30);

    const accumulated: number[] = [];
    for (const val of list) {
      accumulated.push(val);
    }
    expect(accumulated).toEqual([10, 20, 30]);

    const forEachItems: number[] = [];
    list.forEach((val) => forEachItems.push(val * 2));
    expect(forEachItems).toEqual([20, 40, 60]);
  });

  it('debe buscar elementos usando find() con un predicado', () => {
    interface RatingItem {
      userId: string;
      movieId: string;
      score: number;
    }

    const list = new LinkedList<RatingItem>();
    list.append({ userId: 'u1', movieId: 'm1', score: 5 });
    list.append({ userId: 'u1', movieId: 'm2', score: 3 });

    const found = list.find((r) => r.movieId === 'm2');
    expect(found).not.toBeNull();
    expect(found?.score).toBe(3);

    const notFound = list.find((r) => r.movieId === 'm999');
    expect(notFound).toBeNull();
  });

  it('debe actualizar elementos existentes con update()', () => {
    const list = new LinkedList<{ id: string; val: number }>();
    list.append({ id: 'item1', val: 100 });
    list.append({ id: 'item2', val: 200 });

    const updated = list.update((item) => item.id === 'item1', { id: 'item1', val: 150 });
    expect(updated).toBe(true);

    const found = list.find((item) => item.id === 'item1');
    expect(found?.val).toBe(150);
  });

  it('debe eliminar elementos correctamente en cabeza, medio y cola', () => {
    const list = new LinkedList<string>();
    list.append('A');
    list.append('B');
    list.append('C');
    list.append('D');

    // Eliminar del medio ('B')
    expect(list.remove((x) => x === 'B')).toBe(true);
    expect(list.toArray()).toEqual(['A', 'C', 'D']);
    expect(list.getSize()).toBe(3);

    // Eliminar de la cabeza ('A')
    expect(list.remove((x) => x === 'A')).toBe(true);
    expect(list.toArray()).toEqual(['C', 'D']);
    expect(list.getSize()).toBe(2);

    // Eliminar de la cola ('D')
    expect(list.remove((x) => x === 'D')).toBe(true);
    expect(list.toArray()).toEqual(['C']);
    expect(list.getSize()).toBe(1);

    // Eliminar último elemento restante
    expect(list.remove((x) => x === 'C')).toBe(true);
    expect(list.isEmpty()).toBe(true);
    expect(list.getSize()).toBe(0);

    // Intentar eliminar de lista vacía
    expect(list.remove((x) => x === 'Z')).toBe(false);
  });

  it('debe evitar duplicados de calificaciones para la misma combinación de usuario y película', () => {
    interface RatingRecord {
      userId: string;
      movieId: string;
      score: number;
    }

    const list = new LinkedList<RatingRecord>();

    // Primera inserción
    list.insertOrUpdate(
      (r) => r.userId === 'u001' && r.movieId === 'm101',
      { userId: 'u001', movieId: 'm101', score: 4 }
    );
    expect(list.getSize()).toBe(1);
    expect(list.toArray()[0].score).toBe(4);

    // Inserción con misma clave (actualización según RN04)
    list.insertOrUpdate(
      (r) => r.userId === 'u001' && r.movieId === 'm101',
      { userId: 'u001', movieId: 'm101', score: 5 },
      true
    );
    expect(list.getSize()).toBe(1); // No incrementa tamaño, sustituye
    expect(list.toArray()[0].score).toBe(5);

    // Inserción de película diferente para el mismo usuario
    list.insertOrUpdate(
      (r) => r.userId === 'u001' && r.movieId === 'm102',
      { userId: 'u001', movieId: 'm102', score: 3 }
    );
    expect(list.getSize()).toBe(2);
  });
});
