# Registro de investigación · 46th ICPC World Finals

Revisión: 12 de octubre de 2026. El contenido estructurado, incluidos entrada, salida, restricciones, ejemplos, estrategias, variables, argumentos, costes, casos límite y asuntos pendientes de **los once problemas**, se encuentra en [`src/data/problems.ts`](../src/data/problems.ts). Se usa directamente en la aplicación para evitar divergencia entre registro y fichas.

## Fuentes y alcance

- Enunciados: PDF aportado por el usuario, `C:/Users/USER/Downloads/icpc2022.pdf`, 22 páginas. Se revisaron todas las páginas con contenido. Los números de página de cada problema constan en el campo `pages`.
- [Concurso Codeforces Gym 105254](https://codeforces.com/gym/105254): confirma la correspondencia P–Z y los nombres. Los enlaces de cada ficha llevan al problema concreto.
- [Índice HTML solicitado](https://icpcarchive.github.io/ICPC-World-Finals/2022-ICPC-World-Finals/solutions/index.html) y páginas P–Z: intentadas individualmente. T respondió; las otras páginas devolvieron error en la herramienta web. No se interpreta un error de acceso como ausencia del documento.
- [PDF de bosquejos](https://icpc.global/worldfinals/problems/2022-ICPC-World-Finals/finals2022solutions.pdf): revisadas las diez páginas. Autores: Per Austrin, Arnav Sastry, Paul Wild y Jakub Onufry Wojtaszczyk. Es un análisis no oficial que declara no ser una solución completa.

La cabecera del PDF de enunciados menciona Luxor / ICPC 2023; la colección está identificada como **World Finals 2022 / 46th**. No se ha mezclado con la 47th edición. El esquema P–Z coincide con el concurso indicado por el usuario.

## Criterio de evidencia

1. Los ejemplos son datos oficiales del PDF, transcritos como fixtures. En problemas constructivos una salida de ejemplo no es necesariamente la única respuesta.
2. El resto son explicaciones propias, con derivaciones explícitas. Donde el bosquejo omite una prueba o recurrencia, se indica.
3. P e Y tienen implementaciones propias, ejemplos automatizados y oráculos pequeños. No se afirma aceptación por un juez externo ni validación a escala máxima.
4. U, W y los siete módulos restantes disponen de fichas, preguntas, guiones y ejercicios; sus visualizadores posteriores y solucionadores completos están pendientes.
5. No se incorporó código de terceros ni se afirma haber contrastado implementaciones de GitHub/Codeforces.

## Observaciones que evitan errores frecuentes

- Y: `XX → X` admite cualquier longitud de bloque. Los tres invariantes no solo son necesarios: la construcción alcanza la cota.
- P: deben comprobarse luces de cero y un botón, y minimizar por componente. El coste de almacenar la traza completa difiere del algoritmo sin traza.
- V: las puntuaciones se normalizan por el tamaño de cada dado. Solo se consideran valores enteros positivos realizables.
- R: animales de igual tipo no deben tratarse como etiquetas únicas al razonar sobre paridad.
- S: la cota O(n²) no sustituye la derivación de la recurrencia; está pendiente.
- Z: el enunciado garantiza existencia aunque el bosquejo incluya un caso general imposible. Las multiplicidades necesitan más de 32 bits.
- W: puede no existir ninguna mentira. El argumento de intersección de cuatro acuerdos funciona también entonces.

Los textos completos extraídos y archivos descargados de investigación no forman parte del repositorio distribuible. Se conservan enlaces y datos de ejemplo, no una copia extensa de los originales.
