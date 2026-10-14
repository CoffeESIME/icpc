# Avance · ICPC Algorithm Lab

## 2026-10-13 · Opción Python

- Añadido selector **TypeScript / Python** dentro de Código completo en los once problemas. Visible antes de revelar, respeta la ocultación inicial y guarda la preferencia por módulo con el progreso existente.
- Once archivos Python 3.10+ completos en `src/algorithms/python/`, con comentarios, auxiliares, salidas documentadas y ejemplo ejecutable. Solo biblioteca estándar. Catálogo y descargas generados desde esos mismos archivos.
- Las visualizaciones y ejercicios siguen usando TypeScript; la interfaz lo indica. Python expone el resultado de cada solucionador sin duplicar el historial visual. No se le atribuyen aceptación externa ni pruebas de rendimiento en límites máximos. S permanece parcialmente verificado.
- Comparación real mediante un proceso Python: ejemplos oficiales no interactivos y **3027 casos adicionales**, incluidas todas las cadenas binarias hasta nueve bits, 567 inventarios U, 384 escenarios de mentira W, casos deterministas de P/Q/S/V/Z/R/X, conteos 2^40 y tres contrastes geométricos con oráculo independiente. Validación de siete entradas inválidas y copias descargables.
- El contraste detectó un problema previo en V: una media flotante de un empate exacto podía invertir los dados. TypeScript y Python ahora deciden la orientación con numeradores enteros; se añadió regresión para ese empate.
- Validación: **35 grupos Vitest**, **24 flujos Playwright** (escritorio y móvil), TypeScript y build de producción. Los nuevos flujos recorren el selector y las descargas de los once módulos, la vuelta a TypeScript y la persistencia sin revelar automáticamente.
- Para ejecutar la suite se necesita Python 3.10+ (`python` o variable `PYTHON`). El build y el navegador no requieren un intérprete Python.

## 2026-10-13 · De la idea al código

### Implementado

- Los once módulos incorporan cuatro vistas dentro de **Construir → De la idea al código**: pseudocódigo detallado, código TypeScript completo, completar código y ejecución. Se explican contratos, índices, variables, inicialización, ramas, ciclos, retornos y costes. Cada bloque remite a una instrucción y línea real.
- `implementation-lessons.ts` contiene el desarrollo pedagógico. `CodeLesson` reutiliza los laboratorios y el progreso local; los intentos se guardan y las soluciones empiezan ocultas. Se puede terminar un intento y revelar la respuesta sin acertar ni escribir una cantidad mínima.
- El código mostrado y descargable se genera desde los archivos reales mediante `scripts/code-catalog.mjs`. Incluye módulos íntegros, tipos, auxiliares y la dependencia `trace.ts`; la vista comienza por la función relevante. No hay una segunda versión manuscrita de los solucionadores. El catálogo se actualiza con `predev`, `prebuild` y `pretest`.
- Compression explicita first, last, different, i y las tres ramas en el propio solucionador. El observador opcional produce la ejecución directa sin duplicar el algoritmo. Se conserva el laboratorio constructivo XX → X y se explica por qué la solución O(n) no necesita realizar eliminaciones.
- Los eventos de Y/P/Q/W/U y las vistas calculadas de S/X/Z enlazan instrucciones o bloques reales. Se distingue una instantánea de instrucción de un resumen de bloque. R/T/V mantienen recorridos explicados y resultados calculados: no se les atribuye una traza interna de lowlink, búsquedas ternarias o envolvente que no existe.
- Se distingue construcción frente a verificación en U, esperanza frente a realización física en Q, coste DP frente a calendario en S y clasificación frente a rotaciones en R.
- Los ejercicios comparan expresiones normalizadas con una referencia; lo advierten expresamente. No se ejecuta texto del estudiante y una expresión equivalente puede no ser reconocida. Hay pistas y solución explicada revelable.

### Evidencia y límites

