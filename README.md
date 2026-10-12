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
- Temporizador oral de 300 segundos con bloques 45/45/105/60/45; guion oculto inicialmente.
- Modo claro/oscuro, diagramas SVG, controles accesibles y diseño adaptable.

Los otros nueve módulos contienen material de estudio, ejercicios y guiones, **no solucionadores ni visualizadores completos**. Sus límites se muestran en la propia aplicación. El orden de esta primera entrega sigue la prioridad solicitada: investigación de todos los problemas y recorrido completo de Y y P.

## Estructura

```text
src/algorithms/    Solucionadores puros, eventos y pruebas de algoritmos
src/data/          Contenido pedagógico y registro estructurado de los once problemas
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

Los tests incluyen ejemplos oficiales, fuerza bruta para entradas pequeñas, legalidad y consistencia de trazas, persistencia, controles y temporizador. La verificación no equivale a aceptación por el juez externo ni a un benchmark de entradas máximas.

## Despliegue en Vercel

1. Subir este repositorio a un proveedor Git.
2. Importarlo en Vercel y seleccionar el preset **Next.js**.
3. Usar Node.js 22.x, instalación `npm ci`, build `npm run build` y salida predeterminada.
4. No configurar variables de entorno: la aplicación no necesita secretos.
5. Abrir la vista previa y verificar el recorrido Y/P antes de promover a producción.

El despliegue público no se ha realizado. Los datos personales permanecen en el navegador; el dominio de una vista previa y el de producción tienen almacenes separados.

## Fuentes y verificación

Ver [registro de investigación](research/README.md), [contenido estructurado](src/data/problems.ts), [modelo educativo](docs/EDUCATIONAL_MODEL.md), [trazas](docs/TRACE_ENGINE.md) y [avance](PROGRESS.md).

Enunciados: PDF aportado por el usuario y [Codeforces Gym 105254](https://codeforces.com/gym/105254). Referencia de enfoques: [PDF de bosquejos](https://icpc.global/worldfinals/problems/2022-ICPC-World-Finals/finals2022solutions.pdf), de Per Austrin, Arnav Sastry, Paul Wild y Jakub Onufry Wojtaszczyk. Las explicaciones son propias y los detalles que faltan en el bosquejo están señalados. No se distribuyen copias extensas de los documentos originales.
