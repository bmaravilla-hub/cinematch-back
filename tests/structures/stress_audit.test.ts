import { describe, it, expect } from 'vitest';
import { HashTable } from '../../structures/HashTable';
import { LinkedList } from '../../structures/LinkedList';
import { BipartiteGraph } from '../../structures/BipartiteGraph';
import { AVLTree } from '../../structures/AVLTree';
import { PriorityQueue } from '../../structures/PriorityQueue';

describe('Auditoría Profunda de Estructuras de Datos (Casos Límite e Invariantes)', () => {
  describe('HashTable - Casos Límite y Escalabilidad', () => {
    it('debe soportar redimensionamientos sucesivos (4 -> 8 -> 16 -> 32 -> 64 -> 128) sin perder elementos', () => {
      const table = new HashTable<string, number>(4);
      const count = 100;

      for (let i = 0; i < count; i++) {
        table.set(`key_${i}`, i * 10);
      }

      expect(table.getSize()).toBe(count);
      expect(table.getCapacity()).toBeGreaterThanOrEqual(128);

      for (let i = 0; i < count; i++) {
        expect(table.get(`key_${i}`)).toBe(i * 10);
      }
    });

    it('debe mantener tamaño 1 tras 50 actualizaciones consecutivas de la misma clave', () => {
      const table = new HashTable<string, number>(8);
      for (let i = 1; i <= 50; i++) {
        table.set('misma_clave', i);
      }
      expect(table.getSize()).toBe(1);
      expect(table.get('misma_clave')).toBe(50);
    });

    it('debe manejar correctamente la clave de cadena vacía ""', () => {
      const table = new HashTable<string, string>(8);
      table.set('', 'valor_vacio');
      expect(table.has('')).toBe(true);
      expect(table.get('')).toBe('valor_vacio');
      expect(table.remove('')).toBe(true);
      expect(table.has('')).toBe(false);
    });
  });

  describe('LinkedList - Casos Límite de Punteros Head y Tail', () => {
    it('debe actualizar correctamente tail al eliminar elementos en cualquier posición', () => {
      const list = new LinkedList<string>();
      list.append('A');
      list.append('B');
      list.append('C');

      // Eliminar cola ('C')
      expect(list.remove((x) => x === 'C')).toBe(true);
      expect(list.getSize()).toBe(2);
      expect(list.toArray()).toEqual(['A', 'B']);

      // Insertar nuevo elemento tras eliminar cola: debe enlazarse tras 'B'
      list.append('D');
      expect(list.toArray()).toEqual(['A', 'B', 'D']);
      expect(list.getSize()).toBe(3);
    });

    it('debe vaciar la lista completamente y restaurar tail = null', () => {
      const list = new LinkedList<number>();
      list.append(1);
      expect(list.remove((x) => x === 1)).toBe(true);
      expect(list.isEmpty()).toBe(true);
      expect(list.getSize()).toBe(0);

      // Inserción posterior tras vaciado
      list.append(99);
      expect(list.toArray()).toEqual([99]);
      expect(list.getSize()).toBe(1);
    });
  });

  describe('BipartiteGraph - Casos Límite y Conectividad', () => {
    it('no debe incluir al propio usuario en getSharedCandidateUsers', () => {
      const graph = new BipartiteGraph();
      graph.addEdge('u1', 'm1', 5);
      graph.addEdge('u1', 'm2', 4);

      const candidates = graph.getSharedCandidateUsers('u1');
      expect(candidates).not.toContain('u1');
      expect(candidates.length).toBe(0);
    });

    it('debe aislar usuarios con conjuntos disjuntos de películas calificadas', () => {
      const graph = new BipartiteGraph();
      // uA califica m1, m2
      graph.addEdge('uA', 'm1', 5);
      graph.addEdge('uA', 'm2', 4);

      // uB califica m3, m4
      graph.addEdge('uB', 'm3', 5);
      graph.addEdge('uB', 'm4', 3);

      expect(graph.getSharedCandidateUsers('uA')).toEqual([]);
      expect(graph.getSharedCandidateUsers('uB')).toEqual([]);
    });
  });

  describe('AVLTree - Eliminación y Mantenimiento de Invariantes hasta Vaciar', () => {
    it('debe mantenerse estrictamente balanceado tras inserción y eliminación masiva', () => {
      const tree = new AVLTree<number>();
      const elements = [50, 25, 75, 10, 30, 60, 90, 5, 15, 27, 35, 55, 65, 80, 95];

      for (const val of elements) {
        tree.insert(`k_${val.toString().padStart(3, '0')}`, val);
        expect(tree.isBalanced()).toBe(true);
      }

      expect(tree.getSize()).toBe(elements.length);

      // Eliminar elementos uno a uno y verificar invariante en cada paso
      for (const val of elements) {
        expect(tree.delete(`k_${val.toString().padStart(3, '0')}`)).toBe(true);
        expect(tree.isBalanced()).toBe(true);
      }

      expect(tree.isEmpty()).toBe(true);
      expect(tree.getSize()).toBe(0);
    });
  });

  describe('PriorityQueue - Desempate Masivo y Monotonía Estricta', () => {
    it('debe extraer 50 elementos aleatorios en orden estrictamente decreciente', () => {
      const pq = new PriorityQueue<number>();
      const priorities = [12, 85, 34, 99, 1, 45, 67, 88, 23, 56, 78, 90, 11, 4, 95];

      for (const p of priorities) {
        pq.insert(p, p);
      }

      let prevPriority = Infinity;
      while (!pq.isEmpty()) {
        const item = pq.extractMax();
        expect(item).toBeDefined();
        expect(item!.priority).toBeLessThanOrEqual(prevPriority);
        prevPriority = item!.priority;
      }
    });

    it('debe preservar orden FIFO determinista ante 20 elementos con prioridad idéntica', () => {
      const pq = new PriorityQueue<string>();
      const count = 20;

      for (let i = 0; i < count; i++) {
        pq.insert(`elem_${i}`, 5.0);
      }

      for (let i = 0; i < count; i++) {
        const item = pq.extractMax();
        expect(item?.element).toBe(`elem_${i}`);
      }
      expect(pq.isEmpty()).toBe(true);
    });
  });
});
