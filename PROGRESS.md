# Avance · ICPC Algorithm Lab

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