- **30 grupos Vitest**, incluidos los 24 anteriores. Los nuevos verifican referencias al código, integridad de copias descargables, carga de módulos TypeScript con su dependencia, los once ejemplos de llamada y trazas del solucionador. Compression comprueba estados e invariantes del barrido para las 510 cadenas de longitud 1..8; conserva el oráculo exhaustivo de reducción hasta longitud 9.
- **22 flujos Playwright**, once por viewport (escritorio y móvil), conservando los 18 anteriores. Comprueban las cuatro vistas en los once módulos, ocultación inicial, soluciones accesibles, persistencia de intentos, sincronización de líneas en Y, entradas inválidas y ausencia de desbordamiento horizontal. TypeScript y build de producción correctos.
- Las pruebas detectaron y corrigieron una transcripción incorrecta de la salida del ejemplo U antes de publicarlo. No fue un cambio en el algoritmo.
- Vista de producción actualizada en localhost:3000. Inspección visual de código en escritorio y tablas de ejecución en móvil; comprobadas descarga del archivo real, línea activa, ausencia de errores de página y ausencia de desbordamiento. Se conservan capturas locales en `tmp/` (no distribuido).
- Se conserva el estado anterior: **P/Q/R/T/U/V/W/X/Y/Z verificados localmente; S parcialmente verificado**. S aún necesita una exposición autosuficiente del teorema de normalización de horarios de Backhouse–Truong. Ningún módulo se declara aceptado por un juez externo.
- Las funciones reciben estructuras ya leídas; no se presentan como programas de consola con protocolo de juez. W incluye el decodificador y simulador local, no transporte interactivo/flush. Las cotas de los solucionadores excluyen copias educativas de la traza.
- No se añadió Python: se prioriza una única referencia TypeScript ejecutada por la aplicación. No se ha verificado con lectores de pantalla, Safari/Firefox o dispositivos móviles físicos.

El historial siguiente describe las iteraciones anteriores; los recuentos de pruebas vigentes son los de esta sección.

## 2026-10-12 · Segunda iteración

### Contenido y preparación oral

- Auditados los once módulos. Separado el enunciado de las derivaciones en `deep-dives.ts`; `problems.ts` integra ambas fuentes y ya no conserva los antiguos textos pendientes duplicados.
- Cada módulo incorpora un ejemplo manual con estados y decisiones, estructuras y operaciones, pseudocódigo comentado, prueba por pasos, derivación de complejidad, guion y cuatro rúbricas de defensa. Las respuestas y autoevaluaciones se guardan con el progreso existente.
- Q: derivada la esperanza del primer pedido y de cada transición; no se presupone independencia entre indicadores.
- S: incorporada la recurrencia completa de Backhouse–Truong con bases, rangos, orden de evaluación y significado contable de e. El ejemplo reproduce 17 frente a19 y un horario físicamente realizable.
- R: clasificación completa de componentes, bloques, KMP, paridad y duplicados. La suficiencia general cita los teoremas de Yu–Rus, distinguida de las pruebas exhaustivas pequeñas.
- X: formalizadas las obligaciones históricas y su reducción a matching de huecos iniciales. Corregida durante las pruebas una suposición falsa: pedir una carta que el solicitante posee no está prohibido.
- Z: deducidos los conteos en subespacios, multiplicidades de líneas, DP de subconjuntos y recuperación de signos por traslación. La complejidad refleja el factor k de operar coordenadas explícitamente.
- T: alternativa convexa con segmentos cerrados, extremos incluidos y explicación del error; V: clases enteras realizables, hull y dos cortes independientes, con dados concretos que alcanzan los resultados del ejemplo.

### Laboratorios y componentes

- Conservados los laboratorios Y/P y el reproductor; añadido modo de predicción con resultado oculto y comparación posterior.
- W: simulador de cinco respuestas, terna candidata, determinantes y comprobación de acuerdos.
- U: cuatro familias de plantillas, inventario editable y verificador independiente por celdas. Se representa el recorrido de la salida, no una supuesta búsqueda geométrica.
- Q: conteo esperado con Fenwick; contraste separado con el coste físico de un reparto.
- S/R/X/Z tienen controles de ejemplos pequeños; T/V muestran resultados calculados y recorridos matemáticos explicados.
- Componentes reutilizables para tablas de estados/DP, Fenwick, grafos, matching, residuos modulares y recorridos de vías. Múltiples reproductores usan identificadores de rango únicos.

