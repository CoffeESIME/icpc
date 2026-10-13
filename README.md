# ICPC Algorithm Lab · World Finals 2022

Aplicación educativa en español para preparar una exposición oral de cinco minutos sobre los problemas **P–Z de la 46th ICPC World Finals**. Prioriza experimentar, formular invariantes y justificar algoritmos. No es un juez ni un catálogo de código para copiar.

## Ejecutar

Requiere Node.js **22.16 o superior** y npm. Las fuentes tipográficas se sirven desde el proyecto; no requieren Google Fonts ni servicios externos durante el estudio.

```sh
npm ci
npm run dev
```

Abrir **http://localhost:3000**. En Windows, si PowerShell bloquea `npm.ps1`, usar `npm.cmd` en lugar de `npm`.

```sh
npm run build
npm start
```

No se necesitan claves, autenticación, base de datos ni servicios de IA. Apuntes, respuestas, ejercicio completado, estado de estudio, minutos y tema se guardan en `localStorage` con la clave versionada `icpc-lab-v1`. El cuaderno permite exportar JSON. Cambiar de navegador u origen (incluido el puerto) cambia el almacén local.

## Qué incluye

- Dashboard de once problemas, filtro, orden por dificultad/tema/progreso y plan de seis días.
- Ocho etapas por problema: comprender, pensar, comparar, construir, laboratorio, complejidad, comprobar y exponer.
- Fichas estructuradas con restricciones, todos los ejemplos oficiales, preguntas, pistas, costes, argumentos y límites de verificación.
- **Y / Compression:** editor de hasta 24 bits, enumeración de operaciones legales `XX → X`, deshacer/rehacer, comparar intentos de la sesión y construcción reproducible.
- **P / Turning Red:** colores y conexiones editables, pulsaciones manuales, grafo, ecuaciones y traza por componentes. Hasta diez luces y ocho botones en la interfaz para conservar legibilidad; solucionador independiente sin esa limitación didáctica.
- Reproductor de eventos serializados: antes/después, variables, operación, motivo, pseudocódigo, reproducción, pausa, avance, retroceso, reinicio y velocidad.
- **W / Riddle of the Sphinx:** cinco consultas, cero o una mentira configurable, resolución entera de ternas y validación con cuatro coincidencias.
- **U / Toy Train Tracks:** generador de plantillas, inventario editable, verificador geométrico y recorrido de celdas antes/después.
- **Q / Doing the Container Shuffle:** permutación editable, fórmula completa de esperanza, Fenwick con intervalos visitados y contraste con una simulación física de las pilas.
- **S, R, X, Z, T, V:** recorridos razonados y resultados de implementaciones propias. Incluyen tabla DP, rotaciones de grafos, matching, proyecciones modulares, minimización convexa y envolvente de puntuaciones. Los recorridos manuales se identifican como tales.
- Once ejemplos manuales desarrollados, pseudocódigo explicado, estructuras, argumentos de correctitud, derivaciones de coste y guiones de cinco minutos.
- Cuatro preguntas de defensa por módulo: razonamiento, estructuras, complejidad y correctitud. Respuesta escrita antes de abrir la rúbrica; autoevaluación persistente, sin calificación automática.
- Predicción de estados posteriores en Y/P, oculta hasta comprobar la respuesta.
- Temporizador oral de 300 segundos con bloques 45/45/105/60/45; guion oculto inicialmente.
- Modo claro/oscuro, diagramas SVG, controles accesibles y diseño adaptable.

## Estado real de los once problemas

«Verificado localmente» significa contraste con pruebas y ejemplos, **no aceptación en un juez externo**. Todos tienen un ejemplo significativo reproducible, guion, pseudocódigo y rúbricas. No se equipara tener una pantalla con haber cerrado todas las demostraciones.

