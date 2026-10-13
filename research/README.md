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
3. Los once problemas tienen implementaciones propias, ejemplos automatizados o validadores constructivos. No se afirma aceptación por un juez externo ni validación general a escala máxima. La tabla vigente de evidencia está en README y las fichas en `src/data/deep-dives.ts`.
4. W/U/Q amplían los laboratorios Y/P. Los módulos más difíciles combinan resultados calculados y recorridos manuales expresamente identificados. S mantiene estado parcial por su dependencia de una demostración estructural externa; R y T incorporan desarrollos y comprobaciones adicionales.
5. No se incorporó código de terceros ni se afirma haber contrastado implementaciones de GitHub/Codeforces.

## Observaciones que evitan errores frecuentes

- Y: `XX → X` admite cualquier longitud de bloque. Los tres invariantes no solo son necesarios: la construcción alcanza la cota.
- P: deben comprobarse luces de cero y un botón, y minimizar por componente. El coste de almacenar la traza completa difiere del algoritmo sin traza.
- V: las puntuaciones se normalizan por el tamaño de cada dado. Solo se consideran valores enteros positivos realizables.
- R: animales de igual tipo no deben tratarse como etiquetas únicas al razonar sobre paridad.
- S: la cota O(n²) no sustituye la recurrencia. La segunda iteración incorpora bases, rangos y transiciones de Backhouse–Truong; la normalización se utiliza como teorema externo explícito.
- Z: el enunciado garantiza existencia aunque el bosquejo incluya un caso general imposible. Las multiplicidades necesitan más de 32 bits.
- W: puede no existir ninguna mentira. El argumento de intersección de cuatro acuerdos funciona también entonces.

Los textos completos extraídos y archivos descargados de investigación no forman parte del repositorio distribuible. Se conservan enlaces y datos de ejemplo, no una copia extensa de los originales.

## Fuentes primarias añadidas en la segunda iteración

- [R. Backhouse y H. Truong, The Capacity-C Torch Problem](https://people.cs.nott.ac.uk/psarb2/MPC/TorchProblem.pdf): la sección4.5 especifica la recurrencia y sus límites; las secciones anteriores prueban la representación por bolsas y su ordenación. La implementación se contrasta además con caminos mínimos sobre estados físicos. No se equipara esa comprobación pequeña con una nueva prueba del teorema estructural.
- [J. Yu y D. Rus, Pebble Motion on Graphs with Rotations](https://people.csail.mit.edu/jingjin/files/wafr14.pdf): sección3, teoremas1/2 y proposición1, para generación de permutaciones por rotaciones en componentes totalmente ocupadas. Se usa el caso sin huecos, no las reglas del rompecabezas15.
- Se descartó como evidencia de edición un repositorio de terceros que mezclaba títulos de distintas finales. No se trasladó código suyo.
- Revisado el enunciado X, páginas17–18: pedir una carta propia no constituye engaño. Esa precisión tiene consecuencias directas sobre los dominios del matching.
- Las explicaciones, los ejemplos desarrollados y el código son propios. Las fuentes de referencia se atribuyen por enlace; no se copian páginas ni soluciones extensas.
