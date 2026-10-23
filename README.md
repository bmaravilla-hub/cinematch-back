# 🎬 CineMatch Backend — Motor de Recomendación y Estructuras de Datos

> **Universidad Don Bosco — Facultad de Ingeniería**  
> **Asignatura:** Programación con Estructuras de Datos (PED941) — Grupo G01T  
> **Docente:** Ing. Carmen Celia Morales Samayoa  
> **Fase II: Avance Funcional — Backend Independiente**  
> **Calificación Fase I:** 10.0 / 10.0  

---

## 👥 Equipo de Desarrollo

| Integrante | Carnet | Usuario GitHub | Correo Electrónico |
| :--- | :--- | :--- | :--- |
| **Blanca Esmeralda Maravilla Cruz** | MC240030 | [@bmaravilla-hub](https://github.com/bmaravilla-hub) | `maravillacruz806@gmail.com` |
| **Rebeca Marcela Orozco Arévalo** | OA241153 | [@Rebe155](https://github.com/Rebe155) | `arevalorebeca41@gmail.com` |

---

## 🚀 Descripción General

Backend independiente desarrollado en **Node.js + Express + TypeScript** que implementa el núcleo algorítmico y funcional de **CineMatch**.

El sistema integra:
1. **Cinco estructuras de datos implementadas desde cero en TypeScript:**
   - `structures/HashTable.ts`: Tabla Hash genérica con hashing polinomial DJB2 optimizado, encadenamiento separado (*Separate Chaining*) y redimensionamiento dinámico automático ($\alpha \ge 0.75$).
   - `structures/LinkedList.ts`: Lista simplemente enlazada con punteros `head` y `tail` ($O(1)$ inserción de extremos), control de duplicados (`insertOrUpdate`) e iterador `Symbol.iterator`.
   - `structures/BipartiteGraph.ts`: Grafo bipartito ponderado no dirigido ($V_U$ usuarios y $V_M$ películas) con pesos de calificación entre 1 y 5, exploración de vecinos afines y desvinculación segura (`removeEdge`).
   - `structures/AVLTree.ts`: Árbol AVL estrictamente auto-balanceado con cálculo de factor de balance ($FB \in \{-1, 0, 1\}$), 4 rotaciones canónicas (LL, RR, LR, RL) y clave compuesta `titulo#id`.
   - `structures/PriorityQueue.ts`: Max-Heap binario para selección Top-K y priorización de recomendaciones con desempate determinista FIFO ante puntajes idénticos.
2. **Motor de Recomendaciones (`services/RecommendationEngine.ts`):**
   - Filtrado colaborativo basado en usuarios (*User-Based Collaborative Filtering*).
   - Similitud del Coseno ponderada entre historiales de evaluación compartidos.
   - Mecanismo alternativo de respaldo (*Fallback*) por popularidad ordenado mediante Árbol AVL (RN09).
   - Soporte para reversión atómica de estados (`rollbackRating`).
3. **Persistencia Segura y Consistencia RAM-Disco (`services/CatalogService.ts`):**
   - Reemplazo seguro mediante archivo temporal (`safeReplaceJsonSync`) con fallback a Windows cross-volume.
   - Reversión automática en memoria ante fallos en I/O de disco para garantizar consistencia ACID.
4. **Servicios y Controladores REST:**
   - `GET /api/health`: Estado de salud del servicio.
   - `GET /api/movies`: Consulta del catálogo ordenado alfabéticamente vía Árbol AVL.
   - `GET /api/movies/:id`: Búsqueda instantánea en $O(1)$ vía Tabla Hash.
   - `GET /api/ratings/:userId`: Historial de calificaciones emitidas por el usuario.
   - `POST /api/ratings`: Registro o actualización con sincronización en memoria y persistencia.
   - `GET /api/recommendations`: Generación de recomendaciones personalizadas o fallback.
5. **Suite de 75 pruebas automatizadas:**
   - 10 suites de prueba con Vitest y Supertest que cubren pruebas unitarias de estructuras, auditoría de carga, integración REST, persistencia y recuperación de fallos.
   - **Distribución de las 75 pruebas:**
     - `HashTable.test.ts`: 9 pruebas (colisiones DJB2, factor de carga $\alpha \ge 0.75$, claves genéricas, caso límite `undefined`).
     - `LinkedList.test.ts`: 7 pruebas (punteros `head`/`tail`, `insertOrUpdate`, iterador nativo, unicidad).
     - `BipartiteGraph.test.ts`: 6 pruebas (bipartición $V_U \cap V_M = \emptyset$, simetría no dirigida, aristas 1–5, `removeEdge`).
     - `AVLTree.test.ts`: 8 pruebas (4 rotaciones LL/RR/LR/RL, factor de balance $FB \in \{-1, 0, 1\}$, clave `titulo#id`).
     - `PriorityQueue.test.ts`: 6 pruebas (Max-Heap binario, ordenamiento Top-K, desempate FIFO determinista).
     - `stress_audit.test.ts`: 10 pruebas (inserción de 500+ elementos, estrés de factor de carga y árbol balanceado).
     - `RecommendationEngine.test.ts`: 7 pruebas (similitud del coseno, Top-K Max-Heap, exclusión RN10, fallback AVL RN09).
     - `api.test.ts`: 11 pruebas (endpoints REST con Supertest, validaciones HTTP 200, 400 y 404).
     - `persistence.test.ts`: 7 pruebas (escritura segura, recuperación post-reinicio, atomicidad y rollback RAM-disco).
     - `sync_regression.test.ts`: 4 pruebas (consistencia reactiva, aislamiento entre usuarios y concurrencia).

---

## 🛠️ Instalación y Comandos

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar la suite completa de 75 pruebas automatizadas
npm test

# 3. Compilar el proyecto TypeScript
npm run build

# 4. Iniciar el servidor en modo desarrollo con recarga automática
npm run dev

# 5. Iniciar el servidor en producción (puerto 3001)
npm start
```

---

## 📁 Arquitectura del Repositorio

```text
CineMatch-Back/
├── controllers/            # Controladores HTTP de Express (movies, ratings, recommendations)
├── data/                   # Datos locales semilla en JSON (movies, users, ratings)
├── models/                 # Entidades y tipos TypeScript (User, Movie, Rating, etc.)
├── routes/                 # Definición de rutas y endpoints REST
├── services/               # Motor de Recomendaciones y CatalogService con persistencia
├── structures/             # LAS 5 ESTRUCTURAS DE DATOS PROPIAS (desde cero)
│   ├── AVLTree.ts          # Árbol AVL auto-balanceado con 4 rotaciones
│   ├── BipartiteGraph.ts   # Grafo bipartito ponderado no dirigido
│   ├── HashTable.ts        # Tabla Hash genérica con DJB2 y Separate Chaining
│   ├── LinkedList.ts       # Lista simplemente enlazada con head/tail
│   └── PriorityQueue.ts    # Cola de prioridad Max-Heap binaria
├── tests/                  # Suite de 75 pruebas automatizadas
│   ├── integration/        # Pruebas de integración HTTP y regresión de sincronización
│   ├── services/           # Pruebas del Motor de Recomendación y Persistencia
│   └── structures/         # Pruebas unitarias de las 5 estructuras y pruebas de estrés
├── app.ts                  # Configuración de Express, middlewares y CORS
├── index.ts                # Punto de entrada del servidor (puerto 3001)
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración del compilador TypeScript
└── vitest.config.ts        # Configuración de Vitest
```