### Pruebas y correcciones

- 24 grupos Vitest: ocho originales y dieciséis nuevos. Q compara todas las permutaciones hasta6 con todos los repartos; W ensaya cantidades0..3 y corrupción en cualquier consulta; S usa Dijkstra físico en189 casos; U comprueba3007 inventarios y descarta exhaustivamente ocho curvas; R usa BFS en todos los grafos hasta4; X compara500 registros con todos los repartos pequeños; Z regenera252 distribuciones y conteos de2⁴⁰; V compara100 instancias con mezclas exhaustivas; T verifica ejemplo oficial y casos analíticos.
- Fixtures oficiales de Q/S/R/X/Z verificados adicionalmente. Las salidas constructivas de Z se validan por su distribución, no por igualdad con una salida arbitraria.
- Q con100000 elementos y U con200000 piezas comprobados sin guardar trazas. Se eliminó una actualización de arreglo activo de Q que habría hecho cuadrático el camino sin traza. S permite omitir el registro de celdas y X permite omitir historial.
- Los flujos Playwright existentes se conservan; se actualizan dos expectativas de contenido que han cambiado. Ocho flujos nuevos (cuatro por viewport) cubren laboratorios W/U/Q, seis recorridos, las once fichas, rúbricas persistentes y predicciones Y/P.
- Las pruebas ahora usan3100 y crean su propio servidor: el servidor antiguo en3000 estaba mostrando el build anterior. Se corrigieron selectores de prueba que confundían mayúsculas del nombre W y el anunciador accesible de Next con el mensaje de validación.
- Inspección visual de circuitos, Fenwick, matching, lección de S y móvil claro/oscuro. Ajustado el alcance CSS del bloque de evidencia para no heredar el espaciado de la página de fuentes.

### Estado de aceptación

- Resultado final de verificaciones: **24 grupos Vitest aprobados, 18 flujos Playwright aprobados, TypeScript sin errores y build de producción correcto**. El cierre automático del servidor de Playwright quedó esperando al proceso hijo de Next en este entorno Windows; se detuvo únicamente ese proceso de pruebas para recoger el resultado de salida0.

| Problemas                    | Estado                  | Trabajo restante                                                                                                                                                                                        |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P, Q, R, T, U, V, W, X, Y, Z | Verificados localmente  | Sin aceptación externa; los límites concretos están en cada ficha.                                                                                                                                      |
| R                            | Verificado localmente   | Cerrada la prueba con generación por 3-ciclos, conjugación, theta y extensión por orejas. Dos nuevos grupos comprueban149 identidades concretas.                                                        |
| S                            | Parcialmente verificado | Exposición autosuficiente de la normalización de horarios. La medición puntual n=10000,c=2, tiempos1 dio19997 en405ms con352MiB RSS. Recurrencia, ejemplo e inducción de DP sí están desarrollados.     |
| T                            | Verificado localmente   | Añadida cota explícita del error real acumulado de búsquedas y oráculo independiente por desarrollo de caras/extremos;80 casos coinciden a menos de10⁻⁶. El contraste local no equivale a juez externo. |

Los once módulos pueden recorrerse y tienen un ejemplo reproducible. **S permanece parcial por el teorema estructural pendiente de desarrollar íntegramente dentro de la guía.** Tampoco se declara aceptación por un juez, publicación del sitio ni auditoría de accesibilidad con lector de pantalla.

El registro siguiente conserva la primera iteración como historial; su lista de «siguiente etapa» queda sustituida por esta sección.

## 2026-10-12 · Primera versión de estudio

### Decisiones

- Se respetó la prioridad: investigación y contenido de los once problemas, después recorrido completo de Y y P. Los demás visualizadores quedan explícitamente pendientes.
- Next.js App Router, React, TypeScript, CSS con tokens, Lucide, Vitest y Playwright. Persistencia local y fuentes empaquetadas. Sin backend ni servicios de IA.
- Separación entre contenido, algoritmos y UI. Las trazas almacenan estados reales y no dependen de transiciones visuales.
- Se actualizaron Next.js a 16.4.0 y Vitest a 5.0.4 tras revisar avisos de las versiones instaladas inicialmente; la auditoría posterior informó cero vulnerabilidades.
- El coste del solucionador se distingue del coste de conservar una traza didáctica completa.

