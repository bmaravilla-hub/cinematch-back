import { describe, it, expect } from 'vitest';
import { HashTable } from '../../structures/HashTable';

describe('Estructura 1: Tabla Hash (HashTable)', () => {
  it('debe insertar y recuperar pares clave-valor correctamente', () => {
    const table = new HashTable<string, { id: string; name: string }>(8);
    table.set('u001', { id: 'u001', name: 'Ana' });
    table.set('u002', { id: 'u002', name: 'Bruno' });

    expect(table.getSize()).toBe(2);
    expect(table.get('u001')).toEqual({ id: 'u001', name: 'Ana' });
    expect(table.get('u002')).toEqual({ id: 'u002', name: 'Bruno' });
  });

  it('debe retornar undefined al buscar una clave inexistente', () => {
    const table = new HashTable<string, number>(16);
    table.set('P1', 100);

    expect(table.get('P999')).toBeUndefined();
    expect(table.has('P999')).toBe(false);
  });

  it('debe actualizar el valor si la clave ya existe sin incrementar el tamaño', () => {
    const table = new HashTable<string, number>(16);
    table.set('calificacion_u1_m1', 4);
    expect(table.get('calificacion_u1_m1')).toBe(4);
    expect(table.getSize()).toBe(1);

    table.set('calificacion_u1_m1', 5);
    expect(table.get('calificacion_u1_m1')).toBe(5);
    expect(table.getSize()).toBe(1);
  });

  it('debe eliminar elementos existentes correctamente (inicio, medio y final)', () => {
    const table = new HashTable<string, string>(4);
    table.set('k1', 'val1');
    table.set('k2', 'val2');
    table.set('k3', 'val3');

    expect(table.remove('k2')).toBe(true);
    expect(table.get('k2')).toBeUndefined();
    expect(table.getSize()).toBe(2);

    expect(table.remove('k_inexistente')).toBe(false);
    expect(table.getSize()).toBe(2);
  });

  it('debe manejar colisiones explícitas mediante encadenamiento separado sin perder datos', () => {
    // Tabla pequeña para forzar colisiones deliberadas
    const table = new HashTable<string, string>(4);
    
    // Insertamos múltiples elementos
    const items = [
      ['a', 'Alfa'],
      ['b', 'Bravo'],
      ['c', 'Charlie'],
      ['d', 'Delta'],
      ['e', 'Echo'],
      ['f', 'Foxtrot']
    ];

    for (const [k, v] of items) {
      table.set(k, v);
    }

    // Comprobamos que todos los elementos se recuperan con precisión
    for (const [k, v] of items) {
      expect(table.get(k)).toBe(v);
    }
  });

  it('debe redimensionar la tabla (resize) cuando se supera el umbral del factor de carga (0.75)', () => {
    const initialCap = 4;
    const table = new HashTable<string, number>(initialCap);

    expect(table.getCapacity()).toBe(4);

    // Insertar 3 elementos: factor de carga = 3/4 = 0.75 -> Dispara redimensionamiento
    table.set('item1', 10);
    table.set('item2', 20);
    table.set('item3', 30);

    expect(table.getCapacity()).toBeGreaterThan(initialCap);
    expect(table.getSize()).toBe(3);

    // Todos los elementos siguen existiendo tras el redimensionamiento
    expect(table.get('item1')).toBe(10);
    expect(table.get('item2')).toBe(20);
    expect(table.get('item3')).toBe(30);
  });

  it('debe lanzar error si se intenta insertar una clave nula o indefinida', () => {
    const table = new HashTable<any, string>(8);
    expect(() => table.set(null, 'valor')).toThrow('La clave no puede ser nula o indefinida');
    expect(() => table.set(undefined, 'valor')).toThrow('La clave no puede ser nula o indefinida');
  });

  it('debe enumerar correctamente keys(), values() y entries()', () => {
    const table = new HashTable<string, number>(8);
    table.set('x', 1);
    table.set('y', 2);
    table.set('z', 3);

    expect(table.keys().sort()).toEqual(['x', 'y', 'z']);
    expect(table.values().sort()).toEqual([1, 2, 3]);
    expect(table.entries().length).toBe(3);
  });

  it('debe verificar has() correctamente incluso si el valor almacenado es undefined', () => {
    const table = new HashTable<string, any>(8);
    table.set('clave_con_undefined', undefined);

    expect(table.has('clave_con_undefined')).toBe(true);
    expect(table.get('clave_con_undefined')).toBeUndefined();
    expect(table.has('clave_inexistente')).toBe(false);
  });
});
