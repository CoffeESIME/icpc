# Modelo educativo

## Secuencia

1. **Comprender:** separar entrada, salida, restricciones y objetivo. Mostrar ejemplos oficiales sin revelar el algoritmo.
2. **Pensar:** responder preguntas específicas del problema; guardar cada respuesta. Las pistas se abren una a una.
3. **Comparar:** confrontar estrategias reales, incluidas búsquedas pequeñas que sirven de oráculo. No inventar tres opciones por uniformidad.
4. **Construir:** nombrar variables, describir pasos, discutir correctitud y casos límite. Los módulos avanzados distinguen esquema de prueba completa.
5. **Experimentar:** Y y P permiten manipular entradas y reproducir estados auténticos. Los otros módulos identifican explícitamente la ausencia de simulador y ofrecen un experimento escrito.
6. **Contar:** explicar tiempo y memoria a partir de operaciones. La tabla de crecimiento es matemática, no una medición de velocidad ni una lista de algoritmos del problema.
7. **Comprobar:** una pregunta con retroalimentación y justificación escrita por problema. Resolverla no certifica dominio.
8. **Exponer:** ensayo con guion oculto de forma predeterminada y preguntas posteriores. Ritmo: 45 s definición, 45 s modelo, 105 s algoritmo, 60 s correctitud y 45 s complejidad.

## Estado y tiempo

El estudiante elige entre no estudiado, comprendiendo, puedo explicarlo y necesito repasar. El indicador global cuenta solo la autoevaluación «puedo explicarlo», sin equiparar minutos o clics con comprensión. Los minutos suman intervalos mientras la pestaña está visible y enfocada; pueden perderse hasta cinco segundos al navegar. El temporizador oral usa tiempo de reloj para no ralentizarse al pasar la pestaña a segundo plano.

## Contenido y evidencia

`Problem` define material, fuentes derivadas del identificador, ejemplos, preguntas, estrategias, variables, pasos, correctitud, complejidad, casos límite, guion, ejercicio, estado de verificación y pendientes. Todo se encuentra en `src/data/problems.ts`, sin lógica de renderizado ni ejecuciones.

El contenido de U, Q, T, V, X, R, S y Z no debe usarse como sustituto de una solución formal completa. Los campos `pending`, la etapa Construir, la etapa Laboratorio y la página Fuentes hacen visible ese límite. W tiene un argumento de unicidad desarrollado, pero carece aún de simulador y pruebas del protocolo.

## Criterio para ampliar

Antes de marcar un nuevo laboratorio como disponible: derivar las reglas y estados, implementar un solucionador independiente, comprobar ejemplos o validar las salidas constructivas, usar un oráculo pequeño cuando sea viable, generar trazas reales y verificar que cada paso corresponde al pseudocódigo. La animación por sí sola no constituye evidencia.

## Accesibilidad

Controles nativos con etiquetas, foco visible, estados de botones, SVG con nombres, colores de luces acompañados por R/G/B y preferencia de movimiento reducido. La navegación se adapta a móviles sin eliminar etapas. Se han probado flujos con Chromium; queda auditoría formal con lector de pantalla y otros motores.