| Problema | Estado                  | Evidencia y vacío restante                                                                                                                                                                                                                               |
| -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P        | Verificado localmente   | Cuatro ejemplos oficiales, enumeración de asignaciones pequeñas y 400 casos adicionales. Laboratorio y predicciones.                                                                                                                                     |
| Q        | Verificado localmente   | Todas las permutaciones hasta n=6 frente a todos los repartos; ejemplos oficiales; ejecución sin traza con n=100000.                                                                                                                                     |
| R        | Verificado localmente   | BFS en todos los grafos hasta n=4, prueba de generación por conjugación y orejas, y 149 comprobaciones de las identidades de conmutador/theta.                                                                                                           |
| S        | Parcialmente verificado | Recurrencia completa, casos oficiales y Dijkstra en 189 instancias. La normalización de horarios utiliza el teorema de Backhouse–Truong; falta una exposición autosuficiente de ese teorema. Medición puntual n=10000,c=2: 405ms y352MiB RSS, sin traza. |
| T        | Verificado localmente   | Implementación convexa, cota real del error, casos analíticos y80 instancias contrastadas con un oráculo geométrico independiente de desarrollo de caras y extremos.                                                                                     |
| U        | Verificado localmente   | 3007 inventarios pequeños, las 256 palabras de ocho curvas y un circuito válido de 200000 piezas.                                                                                                                                                        |
| V        | Verificado localmente   | Dos ejemplos oficiales y 100 casos frente a todas las mezclas de dos clases. Aritmética flotante, sin juez externo.                                                                                                                                      |
| W        | Verificado localmente   | Diez ternas independientes y corrección de cero/una mentira en todas las cantidades 0..3 con varias respuestas corruptas. Simulador local.                                                                                                               |
| X        | Verificado localmente   | Ambos ejemplos oficiales y 500 registros de mazos pequeños contra todos los repartos equilibrados. Se respetan las garantías de validez del enunciado.                                                                                                   |
| Y        | Verificado localmente   | Exhaustivo hasta longitud9; legalidad de trazas hasta8. Laboratorio conservado y predicciones añadidas.                                                                                                                                                  |
| Z        | Verificado localmente   | Ambos ejemplos oficiales, 252 distribuciones generadas y conteos de 2⁴⁰. Reconstrucción comprobada regenerando el multiconjunto.                                                                                                                         |

S **no se declara cerrado por completo**. Sus pendientes son visibles en Construir, Laboratorio y Fuentes. Las pruebas pequeñas no sustituyen los teoremas generales.

## Estructura

### De la idea al código

En **Construir**, los once problemas tienen vistas de **Pseudocódigo**, **Código completo**, **Completar código** y **Ejecución**. Las soluciones empiezan ocultas y pueden revelarse al terminar un intento, aunque esté incompleto. Los intentos se guardan con el progreso local. Cada explicación enlaza instrucciones reales y detalla los factores de complejidad.

La referencia TypeScript se consulta dentro de la aplicación, con tipos, auxiliares e importaciones, y puede descargarse. `npm run code:catalog` genera `src/data/code-catalog.json` y las copias de `public/reference/` desde los archivos reales; también se ejecuta antes de desarrollo, build y pruebas. No edites las copias generadas. El contenido pedagógico está en `src/data/implementation-lessons.ts`.

Compression tiene una traza observada del solucionador directo O(n), separada del laboratorio constructivo XX → X. P/Q/W/U y los estados calculados de S/X/Z señalan instrucciones o bloques de código. R/T/V explican el alcance de sus recorridos y no fingen una ejecución interna. Los ejercicios comparan expresiones normalizadas, **no ejecutan código del estudiante**; admiten pistas y revelación de la referencia.

Los ejemplos invocan funciones sobre datos ya leídos. Las descargas son módulos TypeScript, no programas de consola para enviar directamente al juez. En W, el transporte interactivo queda fuera del decodificador local. S conserva su estado parcialmente verificado y ningún resultado equivale a aceptación externa.