### Investigación realizada

- Revisadas las 22 páginas del PDF de enunciados y las diez páginas del PDF de bosquejos.
- Confirmados nombres y correspondencia P–Z en Gym 105254.
- Intentadas las once páginas HTML; la mayoría no respondieron en la herramienta web. El PDF sirvió de referencia alternativa.
- Registro estructurado con todos los ejemplos oficiales, restricciones, enfoque, estructuras, cotas derivadas, argumentos, casos límite y pendientes.
- No se utilizaron implementaciones ajenas ni se afirma aceptación en un juez externo.

### Implementado

- Dashboard, búsqueda, orden, ruta de seis días y navegación por ocho etapas.
- Fichas, preguntas persistentes, pistas progresivas, estrategias, guiones y ejercicios para once problemas.
- Y: editor, operaciones válidas, historial reversible, intentos comparables y construcción paso a paso.
- P: sistema físico, grafo, ecuaciones, conexiones/colores editables, casos oficiales, luces de cero/un botón y propagación por componentes con mínimos.
- Motor genérico con reproducción, pausa, velocidad, avance/retroceso, reinicio, antes/después, variables y pseudocódigo.
- Apuntes, estados y minutos locales; exportación JSON; modos claro/oscuro.
- Temporizador oral de cinco minutos y guion ocultable.

### Verificación

- Ocho grupos de pruebas de algoritmos pasan: tres ejemplos de Y, cuatro de P, todas las cadenas binarias de longitud ≤9 frente a fuerza bruta, legalidad de trazas hasta longitud 8, incidencias/coloraciones exhaustivas pequeñas de P y 400 instancias deterministas adicionales frente a 3ᵇ asignaciones.
- Compilación final de producción con Next.js 16.4.0 y TypeScript correctos.
- Se detectó y eliminó una generación accidental de snapshots con la traza desactivada.
- Diez pruebas Playwright aprobadas: cinco flujos en escritorio y los mismos cinco en viewport móvil. Cubren búsqueda/navegación, operaciones y trazas reversibles, edición de conexiones, ecuaciones, casos imposibles, persistencia y temporizador oral.
- Capturas de escritorio, móvil, Compression y Turning Red revisadas visualmente en temas claro y oscuro. Se corrigió el salto de línea del título móvil y se conservaron dificultad y tiempo en el catálogo móvil.
- Se inspeccionaron además las páginas renderizadas 1, 16 y 19 del PDF para contrastar diagramas y la transcripción de las interacciones de W.
- Cero vulnerabilidades reportadas por la auditoría tras actualizar dependencias.

### Dificultades resueltas

- Acceso de red restringido para npm: instalación mediante el mecanismo de permisos disponible.
- El Chromium instalado no coincide con la revisión que espera el Playwright recién instalado: se usa la ruta explícita mediante una variable de entorno, sin fijarla al equipo en el repositorio.
- Next.js de desarrollo bloquea recursos solicitados usando 127.0.0.1; pruebas y vista previa usan localhost, que coincide con el origen servido.
- Se impiden interacciones antes de recuperar el estado del navegador para evitar clics perdidos durante la hidratación inicial.

### Siguiente etapa

1. U: probar plantillas y excepción de ocho curvas; generar y verificar circuitos.
2. W: implementar aritmética exacta y simulador con cero o una mentira.
3. Q: derivar la fórmula completa, incluido primer pedido, y contrastarla enumerando repartos.
4. T/V: geometría robusta, recortes y casos degenerados.
5. X/R/S/Z: completar los argumentos y algoritmos señalados en cada ficha antes de visualizarlos.
6. Ampliar ejercicios, exportación/importación validada de progreso y pruebas con lectores de pantalla/otros motores.

No se ha desplegado públicamente. README incluye instrucciones para Vercel. Esta entrega no pretende que los once algoritmos avanzados estén implementados o completamente verificados.
