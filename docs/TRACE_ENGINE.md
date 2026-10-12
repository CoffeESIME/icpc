# Contrato del motor de trazas

`TraceEvent<S>` en `src/algorithms/trace.ts` representa una transición serializable:

- `id`: posición determinista en la secuencia.
- `before`, `after`: copias profundas del estado anterior y posterior.
- `operation`, `explanation`: qué se hizo y por qué.
- `variables`: valores de estudio, separados del estado específico.
- `active`: índices visualmente relevantes; su interpretación pertenece al renderizador.
- `pseudocode`: índice de la línea destacada.
- `invariant`: condición que se está preservando o comprobando.
- `partial`: resultado parcial o diagnóstico.

`TracePlayer<S>` nunca calcula nuevos estados del algoritmo. Solo selecciona eventos y los dibuja mediante `render(state, active)`. Pausa, avance, retroceso y reinicio modifican el índice. Modificar una entrada sustituye la secuencia y reinicia el reproductor. Se pueden serializar las trazas con JSON y reproducirlas sin ejecutar de nuevo el algoritmo.

## Compression

`compress` devuelve la respuesta usando invariantes en O(n) tiempo y O(1) memoria auxiliar. `compressionTrace` exhibe una prueba constructiva con reglas de longitud 1 y 2. Usa strings inmutables y guarda instantáneas: puede copiar/almacenar O(n²) caracteres. `reductions` enumera operaciones para la experimentación (hasta O(n³) trabajo con comparaciones de subcadenas). Por eso la interfaz limita las entradas a 24 bits. No se atribuye a ese enumerador la complejidad del solucionador.

Las pruebas exhaustivas cotejan el resultado con todas las reducciones posibles, comprueban extremos y símbolos, y verifican cada transición con el conjunto de operaciones legales.

## Turning Red

`solveRed(input, false)` trabaja en O(l+b) con listas de adyacencia y pila iterativa. No construye instantáneas intermedias si la traza está desactivada. Cada componente se intenta tres veces y sus luces se verifican de forma local.

`solveRed(input, true)` conserva intentos, propagaciones, contradicciones y elecciones mínimas. Tiene un coste adicional potencialmente cuadrático al copiar asignaciones. La UI limita el tamaño para facilitar inspección. Los valores no asignados se muestran como `?`; si un dibujo calcula colores provisionales usando cero para esas variables, lo declara junto al SVG.

Un intento fallido no significa que todo el problema sea imposible. Solo se declara imposible si una luz sin botones no es roja o si ninguno de los tres intentos resuelve una componente. Elegir mínimos de componentes independientes es lo que produce el mínimo global.

Las pruebas contrastan el resultado con enumeración de 3ᵇ asignaciones y comprueban la concatenación `evento[i].after = evento[i+1].before`, serialización JSON y validez de las pulsaciones finales.