```text
src/algorithms/    Solucionadores puros, eventos y pruebas de algoritmos
src/data/          problems.ts: enunciados; deep-dives.ts: derivaciones, ejemplos y rúbricas
src/components/    Dashboard, lecciones, laboratorios y reproductor genérico
src/app/           Next.js App Router, composición y estilos
tests/             Pruebas de flujo con Playwright
research/          Registro de fuentes, alcance y observaciones
docs/              Modelo educativo y contrato de trazas
PROGRESS.md        Decisiones, evidencias y próximos pasos
```

Se eligieron React, TypeScript, Next.js App Router y CSS propio con variables de diseño. No se añadió Tailwind, Motion ni KaTeX porque las interacciones actuales no los necesitan: el pseudocódigo y las expresiones sencillas permanecen como texto accesible, y los eventos determinan los dibujos. Pueden incorporarse si los módulos avanzados lo justifican.

## Pruebas

```sh
npm test
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

Playwright prueba escritorio y viewport móvil con Chromium. Si ya hay un Chromium compatible disponible, se puede usar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` con la ruta absoluta del ejecutable. Sin esa variable usa el navegador instalado por Playwright. En esta entrega se usó el Chromium ya disponible en el equipo, sin pruebas en Safari/Firefox ni móviles físicos.

El servidor de pruebas usa `localhost`, igual que el servidor de desarrollo. Next.js puede rechazar recursos de desarrollo servidos bajo otros orígenes. Si necesitas acceso desde otro equipo, configura explícitamente los orígenes permitidos; no desactives esa protección globalmente.

La versión actual tiene **30 grupos de pruebas Vitest** y **22 flujos Playwright** (once por tamaño de pantalla). Incluyen los tests originales, casos oficiales, oráculos independientes, entradas grandes de Q/U, recorrido de los once módulos, errores de entrada, reversibilidad, persistencia oral y predicciones. La mejora de implementación añade integridad de fuentes descargables, ejemplos de llamada, estados y líneas de la ejecución directa de Compression, vistas de código y ejercicios persistentes. TypeScript y build de producción se comprueban aparte.

Playwright usa un servidor exclusivo en **localhost:3100**, sin reutilizar un servidor antiguo en3000. Mantén libre ese puerto. En Windows, el entorno de ejecución puede necesitar finalizar el proceso hijo de Next al cerrar el servidor de pruebas; no afecta a los resultados de los flujos. No se han probado Safari/Firefox, lectores de pantalla ni dispositivos móviles físicos.

## Despliegue en Vercel

1. Subir este repositorio a un proveedor Git.
2. Importarlo en Vercel y seleccionar el preset **Next.js**.
3. Usar Node.js 22.x, instalación `npm ci`, build `npm run build` y salida predeterminada.
4. No configurar variables de entorno: la aplicación no necesita secretos.
5. Abrir la vista previa y verificar laboratorios, recorridos y persistencia antes de promover a producción.

El despliegue público no se ha realizado. Los datos personales permanecen en el navegador; el dominio de una vista previa y el de producción tienen almacenes separados.

## Fuentes y verificación

Ver [registro de investigación](research/README.md), [contenido estructurado](src/data/problems.ts), [modelo educativo](docs/EDUCATIONAL_MODEL.md), [trazas](docs/TRACE_ENGINE.md) y [avance](PROGRESS.md).

Enunciados: PDF aportado por el usuario y [Codeforces Gym 105254](https://codeforces.com/gym/105254). Referencia de enfoques: [PDF de análisis de los jueces, declarado no oficial](https://icpc.global/worldfinals/problems/2022-ICPC-World-Finals/finals2022solutions.pdf), de Per Austrin, Arnav Sastry, Paul Wild y Jakub Onufry Wojtaszczyk. Para S se usa [Backhouse–Truong, The Capacity-C Torch Problem](https://people.cs.nott.ac.uk/psarb2/MPC/TorchProblem.pdf), especialmente §4.5; para R, [Yu–Rus, Pebble Motion on Graphs with Rotations](https://people.csail.mit.edu/jingjin/files/wafr14.pdf), §3. Las implementaciones y ejemplos explicados son propios. No se distribuyen copias extensas de documentos ni código de terceros.
