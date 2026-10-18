import { describe, it, expect } from 'vitest';
import { AVLTree } from '../../structures/AVLTree';

describe('Estructura 4: Árbol AVL Balanceado (AVLTree)', () => {
  it('debe iniciar vacío con altura 0 y tamaño 0', () => {
    const tree = new AVLTree<string>();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.getSize()).toBe(0);
    expect(tree.getHeightOfTree()).toBe(0);
  });

  it('debe realizar Rotación Simple a la Derecha (LL) cuando se desbalancea hacia la izquierda', () => {
    const tree = new AVLTree<string>();
    // Inserción en orden descendente: 30, 20, 10 provoca caso LL en nodo 30
    tree.insert('30', 'Treinta');
    tree.insert('20', 'Veinte');
    tree.insert('10', 'Diez');

    expect(tree.getSize()).toBe(3);
    expect(tree.isBalanced()).toBe(true);
    // Tras rotación LL, la raíz debe ser '20' y la altura debe ser 2
    expect(tree.getHeightOfTree()).toBe(2);
    expect(tree.inOrder()).toEqual(['Diez', 'Veinte', 'Treinta']);
  });

  it('debe realizar Rotación Simple a la Izquierda (RR) cuando se desbalancea hacia la derecha', () => {
    const tree = new AVLTree<string>();
    // Inserción en orden ascendente: 10, 20, 30 provoca caso RR en nodo 10
    tree.insert('10', 'Diez');
    tree.insert('20', 'Veinte');
    tree.insert('30', 'Treinta');

    expect(tree.getSize()).toBe(3);
    expect(tree.isBalanced()).toBe(true);
    // Tras rotación RR, la raíz es '20' y la altura es 2
    expect(tree.getHeightOfTree()).toBe(2);
    expect(tree.inOrder()).toEqual(['Diez', 'Veinte', 'Treinta']);
  });

  it('debe realizar Rotación Doble Izquierda-Derecha (LR)', () => {
    const tree = new AVLTree<string>();
    // Inserción 30, 10, 20 provoca caso LR
    tree.insert('30', 'Treinta');
    tree.insert('10', 'Diez');
    tree.insert('20', 'Veinte');

    expect(tree.getSize()).toBe(3);
    expect(tree.isBalanced()).toBe(true);
    expect(tree.getHeightOfTree()).toBe(2);
    expect(tree.inOrder()).toEqual(['Diez', 'Veinte', 'Treinta']);
  });

  it('debe realizar Rotación Doble Derecha-Izquierda (RL)', () => {
    const tree = new AVLTree<string>();
    // Inserción 10, 30, 20 provoca caso RL
    tree.insert('10', 'Diez');
    tree.insert('30', 'Treinta');
    tree.insert('20', 'Veinte');

    expect(tree.getSize()).toBe(3);
    expect(tree.isBalanced()).toBe(true);
    expect(tree.getHeightOfTree()).toBe(2);
    expect(tree.inOrder()).toEqual(['Diez', 'Veinte', 'Treinta']);
  });

  it('debe mantener el balance estricto (|factor| <= 1) tras múltiples inserciones secuenciales', () => {
    const tree = new AVLTree<number>();
    // Insertamos 31 elementos en orden estrictamente ascendente (un BST normal tendría altura 31)
    for (let i = 1; i <= 31; i++) {
      tree.insert(`key_${i.toString().padStart(3, '0')}`, i);
    }

    expect(tree.getSize()).toBe(31);
    expect(tree.isBalanced()).toBe(true);
    // En un AVL con 31 nodos, la altura máxima es <= 6 (ceil(1.44 * log2(32)))
    expect(tree.getHeightOfTree()).toBeLessThanOrEqual(6);
  });

  it('debe eliminar nodos (hojas, con 1 hijo y con 2 hijos) preservando el balance', () => {
    const tree = new AVLTree<string>();
    const keys = ['d', 'b', 'f', 'a', 'c', 'e', 'g'];
    for (const k of keys) {
      tree.insert(k, k.toUpperCase());
    }

    expect(tree.getSize()).toBe(7);
    expect(tree.isBalanced()).toBe(true);

    // Eliminar hoja ('a')
    expect(tree.delete('a')).toBe(true);
    expect(tree.search('a')).toBeNull();
    expect(tree.isBalanced()).toBe(true);
    expect(tree.getSize()).toBe(6);

    // Eliminar nodo con 2 hijos ('f')
    expect(tree.delete('f')).toBe(true);
    expect(tree.search('f')).toBeNull();
    expect(tree.isBalanced()).toBe(true);
    expect(tree.getSize()).toBe(5);

    // Inorden debe permanecer ordenado
    expect(tree.inOrder()).toEqual(['B', 'C', 'D', 'E', 'G']);
  });

  it('debe utilizar clave compuesta titulo#id para permitir películas con el mismo título sin colisionar', () => {
    interface MovieEntry {
      id: string;
      title: string;
      year: number;
    }

    const tree = new AVLTree<MovieEntry>();

    // Dos versiones de "Dune" (1984 y 2021)
    const movie1: MovieEntry = { id: 'm001', title: 'Dune', year: 1984 };
    const movie2: MovieEntry = { id: 'm002', title: 'Dune', year: 2021 };

    const key1 = AVLTree.buildMovieKey(movie1.title, movie1.id);
    const key2 = AVLTree.buildMovieKey(movie2.title, movie2.id);

    expect(key1).toBe('dune#m001');
    expect(key2).toBe('dune#m002');
    expect(key1).not.toBe(key2);

    tree.insert(key1, movie1);
    tree.insert(key2, movie2);

    expect(tree.getSize()).toBe(2);
    expect(tree.search(key1)?.year).toBe(1984);
    expect(tree.search(key2)?.year).toBe(2021);

    const moviesInOrder = tree.inOrder();
    expect(moviesInOrder.length).toBe(2);
  });
});
