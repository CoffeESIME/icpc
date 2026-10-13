# Modelo educativo

## Secuencia

1. **Comprender:** separar entrada, salida, restricciones y objetivo. Mostrar ejemplos oficiales sin revelar el algoritmo.
2. **Pensar:** responder preguntas específicas del problema; guardar cada respuesta. Las pistas se abren una a una.
3. **Comparar:** confrontar estrategias reales, incluidas búsquedas pequeñas que sirven de oráculo. No inventar tres opciones por uniformidad.
4. **Construir:** nombrar variables, describir pasos, discutir correctitud y casos límite. Los módulos avanzados distinguen esquema de prueba completa.
5. **Experimentar:** Y/P/W/U/Q permiten manipular entradas y reproducir estados auténticos. S/R/X/Z permiten modificar ejemplos pequeños y T/V muestran resultados calculados. Un segundo recorrido manual explica el caso de estudio y se etiqueta como razonamiento, no como ejecución general.
6. **Contar:** explicar tiempo y memoria a partir de operaciones. La tabla de crecimiento es matemática, no una medición de velocidad ni una lista de algoritmos del problema.
7. **Comprobar:** una pregunta con retroalimentación y justificación escrita, más cuatro preguntas abiertas con rúbricas ocultas hasta responder. Resolverlas no certifica dominio: la marca es una autoevaluación explícita.
8. **Exponer:** ensayo con guion oculto de forma predeterminada y preguntas posteriores. Ritmo: 45 s definición, 45 s modelo, 105 s algoritmo, 60 s correctitud y 45 s complejidad.

## Estado y tiempo

El estudiante elige entre no estudiado, comprendiendo, puedo explicarlo y necesito repasar. El indicador global cuenta solo la autoevaluación «puedo explicarlo», sin equiparar minutos o clics con comprensión. Los minutos suman intervalos mientras la pestaña está visible y enfocada; pueden perderse hasta cinco segundos al navegar. El temporizador oral usa tiempo de reloj para no ralentizarse al pasar la pestaña a segundo plano.

## Contenido y evidencia

`Problem` integra los enunciados y ejercicios de `src/data/problems.ts` con la solución pedagógica de `src/data/deep-dives.ts`. `DeepDive` define ejemplo paso a paso, pseudocódigo comentado, estructuras, prueba, coste, cinco bloques orales, cuatro rúbricas, fuentes y alcance de verificación. No contiene renderizado ni ejecuciones.

S usa un teorema estructural publicado cuyo papel se explica, sin reproducir toda su demostración: mantiene estado parcial. R desarrolla la generación y propagación de permutaciones. T combina análisis real de precisión y contraste con un oráculo geométrico independiente. Los otros diez módulos se identifican como verificados localmente. Ningún indicador significa aceptación por el juez externo.

## Criterio para ampliar

Antes de marcar un nuevo laboratorio como disponible: derivar las reglas y estados, implementar un solucionador independiente, comprobar ejemplos o validar las salidas constructivas, usar un oráculo pequeño cuando sea viable, generar trazas reales y verificar que cada paso corresponde al pseudocódigo. La animación por sí sola no constituye evidencia.

## Accesibilidad

Controles nativos con etiquetas, foco visible, estados de botones, SVG con nombres, colores de luces acompañados por R/G/B y preferencia de movimiento reducido. La navegación se adapta a móviles sin eliminar etapas. Se han probado flujos con Chromium; queda auditoría formal con lector de pantalla y otros motores.
