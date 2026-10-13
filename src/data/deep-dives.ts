export type Checkpoint = { kind: string; question: string; rubric: string };
export type DeepDive = {
  status: "Verificado localmente" | "Parcialmente verificado";
  evidence: string;
  limitations: string[];
  sources: { title: string; url: string }[];
  example: string;
  walk: { title: string; state: string; why: string }[];
  code: { line: string; why: string }[];
  structures: string[];
  proof: string[];
  costs: string[];
  time: string;
  space: string;
  oral: string[];
  checkpoints: Checkpoint[];
};
const official = {
  title: "Análisis de los jueces (no oficial) · World Finals 2022",
  url: "https://icpc.global/worldfinals/problems/2022-ICPC-World-Finals/finals2022solutions.pdf",
};
const checks = (
  reason: string,
  data: string,
  cost: string,
  proof: string,
): Checkpoint[] => [
  {
    kind: "Razonamiento",
    question:
      "Reproduce el ejemplo sin consultar el recorrido. Justifica la decisión clave.",
    rubric: reason,
  },
  {
    kind: "Estructuras",
    question: "¿Qué información guardas y qué operaciones exige el algoritmo?",
    rubric: data,
  },
  {
    kind: "Complejidad",
    question:
      "Deriva tiempo y memoria; distingue el solucionador de guardar una traza.",
    rubric: cost,
  },
  {
    kind: "Correctitud",
    question:
      "Explica necesidad y suficiencia. ¿Qué caso rompe una simplificación tentadora?",
    rubric: proof,
  },
];
export const deepDives: Record<string, DeepDive> = {
  Q: {
    status: "Verificado localmente",
    evidence:
      "Todas las permutaciones hasta n=6, cada una frente a los 2ⁿ repartos físicos de pilas; fórmula y traza implementadas.",
    limitations: [
      "No se ha enviado al juez externo. El laboratorio limita n a 9; el solucionador no necesita enumerar repartos.",
    ],
    sources: [official],
    example:
      "Llegan 1,2,3,4,5 y se retiran 4,2,5,3,1. Esperanza total: 7 movimientos.",
    walk: [
      {
        title: "Contar las retiradas",
        state: "doble = 2·5 = 10",
        why: "Cada contenedor se retira una sola vez: aporta un movimiento seguro.",
      },
      {
        title: "Primer pedido: 4",
        state: "activos = {1,2,3,5}; extra = (5−4)/2 = 1/2; doble = 11",
        why: "Solo 5 pudo llegar encima de 4. Comparten pila con probabilidad 1/2.",
      },
      {
        title: "Transición 4 → 2",
        state: "activos = {1,3,5}; h=2; mayores que h: {3,5}; doble=13",
        why: "Cada uno de esos dos contenedores tiene probabilidad 1/2 de quedar entre los pedidos en el orden conjunto.",
      },
      {
        title: "Transición 2 → 5",
        state: "activos = {1,3}; h=2; mayores: {3}; doble=14",
        why: "Se retira el pedido actual antes de consultar. No se cuenta 5 como obstáculo de sí mismo.",
      },
      {
        title: "Terminar",
        state: "5→3: activos {1}, h=3; 3→1: activos {}; resultado 14/2=7",
        why: "No queda ninguna etiqueta elegible en estas transiciones.",
      },
    ],
    code: [
      {
        line: "BIT ← frecuencias 1; doble ← 2n",
        why: "Almacenar el doble evita redondeos: cada contribución es 0 o 1/2.",
      },
      {
        line: "eliminar a₀; doble += n − a₀",
        why: "El primer pedido no tiene predecesor. No se puede aplicar la regla de transiciones.",
      },
      {
        line: "para i=1..n−1: eliminar aᵢ; h=min(aᵢ₋₁,aᵢ)",
        why: "Las consultas solo deben incluir contenedores aún disponibles.",
      },
      {
        line: "doble += n−i−1 − prefijoBIT(h)",
        why: "Restar los activos ≤h da los activos estrictamente mayores.",
      },
      {
        line: "devolver doble/2",
        why: "Recuperar la esperanza; el acumulador entero es exacto para los límites.",
      },
    ],
    structures: [
      "Fenwick: árbol[j] suma las frecuencias de [j−lowbit(j)+1,j].",
      "Retirar x: sumar −1 en x, x+lowbit(x), …; consultar prefijo h: sumar h, h−lowbit(h), …",
      "Un arreglo de prefijos estático se invalida al retirar una etiqueta. Simular cada reparto requiere 2ⁿ ejecuciones.",
    ],
    proof: [
      "Representa el orden conjunto como pila izquierda de abajo arriba seguida de pila derecha de arriba abajo. Trasladar una cima mueve la frontera entre pilas, pero conserva ese orden; retirar elimina un elemento.",
      "Después de retirar p, la frontera está donde estaba p. Para sacar q se trasladan exactamente los elementos supervivientes entre p y q en ese orden.",
      "Si v<min(p,q), no puede estar entre ambos: en una misma pila queda bajo ambos, y en pilas distintas queda fuera del intervalo. Si min(p,q)<v<max(p,q), queda entre ellos exactamente para una de las dos elecciones de pila de v respecto al menor. Si v>max(p,q), queda entre ellos cuando p y q están en pilas diferentes. Cada condición tiene probabilidad 1/2.",
      "El primer pedido q requiere trasladar cada v>q de su misma pila, también con probabilidad 1/2. Sumar indicadores y las n retiradas demuestra la fórmula. No se necesita independencia entre indicadores.",
    ],
    costs: [
      "Hay n eliminaciones y n−1 consultas. Cada operación salta por bits y visita O(log n) posiciones.",
      "Tiempo O(n log n); árbol y permutación O(n). Enumerar todos los repartos con simulación directa es O(2ⁿ n²). Las instantáneas del laboratorio cuestan O(n²) y se omiten en el solucionador.",
    ],
    time: "O(n log n)",
    space: "O(n)",
    oral: [
      "0:00–0:45 · Busco el número esperado de movimientos, no la mejor asignación. Cada retirada cuesta uno.",
      "0:45–1:30 · Dibujo las dos pilas como un orden conjunto con una frontera móvil. Los traslados conservan el orden.",
      "1:30–3:15 · Explico el primer término (n−a₀)/2; después cuento supervivientes >min de pedidos consecutivos. Reproduzco 4,2,5,3,1: 5+½+1+½=7.",
      "3:15–4:15 · Pruebo los tres casos de posición relativa de v y uso linealidad de la esperanza, sin independencia.",
      "4:15–5:00 · Fenwick permite eliminar y contar prefijos en log n; n operaciones, memoria lineal. El doble de la respuesta es entero.",
    ],
    checkpoints: checks(
      "Debe obtener 7 y tratar el primer pedido por separado.",
      "Frecuencias activas; actualizar −1 y consultar prefijos con lowbit.",
      "n consultas/actualizaciones logarítmicas, O(n) memoria.",
      "Orden conjunto invariante, tres casos por etiqueta y linealidad sin independencia.",
    ),
  },
  W: {
    status: "Verificado localmente",
    evidence:
      "Diez determinantes no nulos; pruebas de todas las ternas de cantidades 0..3 con cero o una respuesta alterada en cada posición.",
    limitations: [
      "Simulador local del protocolo; no se conecta a un juez interactivo.",
    ],
    sources: [official],
    example:
      "Cantidades (2,3,1). Respuestas correctas 2,3,1,6,11. Se altera la segunda a 8: recibimos 2,8,1,6,11.",
    walk: [
      {
        title: "Cinco mediciones",
        state: "x; y; z; x+y+z; x+2y+3z",
        why: "Cualesquiera tres filas son independientes; no basta repetir arbitrariamente una pregunta.",
      },
      {
        title: "Probar 1,2,3",
        state: "candidato (2,8,1); predice 11 y 21; solo 3 coincidencias",
        why: "Resolver tres ecuaciones no garantiza que ninguna de ellas sea la mentira.",
      },
      {
        title: "Probar 1,3,4",
        state: "x=2, z=1, y=6−2−1=3",
        why: "Esta terna excluye la respuesta corrupta.",
      },
      {
        title: "Validar",
        state: "predicciones 2,3,1,6,11 → cuatro coincidencias",
        why: "La quinta respuesta sirve para distinguir soluciones espurias. La discrepancia está en la consulta 2.",
      },
    ],
    code: [
      {
        line: "preguntar las cinco filas de A",
        why: "A = [100;010;001;111;123]. Cada consulta cumple coeficientes enteros pequeños.",
      },
      {
        line: "para cada terna I: d=det(A[I])",
        why: "Hay C(5,3)=10 ternas. Todos los determinantes son distintos de cero.",
      },
      {
        line: "calcular numeradores de Cramer",
        why: "Sustituir cada columna por respuestas; exigir divisibilidad por d y valores ≥0.",
      },
      {
        line: "contar las cinco igualdades A·candidato = respuestas",
        why: "Aceptar únicamente con al menos cuatro coincidencias.",
      },
    ],
    structures: [
      "Matriz fija 5×3, vector de cinco respuestas y una terna candidata.",
      "Cramer con enteros evita falsos positivos por tolerancia. Los determinantes y numeradores son pequeños bajo el límite de respuesta.",
    ],
    proof: [
      "Como hay a lo sumo una mentira, existen cuatro ecuaciones verdaderas; alguna terna enumerada determina la solución real.",
      "Si dos candidatos concordaran con cuatro de las cinco respuestas, compartirían al menos tres ecuaciones. Esas tres filas son independientes; los candidatos son iguales.",
      "Exigir cantidades enteras no negativas descarta soluciones fuera del dominio. Una respuesta alterada que coincide con la verdadera simplemente se comporta como cero mentiras.",
    ],
    costs: [
      "Cinco consultas, diez sistemas 3×3 y cinco comparaciones por candidato: número constante de operaciones y memoria constante.",
      "La alternativa de enumerar cantidades hasta una cota B cuesta O(B³), y una cota inventada podría excluir la solución.",
    ],
    time: "O(1)",
    space: "O(1)",
    oral: [
      "Formulo tres incógnitas enteras y permito una respuesta falsa.",
      "Presento las cinco filas y explico por qué necesitamos independencia de cualquier terna.",
      "Ensayo (2,8,1), lo rechazo y recupero (2,3,1) usando consultas 1,3,4.",
      "Existencia: una terna sin mentira. Unicidad: dos candidatos compartirían tres ecuaciones independientes.",
      "Diez sistemas pequeños: tiempo y memoria constantes; aritmética entera y protocolo separado del simulador.",
    ],
    checkpoints: checks(
      "Rechazar (2,8,1): solo coincide con 3 respuestas; aceptar (2,3,1).",
      "Matriz fija y determinantes enteros; comprobar divisibilidad.",
      "C(5,3)=10; cinco validaciones por terna, todo constante.",
      "Intersección de dos conjuntos de cuatro respuestas tiene al menos tres índices. No se asume exactamente una mentira.",
    ),
  },
  U: {
    status: "Verificado localmente",
    evidence:
      "Plantillas verificadas geométricamente para 0≤s≤30, 4≤c≤100; enumeración de las 256 palabras de ocho curvas. Generador lineal y verificador independientes.",
    limitations: [
      "La vista usa hasta 60 piezas de inventario por tipo. Las trazas copian estados; el generador no.",
    ],
    sources: [official],
    example:
      "s=2, c=8. Base LSLLSL; insertar RL antes de las posiciones 0 y 3 (índices desde cero): RLLSLRLLSL, longitud 10.",
    walk: [
      {
        title: "Cota de inventario",
        state: "s par=2, c par=8; c≡0 (mod 4)",
        why: "Toda vuelta tiene un número par de giros. El ciclo en la cuadrícula tiene longitud par; por tanto las rectas también son pares.",
      },
      {
        title: "Elegir la base",
        state: "LSLLSL usa 2 rectas y 4 curvas",
        why: "Es un rectángulo de seis celdas; los dos cortes indicados apuntan en direcciones opuestas.",
      },
      {
        title: "Ampliar",
        state: "(RL) + LSL + (RL) + LSL",
        why: "Cada escalón RL desplaza la frontera diagonalmente sin cambiar su dirección final. El escalón opuesto compensa el desplazamiento.",
      },
      {
        title: "Recorrer celdas",
        state:
          "(0,0),(0,1),(1,1),(1,0),(1,−1),(0,−1),(0,−2),(−1,−2),(−1,−1),(−1,0) → (0,0)",
        why: "Las diez celdas son distintas, se recupera la dirección este y se usa todo el inventario permitido.",
      },
    ],
    code: [
      {
        line: "s -= s mod 2; c -= c mod 2",
        why: "Las piezas sobrantes impares no pueden pertenecer a un circuito.",
      },
      {
        line: "si s=0: c -= c mod 4; si c=8: c=4",
        why: "Sin rectas, movimientos horizontales/verticales alternan; cada clase debe tener cantidad par para cerrar.",
      },
      {
        line: "si c=4: base LLLL, insertar S^(s/2) antes de 0 y 2",
        why: "Es un rectángulo ampliado.",
      },
      {
        line: "si s=0 y c≥12: base LRRLRRLRRLRR; insertar (LR)^((c−12)/4) antes de 0 y 6",
        why: "Dos escaleras opuestas separadas por las tapas de la base.",
      },
      {
        line: "si s≥2: base LSLLSL (c≡0) o LSLSLLRL (c≡2)",
        why: "Las bases usan 4 o 6 curvas y dos rectas.",
      },
      {
        line: "insertar (RL)^k S^t antes de 0 y 3; k=(c−curvasBase)/4; t=(s−2)/2",
        why: "Los índices son de la base original, no de la cadena ya expandida.",
      },
    ],
    structures: [
      "Cadena de salida y estado (x,y,d). d=0,1,2,3 representa este,sur,oeste,norte. L resta uno, R suma uno módulo 4; después se avanza una celda.",
      "Conjunto de coordenadas para detectar colisiones en O(L) esperado. El cierre final no vuelve a insertar la celda inicial.",
    ],
    proof: [
      "Necesidad: giros netos múltiplos de cuatro implican c par; cierre en cuadrícula bipartita implica s+c par. Si s=0 alternan ejes, de modo que c/2 debe ser par.",
      "Ocho curvas es un caso finito: enumerar todas las 2⁸ palabras L/R y comprobar posición, orientación y celdas descarta las 256. Esa es una prueba exhaustiva del caso excepcional, no una extrapolación estadística.",
      "Suficiencia de plantillas: las dos ampliaciones tienen desplazamientos opuestos y la misma orientación final que sus cortes. Las escaleras son monótonas y quedan en lados opuestos; las tapas originales las separan por una celda. Al añadir un escalón a cada lado se trasladan las tapas y se prolongan ambas fronteras sin cruzarlas. Las rectas prolongan esas fronteras en direcciones opuestas. La base y cada ampliación conservan un único circuito.",
      "Se alcanza la cota par del inventario salvo sin rectas, donde se alcanza el mayor múltiplo de cuatro admisible distinto de ocho. Por tanto no puede existir un circuito más largo. La validación celda a celda comprueba cada salida concreta.",
    ],
    costs: [
      "La búsqueda ingenua de palabras es O(3^(s+c)) antes de verificarlas.",
      "La plantilla escribe exactamente L≤s+c caracteres: O(L). Guardar la salida y validar celdas usa O(L); emitir sin almacenarla requiere solo contadores.",
    ],
    time: "O(s+c)",
    space: "O(s+c) con salida y verificador",
    oral: [
      "Construyo el lazo más largo sin repetir celda. Cerrar dirección no basta.",
      "Obtengo las cotas de paridad; sin rectas necesito c múltiplo de cuatro y excluyo ocho.",
      "Expando LSLLSL con dos RL para s=2,c=8 y recorro las diez celdas.",
      "Explico escaleras opuestas, separación por tapas y cota alcanzada. La excepción ocho se certifica exhaustivamente.",
      "Escritura y verificación lineales. Distinguir generador, verificador y copia de instantáneas.",
    ],
    checkpoints: checks(
      "RLLSLRLLSL tiene 2 S y 8 curvas; diez celdas distintas y cierre.",
      "Estado posición/dirección y conjunto de celdas; contar L−R no detecta colisiones.",
      "Cada pieza se emite/visita una vez; traza completa puede ocupar O(L²).",
      "Paridades necesarias, excepción ocho y construcción que alcanza la cota; orientación no implica cierre.",
    ),
  },
  S: {
    status: "Parcialmente verificado",
    evidence:
      "Recurrencia completa contrastada con Backhouse–Truong §4.5 y Dijkstra de estados físicos para 189 instancias con n≤7, capacidades 2..n+1.",
    limitations: [
      "La suficiencia de las formas regulares usa el teorema de normalización citado: se explica su papel, pero la demostración completa del artículo no se reproduce aquí.",
      "Medición puntual sin traza: n=10000, c=2 y todos los tiempos1 produce19997; 405ms y352MiB RSS en este equipo. No es un benchmark general ni incluye el registro didáctico.",
    ],
    sources: [
      official,
      {
        title: "Backhouse y Truong · The Capacity-C Torch Problem, §3–4.5",
        url: "https://people.cs.nott.ac.uk/psarb2/MPC/TorchProblem.pdf",
      },
    ],
    example:
      "Tiempos ordenados 1,2,5,10, capacidad 2. Mejor tiempo: 17; devolver siempre a 1 da 19.",
    walk: [
      {
        title: "Base",
        state: "F(2,0)=2; P(1)=1; P(2)=3",
        why: "Dos personas cruzan juntas; no hace falta regreso.",
      },
      {
        title: "Resolver una deuda",
        state: "F(2,1)=2+P(2)+F(2,0)=7",
        why: "Un viaje de los dos rápidos y sus dos regresos presupuestados consume una unidad neta de deuda. Es contabilidad, no una secuencia temporal literal.",
      },
      {
        title: "Alternativa con un rápido",
        state: "F(3,0)=5+P(1)+F(2,0)=8",
        why: "La transición i=1 paga al lento y el regreso del rápido.",
      },
      {
        title: "Decisión final",
        state: "F(4,0)=min(10+F(2,1),10+P(1)+F(3,0))=min(17,19)",
        why: "La primera rama transporta juntos a 5 y 10; la segunda separa sus viajes.",
      },
      {
        title: "Secuencia física legal",
        state: "(1,2)→:2; 1←:1; (5,10)→:10; 2←:2; (1,2)→:2; total17",
        why: "Los estados de la tabla se ordenan para producir una secuencia realizable; e no es un número de personas en una orilla.",
      },
    ],
    code: [
      {
        line: "ordenar t[1..N]; C=min(c,N); P[i]=Σ₁ⁱt[j]",
        why: "Los retornadores de una forma regular son un prefijo de los más rápidos.",
      },
      {
        line: "F(n,e): coste regular con n personas y e viajes puros pendientes de financiar",
        why: "Estado de bolsa de viajes. Una transición con i retornadores consume i−1 unidades netas de deuda.",
      },
      { line: "F(n,0)=t[n] para 2≤n≤C", why: "Todo el grupo cruza una vez." },
      {
        line: "n≤C,e>0: min₂≤i≤min(n,e+1) t[n]+P[i]+F(i,e+1−i)",
        why: "El viaje de los n rápidos aporta i regresos y reduce el problema a esos i retornadores.",
      },
      {
        line: "n>C: min_max(0,C+2−n)≤i≤min(C−1,e+1) t[n]+P[i]+F(n−C+i,e+1−i)",
        why: "Cruzan C−i lentos definitivamente y i rápidos que regresarán. i=0 añade una deuda.",
      },
      {
        line: "llenar n ascendente, e ascendente, 0≤e≤⌊(N−n)/C⌋; devolver F(N,0)",
        why: "Cada dependencia reduce n o, si lo conserva, reduce e. El límite representa los lotes puros ya separados.",
      },
    ],
    structures: [
      "Tabla triangular F[n][e] y sumas prefijas de tiempos; +∞ para alternativas inexistentes.",
      "e es un saldo contable de viajes, no un estado físico de la antorcha. Confundir ambos hace que parezca permitido enviar un grupo sin antorcha.",
      "Oráculo independiente: Dijkstra sobre (máscara de personas al otro lado, lado de antorcha), con todas las travesías de hasta C personas.",
    ],
    proof: [
      "Lema estructural utilizado (Backhouse–Truong): existe una bolsa óptima ordenable con regresos individuales y viajes regulares formados por rápidos retornadores y un bloque de lentos definitivos, más viajes de rápidos y el viaje final. La referencia demuestra tanto la normalización como que la bolsa se puede ordenar. Este lema es la parte difícil, no una consecuencia de la DP.",
      "Dado el lema, retirar un viaje regular con i retornadores cuesta t[n]+P[i]. Retira C−i lentos y cambia el saldo en 1−i: exactamente la segunda recurrencia. Para n≤C, un viaje de todo el grupo deja solo los i retornadores: primera recurrencia.",
      "Los rangos excluyen un subproblema de una sola persona y saldos negativos. Partiendo de (N,0), el aumento de e exige retirar C personas, por lo que e≤⌊(N−n)/C⌋.",
      "Inducción lexicográfica en (n,e): la base realiza un cruce; cada candidato combina un viaje regular y un subproblema óptimo menor. El lema asegura que un óptimo aparece en alguna rama y que la solución de bolsa corresponde a un horario.",
    ],
    costs: [
      "Hay Σₙ(1+⌊(N−n)/C⌋)=O(N+N²/C) celdas. Cada una examina como máximo C candidatos.",
      "Para N>C, el producto es O(N²); si N≤C se devuelve el mayor tiempo. Ordenar cuesta O(N log N). Memoria de valores O(N+N²/C); el registro didáctico de celdas también ocupa esa cota.",
      "Dijkstra por subconjuntos es exponencial: hasta 2^(N+1) estados y transiciones por grupos. Solo sirve de oráculo pequeño.",
    ],
    time: "O(N²) (más ordenar)",
    space: "O(N+N²/C)",
    oral: [
      "Antorcha compartida y coste máximo de cada grupo; la decisión local más rápida puede fallar.",
      "Explico el lema de viajes regulares y declaro su dependencia bibliográfica. Defino n y e como contabilidad.",
      "Escribo coste t[n]+P[i], los dos destinos y las bases. Reproduzco F(4,0)=min(17,19).",
      "Distingo la inducción de la DP del teorema que normaliza horarios; muestro un horario legal de coste17.",
      "O(N²/C) estados y O(C) alternativas dan O(N²), con el término lineal de la tabla.",
    ],
    checkpoints: checks(
      "Debe mostrar los cinco cruces de coste17 y explicar por qué la alternativa cuesta19.",
      "F(n,e), prefijos P e infinito. e no cuenta personas físicamente en una orilla.",
      "Contar celdas y alternativas, incluyendo n≤C.",
      "La inducción prueba la recurrencia condicionada al lema de normalización; no fingir haber demostrado ese lema.",
    ),
  },
  R: {
    status: "Verificado localmente",
    evidence:
      "Lowlink iterativo, bloques, KMP y paridad implementados. Comparación con BFS de rotaciones para todos los grafos simples con n≤4 y etiquetas distintas/repetidas.",
    limitations: [
      "La prueba usa composición y conjugación de permutaciones; se desarrolla abajo y se contrasta con Yu–Rus §3. No hay aceptación en juez externo ni benchmark de n=400000.",
      "No se construye una secuencia general de movimientos: el problema solo pide decidir factibilidad.",
    ],
    sources: [
      official,
      {
        title: "Yu y Rus · Pebble Motion on Graphs with Rotations, §3",
        url: "https://people.csail.mit.edu/jingjin/files/wafr14.pdf",
      },
    ],
    example:
      "Dos triángulos (0,1,2) y (0,3,4). Con etiquetas distintas, intercambiar solo 1 y 2 es imposible; rotar 0,1,2 sí es posible.",
    walk: [
      {
        title: "Eliminar puentes",
        state:
          "En este grafo no hay puentes. Los cinco vértices pertenecen a una componente.",
        why: "Ningún movimiento puede transportar un animal por un puente: quedaría fuera de todo ciclo.",
      },
      {
        title: "Bloques",
        state: "Dos bloques con 3 aristas y 3 vértices cada uno; ambos impares",
        why: "Es un cactus de ciclos impares. Cada rotación es una permutación par.",
      },
      {
        title: "Objetivo impar",
        state: "[0,2,1,3,4] tiene una transposición; rechazo",
        why: "Una composición de permutaciones pares no puede producir una impar.",
      },
      {
        title: "Objetivo par",
        state: "[2,0,1,3,4] se logra con una rotación del primer triángulo",
        why: "El recorrido es una ejecución legal concreta, no una animación de una permutación arbitraria.",
      },
      {
        title: "Si hay etiquetas repetidas",
        state:
          "Cambiar las identidades de dos animales con igual etiqueta no altera la observación",
        why: "Se puede elegir el emparejamiento de identidades con paridad correcta; basta igualdad de multiconjuntos en el caso alternante.",
      },
    ],
    code: [
      {
        line: "DFS lowlink: puente(u,v) si low[v]>tin[u]",
        why: "Una arista de árbol sin ruta de regreso a u o sus ancestros no pertenece a un ciclo.",
      },
      {
        line: "eliminar puentes; comparar multiconjuntos por componente",
        why: "Las etiquetas no pueden salir de su componente.",
      },
      {
        line: "si un vértice: igualdad; si ciclo simple: KMP(objetivo, inicial+inicial)",
        why: "En un ciclo solo se admite un desplazamiento cíclico, aunque haya etiquetas repetidas.",
      },
      {
        line: "obtener bloques biconexos con una pila de aristas DFS",
        why: "Un bloque es ciclo si aristas=vértices y todos sus grados internos son dos; en un bloque biconexo simple basta la igualdad.",
      },
      {
        line: "si algún bloque no es ciclo o tiene ciclo par: aceptar multiconjunto",
        why: "Se genera el grupo simétrico completo.",
      },
      {
        line: "si todos los bloques son ciclos impares: aceptar si duplicados o paridad par",
        why: "Con etiquetas distintas construir la permutación y contar ciclos: signo=(−1)^(n−ciclos).",
      },
    ],
    structures: [
      "Listas de adyacencia con identificadores de arista; tin,low, padre y pila explícita evitan desbordar la pila del lenguaje.",
      "Pila de aristas para bloques; ordenación para multiconjuntos; KMP para rotaciones; mapa de etiquetas a posiciones para paridad.",
    ],
    proof: [
      "Un movimiento simultáneo sin huecos induce ciclos dirigidos de longitud al menos tres: un intercambio a lo largo de un túnel está prohibido. Los puentes quedan inmóviles y las componentes son independientes.",
      "Un ciclo simple genera únicamente sus potencias. En particular un ciclo de cinco vértices no permite cualquier permutación par: debe tratarse antes del caso de varios ciclos.",
      "Herramientas algebraicas (composición de derecha a izquierda): conjugar g·(a,b,c)·g⁻¹ da (g(a),g(b),g(c)); por tanto transporta un movimiento sin afectar las demás etiquetas. Los 3-ciclos generan todas las permutaciones pares: se agrupan transposiciones de dos en dos; dos que comparten elemento forman un 3-ciclo y dos disjuntas son producto de dos 3-ciclos. Además, (z,a,b)(z,b,c)=(a,b,c). Basta generar los 3-ciclos con un pivote fijo z.",
      "Lema de los triángulos: los ciclos (z,vᵢ,vᵢ₊₁) de una cadena generan todas las permutaciones pares de sus vértices y z. En efecto, conjugando (z,b,c) por (z,a,b) se obtiene (a,z,c), cuyo inverso es (z,a,c). Repetir a lo largo de la cadena obtiene cualquier par de extremos con pivote z; la identidad anterior obtiene cualquier 3-ciclo. También permite añadir un vértice nuevo a un conjunto con todas las permutaciones pares si se dispone de un 3-ciclo que contiene al nuevo y a dos antiguos.",
      "Dos ciclos A=(o,a₁,…,aₚ) y B=(o,b₁,…,b_q) que solo comparten o satisfacen ABA⁻¹B⁻¹=(o,a₁,b₁). Sus conjugados por potencias de A son los triángulos (aᵢ,aᵢ₊₁,b₁): por el lema generan todas las pares en A∪{b₁}. Elegir dos vértices de A distintos de o y conjugar su 3-ciclo con b₁ por potencias de B añade cada bⱼ. Ya se generan todas las pares en A∪B. Un nuevo ciclo del cactus toca la unión en un único vértice; tomar un 3-ciclo disponible en la unión que pase por ese vértice repite el mismo argumento. Inducción sobre el árbol de bloques demuestra suficiencia en todo cactus con al menos dos ciclos.",
      "Bloque no cíclico: contiene tres caminos internamente disjuntos entre dos vértices (theta). Denota su camino compartido por b₁,…,b_r, r≥2, y los interiores de los otros por a₁,…,aₚ y c₁,…,c_q, con p,q≥1 (en un grafo simple, elegir como compartido el único camino que pudiera no tener interiores). Las rotaciones ℓ=(b₁,…,b_r,aₚ,…,a₁), rót=(b₁,c₁,…,c_q,b_r,…,b₂) y o=(b₁,c₁,…,c_q,b_r,aₚ,…,a₁) verifican rót·ℓ·o⁻¹=(b₁,c₁), comprobando la imagen de cada vértice. Es una transposición de vecinos del ciclo derecho. Conjugarla por sus rotaciones da todas las transposiciones vecinas, y estas generan cualquier permutación en ese ciclo. Ahora se dispone de (b₁,b₂), vecina también en el ciclo izquierdo; repetir lo extiende a toda la theta.",
      "Extender la theta a su bloque: una subestructura biconexa propia admite una oreja, un camino con extremos ya incluidos e interiores nuevos. Si una componente exterior solo tuviera un punto de unión, ese punto sería de articulación, contradicción. Unir la oreja con un camino interior da un ciclo con una pareja de vecinos ya controlados; conjugar su transposición añade todos los vértices de la oreja. Repetir cubre el bloque. Para pasar a otro bloque que solo toca en o, usar una transposición (o,h) con h del bloque ya controlado y fuera de un ciclo nuevo: sus conjugados por el ciclo dan (v,h) para cada v del ciclo, formando una estrella de transposiciones. Caminos de ciclos cubren cualquier bloque sin puentes. Así cualquier componente con un bloque complejo permite todas las permutaciones.",
      "En un cactus, si hay un ciclo de longitud par, su rotación es impar. Ya tenemos todas las pares; multiplicar por esa rotación alcanza todas las impares. Si todos los ciclos son impares, sus rotaciones son pares y ninguna composición puede salir del grupo alternante. Esto prueba ambas direcciones de la clasificación.",
      "Si solo hay ciclos impares, ninguna composición es impar. Si las etiquetas se repiten, los dos emparejamientos que intercambian identidades iguales tienen signos opuestos y el mismo objetivo visible.",
    ],
    costs: [
      "DFS, bloques y KMP procesan cada vértice/arista un número constante de veces: O(n+m).",
      "Ordenar las etiquetas por componente cuesta a lo sumo O(n log n). Paridad es O(n). Memoria O(n+m).",
      "BFS de configuraciones puede visitar n! estados: sirve para comprobar grafos diminutos, no para n=400000.",
    ],
    time: "O(n log n+m)",
    space: "O(n+m)",
    oral: [
      "Los movimientos sin choques son rotaciones de ciclos; no puedo intercambiar dos vecinos directamente.",
      "Elimino puentes y comparo multiconjuntos. Distingo vértices fijos y ciclos simples.",
      "Para varios ciclos clasifico bloques: uno complejo o un ciclo par da todas las permutaciones; cactus impar da solo pares.",
      "Muestro el conmutador de dos triángulos y explico cómo sus conjugados propagan 3-ciclos. Una theta permite una transposición; cierro con paridad y duplicados.",
      "Lowlink y KMP lineales; ordenar añade n log n. No necesito producir los movimientos.",
    ],
    checkpoints: checks(
      "Rechazar una única transposición en dos triángulos; aceptar una rotación.",
      "lowlink, bloques, multiconjuntos, KMP y ciclos de una permutación.",
      "Lineal en grafo más ordenación de n etiquetas; BFS n! no escala.",
      "Distinguir ciclo simple de cactus; explicar conmutador, conjugación y propagación. Una theta proporciona una transposición; tratar duplicados sin imponer una paridad artificial.",
    ),
  },
  X: {
    status: "Verificado localmente",
    evidence:
      "Matching ejecutable y pruebas frente a todos los repartos equilibrados de un mazo pequeño en 500 registros deterministas; contradicción oficial en acción4.",
    limitations: [
      "El enunciado garantiza turnos y demás reglas. No se pretende arbitrar registros con violaciones ajenas a las dos formas de engaño permitidas.",
    ],
    sources: [official],
    example:
      "1 pide 3C a 2: no. 2 recibe 3A de 3 y 3D de 4. 2 pide 3C a 1: no. Primera contradicción: acción4.",
    walk: [
      {
        title: "Primera petición",
        state:
          "Obligación de J1: alguna carta del conjunto3. 3C no era inicialmente de J2.",
        why: "Pedir exige poseer alguna carta del conjunto; puede ser incluso la carta pedida.",
      },
      {
        title: "Recibir 3A",
        state:
          "3A era inicialmente de J3 y ahora es de J2. J2 debía tener otra carta del conjunto antes de recibirla.",
        why: "La obligación se registra antes de transferir, y no desaparece por recibir una carta después.",
      },
      {
        title: "Recibir 3D",
        state:
          "3D era inicialmente de J4. Las obligaciones históricas de J1 y J2 no pueden usar A ni D.",
        why: "Una posesión conocida actual satisface peticiones nuevas, pero no borra obligaciones anteriores.",
      },
      {
        title: "Último no",
        state: "3C tampoco era de J1. J1 necesita 3B y J2 necesita 3B.",
        why: "Dos huecos distintos compiten por una sola carta: no existe matching. Antes, J1 podía tener C y J2 B.",
      },
    ],
    code: [
      {
        line: "inicial[c]=desconocido; actual[c]=desconocido; dominio[c]=todos",
        why: "Separar tiempo inicial de posesión actual es esencial.",
      },
      {
        line: "antes de pedir: si no hay carta conocida del conjunto, registrar obligación (jugador, conjunto, candidatas)",
        why: "Sin transferencias desconocidas, las candidatas son cartas nunca reveladas que podrían ser inicialmente de ese jugador.",
      },
      {
        line: "no: excluir al preguntado del dominio, o comprobar dueño actual",
        why: "La exclusión solo se aplica a dueño inicial si la carta nunca se movió.",
      },
      {
        line: "yes / cuarteto: fijar dueño previo de cartas desconocidas y actualizar actual",
        why: "Una revelación satisface una obligación anterior solo si esa carta pertenecía entonces al jugador obligado.",
      },
      {
        line: "fusionar obligaciones por jugador/conjunto conservando la más restrictiva",
        why: "Mientras sigan sin satisfacerse, las candidatas forman conjuntos anidados que solo disminuyen.",
      },
      {
        line: "crear hueco obligatorio por obligación y completar hasta 8−inicialesFijas por jugador",
        why: "Los demás huecos son libres; las aristas respetan dominios y candidatas.",
      },
      {
        line: "matching por caminos aumentantes; detenerse en primer fallo",
        why: "Un matching perfecto equivale a un reparto inicial completo compatible.",
      },
    ],
    structures: [
      "Dominios por carta, dueño inicial fijo y dueño actual conocido (−2 si retirada).",
      "Obligaciones históricas por jugador/conjunto. Al revelar c de dueño p, se satisfacen solo las obligaciones de p que incluían c; en las demás se elimina c.",
      "Grafo bipartito cartas desconocidas ↔ huecos iniciales restantes. Cada carta se usa una vez, cada jugador conserva capacidad inicial ocho.",
    ],
    proof: [
      "Hasta la primera revelación una carta nunca se ha movido, de modo que su dueño actual es su dueño inicial. Después de revelarse, todas sus posiciones se conocen. Esto permite traducir cada no y cada entrega sin ambigüedad temporal.",
      "Si una petición no tiene un testigo conocido, necesita alguna carta desconocida de ese conjunto. Las candidatas de dos obligaciones no satisfechas del mismo jugador/conjunto son anidadas: nuevas evidencias solo eliminan cartas. Basta conservar el conjunto menor. Recibir una carta posteriormente no satisface la afirmación pasada.",
      "Todo reparto válido asigna una carta testigo a cada obligación y completa los huecos libres: induce un matching. Obligaciones de conjuntos diferentes no compiten por el mismo testigo para un jugador.",
      "Recíprocamente, un matching determina un dueño inicial para cada carta y satisface todas las obligaciones históricas. Reproducir las transferencias conocidas verifica cada petición, respuesta y cuarteto. Por tanto el primer prefijo sin matching es exactamente el primer momento de engaño inevitable.",
    ],
    costs: [
      "C cartas producen C huecos y como máximo C² aristas. Cada uno de C intentos de aumento examina O(C²) aristas.",
      "Reconstruir después de n acciones cuesta O(n C³), con C=32. Memoria del solucionador O(C²); guardar todas las instantáneas añade O(n C²).",
      "Enumerar repartos requiere C!/(8!⁴) posibilidades para el mazo estándar antes de simular el registro.",
    ],
    time: "O(n C³), C=32",
    space: "O(C²) sin historial",
    oral: [
      "No busco quién miente: busco si existe algún reparto inicial que explique todo.",
      "Distingo dueño inicial, actual y obligaciones anteriores. Pedir una carta propia no es engaño.",
      "Convierto cartas desconocidas en candidatos de huecos, y muestro los dos huecos obligados a 3B.",
      "Necesidad y suficiencia del matching; conservar obligaciones históricas aunque después lleguen cartas.",
      "C=32, a lo sumo C² aristas y C aumentos por acción: O(n C³). El primer fallo decide el prefijo.",
    ],
    checkpoints: checks(
      "Acción4: J1 y J2 necesitan ambos 3B. Antes J1 puede tener3C.",
      "Dueño inicial separado del actual y obligaciones históricas; no borrar una obligación al recibir una carta.",
      "C aumentos por O(C²) aristas por n acciones; distinguir memoria con historial.",
      "Construir ambas direcciones entre matching y reparto; pedir la carta propia no está prohibido.",
    ),
  },
  Z: {
    status: "Verificado localmente",
    evidence:
      "Reconstrucción contrastada mediante redistribución de subconjuntos en 252 casos generados; caso de 40 palancas nulas sin operaciones bit a bit sobre conteos.",
    limitations: [
      "La vista limita el ejemplo editable a k≤2 y n≤8. El solucionador acepta k≤5, n≤40. No hay validación en juez externo.",
    ],
    sources: [official],
    example:
      "k=2, n=3. M(0,0)=4 y M(2,0)=4; los otros siete conteos son cero. Una respuesta: (0,0),(0,0),(2,0).",
    walk: [
      {
        title: "Proyectar",
        state:
          "Si x₁=0: conteos (8,0,0), f(x)=3. Si x₁≠0: una permutación de (4,4,0), f(x)=2.",
        why: "f es el mínimo exponente de 2 de los conteos no nulos; v₂(0)=∞.",
      },
      {
        title: "Contar palancas cero",
        state: "Σ f=3·3+6·2=21; m({0})=(3·21/9−3)/2=2",
        why: "Se promedia sobre todo F₃², perpendicular del subespacio cero.",
      },
      {
        title: "Línea del primer eje",
        state: "H={x:x₁=0}; Σ_H f=9; m(línea)=(3·9/3−3)/2=3; no nulas=3−2=1",
        why: "Las otras tres líneas tienen multiplicidad no nula cero.",
      },
      {
        title: "Escoger signos provisionales",
        state: "Palancas 0,0,(1,0) → D(0)=4,D(1,0)=4",
        why: "Las proyecciones recuperan líneas {u,−u}, no la orientación de cada palanca.",
      },
      {
        title: "Corregir por traslación",
        state:
          "v=(1,0); M(s)=D(s+v). Invertir la palanca del subconjunto que suma v.",
        why: "Cambiar +u por −u traslada todos los resultados por −u. Se obtiene 0,0,(2,0).",
      },
    ],
    code: [
      {
        line: "para x∈F₃ᵏ: A[r]=Σ_{x·s=r} M[s]; f[x]=min_r v₂(A[r])",
        why: "Los términos cero no restringen el mínimo.",
      },
      {
        line: "masa(G)=(3·Σ_{x∈G⊥} f[x]/|G⊥|−n)/2",
        why: "Primero usar G={0}; después cada línea {0,u,−u}.",
      },
      {
        line: "añadir masa({0}) palancas cero; por línea añadir masa(línea)−masa({0}) copias de u",
        why: "Cada palanca no nula pertenece a una sola línea; elegir representante menor en base3.",
      },
      {
        line: "D₀[0]=1; Dᵢ[s]=Dᵢ₋₁[s]+Dᵢ₋₁[s−uᵢ]",
        why: "Contar subconjuntos sin o con la palanca i; guardar capas para recuperar un subconjunto.",
      },
      {
        line: "buscar v con Dₙ[v]>0 y M[s]=Dₙ[s+v] para todo s",
        why: "El cambio de signos verdadero corresponde a alguna suma alcanzable.",
      },
      {
        line: "retroceder por capas hasta suma0 e invertir las palancas elegidas",
        why: "Si el estado se alcanza sin i, omitirlo; si no, tomar i y restar uᵢ.",
      },
    ],
    structures: [
      "Vectores como k dígitos base3; suma/resta componente a componente módulo3, no suma ordinaria de índices.",
      "Arreglos de 3ᵏ conteos y tabla de n+1 capas. Todos los conteos ≤2⁴⁰ son enteros exactos con Number; los operadores bit a bit de JavaScript truncarían a 32 bits.",
    ],
    proof: [
      "Una palanca perpendicular a x duplica cada conteo proyectado. Para las demás, cada paso reemplaza (a,b,c) por (a+c,b+a,c+b), o su versión inversa. Partiendo de (1,0,0), las diferencias entre componentes tienen magnitud ≤1; la transformación las permuta y cambia signos. Al menos un componente sigue siendo impar: tres valores iguales solo podrían ocurrir si su suma 2^r fuese divisible por3. Por tanto f(x) cuenta exactamente palancas perpendiculares.",
      "Para H=G⊥, una palanca en G es perpendicular a todos los x∈H; una palanca fuera de G lo es a |H|/3. Sumando f sobre H se obtiene |H|m(G)+|H|(n−m(G))/3. Despejar demuestra la fórmula.",
      "Restar el número de palancas cero de la masa de cada línea recupera todas las multiplicidades salvo signos. La inversión de una palanca transforma {0,u} en {0,−u}={0,u}−u; varias inversiones trasladan la distribución por la suma negativa del subconjunto.",
      "La recurrencia D cuenta cada subconjunto exactamente una vez según si incluye la última palanca. Probar todas las traslaciones alcanzables encuentra la orientación original o una equivalente; retroceder por capas produce las inversiones necesarias. La redistribución final es una comprobación adicional.",
    ],
    costs: [
      "Sea m=3ᵏ. Proyectar m vectores sobre m estados cuesta O(k m²). Enumerar perpendiculares de cada línea mantiene esa cota.",
      "La DP y la reconstrucción de distribuciones usan O(n k m); comparar m traslaciones cuesta O(k m²) en esta implementación, que suma dígitos explícitamente.",
      "Tiempo O(k m²+n k m), memoria O(n m+k m). Se podría tabular sumas para ahorrar el factor k en consultas a cambio de O(m²) memoria; aquí no se hace. La alternativa de enumerar k-vectores para n palancas tiene mⁿ posibilidades.",
    ],
    time: "O(k·3²ᵏ+n·k·3ᵏ)",
    space: "O(n·3ᵏ+k·3ᵏ)",
    oral: [
      "Reconstruyo un multiconjunto de palancas cuyos subconjuntos produzcan los conteos observados.",
      "Proyecto sobre F₃ y extraigo f con divisibilidad por2; justifico qué cuenta.",
      "Derivo masa(G), resto ceros en cada línea y hago DP por subconjuntos. En el ejemplo salen dos ceros y un primer eje.",
      "Los signos desconocidos son una traslación; busco v y recupero qué palancas invertir. Verifico la distribución final.",
      "m≤243 permite O(km²+nkm). Uso enteros hasta2⁴⁰ y evito los operadores de32 bits para conteos.",
    ],
    checkpoints: checks(
      "Obtener f=3 en x₁=0, f=2 fuera; dos palancas cero y una invertida.",
      "Arreglos por índices base3, productos escalares mod3, capas DP para backtracking.",
      "m proyecciones por m estados; factor k explícito; n capas de m celdas.",
      "Derivar la fórmula de masa y demostrar que invertir un subconjunto traslada la distribución, no cambia arbitrariamente sus conteos.",
    ),
  },
  T: {
    status: "Verificado localmente",
    evidence:
      "Solucionador convexo de16 pares: ejemplo oficial, casos analíticos y simetría. Ochenta instancias con alturas/coordenadas grandes coinciden a menos de10⁻⁶ con un oráculo independiente de desarrollo de caras y extremos, sin búsquedas numéricas.",
    limitations: [
      "Verificación numérica local, sin aritmética de intervalos ni juez externo. Se deriva el error de las búsquedas en aritmética real; los errores de coma flotante se contrastan con una implementación geométrica independiente.",
      "La vista es un recorrido de resultados de la minimización, no una simulación de navegación sobre una malla 3D.",
    ],
    sources: [official],
    example:
      "Bases [0,2]×[0,2] y [4,6]×[0,2], alturas1. Ápices (1,1,1),(5,1,1). Distancia 2+2√2.",
    walk: [
      {
        title: "Elegir aristas enfrentadas",
        state: "P=(2,t,0), Q=(4,u,0), 0≤t,u≤2",
        why: "Son la salida derecha de la primera base y la entrada izquierda de la segunda.",
      },
      {
        title: "Escribir el coste",
        state: "√(2+(t−1)²)+√(4+(u−t)²)+√(2+(u−1)²)",
        why: "Primer tramo en una cara, segundo en suelo, tercero en una cara.",
      },
      {
        title: "Cota inferior",
        state: "Cada término ≥√2, 2, √2 respectivamente",
        why: "Los cuadrados adicionales son no negativos.",
      },
      {
        title: "Alcanzar la cota",
        state: "t=u=1; longitud 4.828427124746…",
        why: "Los tres mínimos ocurren simultáneamente. Las otras caras no pueden mejorar la cota global 3D por tramos enfrentados.",
      },
    ],
    code: [
      {
        line: "reconstruir cuadrado: (x,y),(u,v),(u−dy,v+dx),(x−dy,y+dx)",
        why: "El interior está a la izquierda de la arista dirigida; el ápice está sobre el centro.",
      },
      {
        line: "para cada una de 16 parejas de aristas: P(t),Q(u), t,u∈[0,1]",
        why: "Todo punto del borde pertenece a una arista; se incluyen extremos compartidos.",
      },
      {
        line: "F(t,u)=||ápiceA−P||+||P−Q||+||Q−ápiceB||",
        why: "Cada tramo de cara es recto y el tramo de suelo se puede enderezar.",
      },
      {
        line: "g(t)=min_u F(t,u); minimizar g por búsqueda ternaria anidada",
        why: "Normas de aplicaciones afines son convexas; minimizar parcialmente una función convexa conserva convexidad.",
      },
      {
        line: "hacer 90 iteraciones por búsqueda e incluir 0 y1 como candidatos",
        why: "Controla la precisión y cubre óptimos en vértices, bases en contacto y mínimos planos.",
      },
    ],
    structures: [
      "Puntos 2D para bases y 3D para ápices; dos parámetros escalares sobre segmentos cerrados.",
      "La implementación usa Math.hypot para longitudes. No decide intersecciones con una tolerancia inventada ni olvida extremos.",
    ],
    proof: [
      "De un ápice a un punto del borde, el segmento está en una cara de la pirámide y alcanza la cota inferior de distancia euclídea. Un recorrido por varias caras no lo mejora.",
      "Entre las bases, el tramo de suelo es recto. Si un candidato atraviesa el interior de una base, tomar su último punto de salida de la primera y su primer punto de entrada a la segunda y unirlos directamente a sus ápices no aumenta el coste por desigualdad triangular. Como las bases son convexas y no se solapan en área, queda una ruta admisible. El mínimo global de las 16 optimizaciones coincide con una ruta física.",
      "La suma de normas es convexa en (t,u); la proyección del epígrafo demuestra convexidad de g(t)=min_u F. En una función convexa, comparar los puntos de tercio permite desechar el tercio opuesto sin perder un mínimo.",
      "Un desplazamiento δ en P cambia a lo sumo2δ de longitud; igual para Q. Sea w=(2/3)^r. La búsqueda interna aproxima g con error ε≤2L₂w. Si una comparación externa equivocada descarta un mínimo, la convexidad y las pendientes de las cuerdas acotan la pérdida por2ε: los dos puntos de tercio están a la misma distancia que el tercio descartado. Tras r comparaciones, evaluar un punto del intervalo conservado tiene error total ≤2L₁w+(2r+1)ε. Con r=90 y aristas Lᵢ≤√2·200000, la cota real es menor que10⁻⁶. La verificación flotante independiente se describe arriba.",
    ],
    costs: [
      "Con r iteraciones hay16·O(r²) evaluaciones de un número fijo de distancias: O(log²(L/ε)) para tolerancia ε. Para r=90 fijo, tiempo y memoria O(1) respecto a la entrada.",
      "Muestrear una malla con resolución ε sería O((L/ε)²) y podría omitir el óptimo. Desarrollar caras permite otra solución constante, pero exige comprobar cruces y extremos.",
    ],
    time: "O(r²), r=90 fijo",
    space: "O(1)",
    oral: [
      "Busco una ruta sobre superficies; la distancia directa por el aire no sirve.",
      "Enumero16 pares de aristas y parametrizo puntos de salida y entrada.",
      "Escribo la suma de tres normas, minimizo dos parámetros convexos e incluyo extremos. Reproduzco2+2√2.",
      "Justifico los tramos rectos y la convexidad; distingo prueba geométrica del control numérico.",
      "16 pares,90² iteraciones por par. Explico error, contactos y el alcance de las pruebas.",
    ],
    checkpoints: checks(
      "Minimizar en t=u=1; suma2+2√2 con cotas para cada término.",
      "Cuatro vértices por base, ápices3D y parámetros en segmentos cerrados.",
      "16 parejas por dos búsquedas de r pasos; O(r²), no una cuadrícula de candidatos.",
      "Convexidad conjunta y parcial; tratar extremos y reconocer límites de verificación flotante.",
    ),
  },
  V: {
    status: "Verificado localmente",
    evidence:
      "Ambos ejemplos oficiales y 100 pares de dados frente a enumeración cuadrática de todas las mezclas de dos clases de caras.",
    limitations: [
      "Cálculos de hull y recorte con coma flotante; no se ha enviado al juez externo.",
    ],
    sources: [official],
    example:
      "D₁=[2,4,9] gana a D₂=[1,1,6,6,8,8]. Mínimo7/24 con caras [1,5,5,5]; máximo3/4 con [5,5,5,10].",
    walk: [
      {
        title: "Orientar los dados",
        state: "score([2,4,9],[1,1,6,6,8,8])=(2+2+6)/18=5/9",
        why: "El dado ganador llega segundo en la entrada oficial: se intercambian los nombres antes de calcular coordenadas.",
      },
      {
        title: "Clases decisivas",
        state: "v=1 → (0,1/6); v=5 → (2/3,1/3); v=10 → (1,1)",
        why: "x=score(v,D₁), y=score(v,D₂). El empate de1 con dos caras de D₂ aporta1/6.",
      },
      {
        title: "Construir la envolvente",
        state: "Cadena inferior: (0,1/6) → (2/3,1/3) → (1,1)",
        why: "Los demás puntos quedan encima de estos segmentos. El producto cruzado del algoritmo comprueba cada descarte.",
      },
      {
        title: "Corte vertical",
        state: "x=1/2: peso3/4 en5 y1/4 en1; y=(3/4)(1/3)+(1/4)(1/6)=7/24",
        why: "El menor y factible aparece en la primera arista inferior. Dado realizable [1,5,5,5].",
      },
      {
        title: "Corte horizontal",
        state: "y=1/2: peso1/4 en10 y3/4 en5; x=1/4+(3/4)(2/3)=3/4",
        why: "El mayor x permitido aparece en la segunda arista inferior. Dado distinto [5,5,5,10].",
      },
    ],
    code: [
      {
        line: "ordenar ambos dados; intercambiar si el primero no es el ganador",
        why: "La puntuación se calcula con frecuencias de valores menores y empates, no con medias aritméticas.",
      },
      {
        line: "enumerar valores 1, cada cara v y cada v+1",
        why: "Incluye puntos de empate e intervalos enteros entre valores; no hay cambios adicionales dentro de un intervalo.",
      },
      {
        line: "p(v)=((menores₁+iguales₁/2)/N₁,(menores₂+iguales₂/2)/N₂)",
        why: "Búsquedas binarias dan ambas coordenadas normalizadas.",
      },
      {
        line: "envolvente convexa por cadena monótona, eliminando duplicados",
        why: "Cada cara de un tercer dado aporta un punto; su promedio cae en la envolvente.",
      },
      {
        line: "evaluar vértices y cortes de aristas con x=1/2 y con y=1/2",
        why: "Minimizar y en x≥1/2 y maximizar x en y≤1/2; los dos óptimos pueden usar dados distintos.",
      },
    ],
    structures: [
      "Arreglos ordenados con búsquedas de límites inferior/superior; puntos de puntuaciones, no valores de las caras.",
      "Dos pilas forman las cadenas inferior y superior de la envolvente. El producto cruzado determina si el giro es convexo.",
    ],
    proof: [
      "Todo dado tiene una distribución de frecuencias racionales sobre sus valores; por linealidad, su par de puntuaciones es una combinación convexa de p(v). Recíprocamente, cualquier combinación racional se realiza repitiendo caras según un denominador común.",
      "Solo importan valores iguales a una cara o dentro de un intervalo entre caras. Los representantes 1,v,v+1 cubren todas las clases realizables con enteros positivos.",
      "Un objetivo lineal sobre un polígono recortado alcanza su óptimo en un vértice del recorte: un vértice original o una intersección de una arista con la frontera. No es necesario construir un dado con un número de caras arbitrariamente grande.",
      "Los vértices son racionales y los cortes por1/2 también; por tanto la mezcla óptima sí es realizable por un dado finito. Bastan dos valores en una arista.",
    ],
    costs: [
      "O(N) clases; ordenación y búsquedas binarias O(N log N).",
      "Cada punto entra y sale a lo sumo una vez de cada cadena: hull O(N). Recorte lineal en el tamaño del hull; memoria O(N).",
      "Examinar todas las parejas de puntos cuesta O(N²) y sirve como oráculo pequeño. Enumerar todos los dados no tiene cota útil.",
    ],
    time: "O(N log N)",
    space: "O(N)",
    oral: [
      "Optimizo dos puntuaciones, contando empate como medio punto. Primero identifico D₁ ganador.",
      "Cada entero v representa un punto; un dado mezcla puntos por multiplicidad de caras.",
      "Construyo la envolvente y recorto por x≥1/2 o y≤1/2. Reproduzco los pesos de las aristas óptimas del ejemplo.",
      "La equivalencia entre dados y combinaciones racionales prueba suficiencia; un objetivo lineal alcanza un vértice del recorte.",
      "O(N log N) al ordenar y O(N) en hull/recorte. Son dos optimizaciones independientes.",
    ],
    checkpoints: checks(
      "Reconocer que una mezcla factible no es necesariamente óptima; verificar coordenadas y pesos de la arista elegida.",
      "Puntos normalizados, búsquedas de frecuencia y pilas para hull.",
      "O(N) puntos, ordenación O(N log N), cada punto se apila/desapila una vez.",
      "Combinar caras equivale a combinación convexa racional; demostrar realizabilidad con multiplicidades enteras.",
    ),
  },
  Y: {
    status: "Verificado localmente",
    evidence:
      "Oráculo de todas las reducciones para cadenas de longitud≤9 y legalidad de trazas hasta8.",
    limitations: [
      "El laboratorio enumera operaciones solo hasta24 bits; el solucionador lineal no guarda esa enumeración.",
    ],
    sources: [official],
    example: "10110 → 1010 → 10. La cota inferior de longitud2 se alcanza.",
    walk: [
      {
        title: "Conservar invariantes",
        state: "primer bit=1; último=0; aparecen ambos símbolos",
        why: "XX→X no altera extremos ni elimina la última copia de un símbolo.",
      },
      {
        title: "Colapsar un grupo",
        state: "10[11]0 → 1010",
        why: "Con X=1, dos copias consecutivas se reemplazan por una.",
      },
      {
        title: "Reducir alternancia",
        state: "[10][10] → 10",
        why: "La alternante tiene cuatro bits; su prefijo es XX con longitud de X igual a2.",
      },
      {
        title: "Certificar mínimo",
        state: "10 tiene longitud2 y extremos distintos",
        why: "Ninguna cadena de longitud1 puede conservar ambos extremos.",
      },
    ],
    code: [
      {
        line: "leer extremos y si aparecen ambos símbolos",
        why: "Basta para determinar el resultado mínimo, sin construir reducciones.",
      },
      {
        line: "si uniforme: devolver primer bit",
        why: "Se colapsan todos los grupos hasta longitud1.",
      },
      {
        line: "si extremos distintos: devolver primero+último",
        why: "La forma alternante tiene longitud par y se reduce a2.",
      },
      {
        line: "si extremos iguales y ambos símbolos: devolver primero+otro+primero",
        why: "La alternante tiene longitud impar y se reduce a3; no puede bajar a1 ni2.",
      },
    ],
    structures: [
      "Dos símbolos de extremos y una bandera de presencia: memoria auxiliar constante.",
      "El editor almacena la cadena, lista de reducciones y estados para estudiar; no es la estructura del solucionador eficiente.",
    ],
    proof: [
      "Al sustituir XX por X, los extremos de la cadena se conservan incluso si el bloque toca un extremo. Todo símbolo borrado tiene una copia en X conservada.",
      "Tras colapsar grupos, la cadena binaria alterna. Si tiene longitud≥4, sus primeros cuatro caracteres son dos copias de un bloque de longitud2; reducirlas quita dos caracteres y conserva la alternancia.",
      "Se alcanza longitud1 para uniformes,2 para extremos distintos y3 para extremos iguales con ambos símbolos. Los invariantes impiden cualquier longitud menor en cada caso.",
    ],
    costs: [
      "Una pasada de n bits para comprobar presencia: O(n). La respuesta tiene como máximo3 bits y el estado es constante.",
      "Enumerar reducciones y copiar cadenas en el laboratorio cuesta más. El oráculo exhaustivo no constituye la solución para n=100000.",
    ],
    time: "O(n)",
    space: "O(1) auxiliar",
    oral: [
      "Defino XX→X con bloques, no solo caracteres.",
      "Conservo extremos y presencia de símbolos.",
      "Reproduzco10110→1010→10; luego doy las tres respuestas posibles.",
      "Colapso grupos, reduzco la alternante y comparo con cotas inferiores por invariantes.",
      "Una pasada, memoria constante; distinguir construcción didáctica de fórmula final.",
    ],
    checkpoints: checks(
      "Aplicar primero11→1 y después1010→10; justificar mínimo2.",
      "Extremos y bandera de presencia, no BFS de cadenas.",
      "Leer n bits es O(n); salida≤3 y estado O(1).",
      "Invariantes dan cota inferior; reducir alternantes demuestra que se alcanza. 101 no se reduce a1.",
    ),
  },
  P: {
    status: "Verificado localmente",
    evidence:
      "Cuatro ejemplos oficiales, enumeración de asignaciones pequeñas y 400 instancias deterministas frente a fuerza bruta.",
    limitations: [
      "El editor limita luces/botones para mantener legibles las trazas; el solucionador separa las instantáneas de su cálculo.",
    ],
    sources: [official],
    example:
      "Dos luces: verde entre botones A,B; azul entre B,C. Restricciones A+B≡2 y B+C≡1 (mod3). Mínimo2 pulsaciones.",
    walk: [
      {
        title: "Traducir colores",
        state: "R=0,G=1,B=2; suma de botones ≡−color mod3",
        why: "Tres pulsaciones vuelven al mismo color; cada botón necesita0,1 o2 pulsaciones.",
      },
      {
        title: "Fijar A=0",
        state: "B=2, C=2; coste4",
        why: "B=2−A y C=1−B, normalizados módulo3.",
      },
      {
        title: "Fijar A=1",
        state: "B=1, C=0; coste2",
        why: "La propagación determina toda la componente. Esta rama mejora la anterior.",
      },
      {
        title: "Fijar A=2",
        state: "B=0, C=1; coste3",
        why: "Las tres semillas cubren todas las soluciones posibles de la componente.",
      },
      {
        title: "Elegir mínimo",
        state: "(A,B,C)=(1,1,0), total2",
        why: "Ambas ecuaciones se cumplen y ninguna otra asignación de la raíz existe.",
      },
    ],
    code: [
      {
        line: "convertir cada luz en 0,1 o2 botones incidentes",
        why: "Cero: debe ser roja; uno: fija el botón; dos: ecuación en una arista.",
      },
      {
        line: "por componente, probar raíz=0,1,2",
        why: "El dominio tiene solo tres valores, no hay razón para enumerar3ᵇ combinaciones.",
      },
      {
        line: "recorrer: x[v]=(−color−x[u]) mod3",
        why: "La arista obliga al vecino; normalizar residuos negativos.",
      },
      {
        line: "si asignado difiere o restricción unaria falla: descartar semilla",
        why: "Los ciclos y luces de un botón pueden hacer incompatible una rama.",
      },
      {
        line: "sumar mínimo de cada componente; si alguna no tiene candidato, impossible",
        why: "No hay ecuaciones ni costes compartidos entre componentes.",
      },
    ],
    structures: [
      "Lista de adyacencia por botón, con color asociado a cada luz compartida; arreglo de valores y pila/cola de recorrido.",
      "Las luces con cero/un botón se tratan explícitamente. No deben transformarse en una arista inventada.",
    ],
    proof: [
      "Pulsar un botón tres veces no cambia ningún color y aumenta coste, así que un óptimo usa valores0,1,2.",
      "Con una raíz fijada, cada arista fuerza de forma única al vecino. Inducción sobre el árbol de recorrido muestra que toda solución con esa raíz coincide con la propagación.",
      "Comprobar todas las aristas, incluso hacia vértices ya visitados, detecta exactamente las contradicciones. Las tres semillas agotan el dominio de la raíz.",
      "Las componentes tienen variables disjuntas y coste aditivo; sumar sus mínimos es óptimo global. Una luz sin botones no roja hace imposible cualquier asignación.",
    ],
    costs: [
      "Construir incidencias cuesta O(l+b). Cada componente se recorre tres veces: factor constante, O(l+b).",
      "Valores y adyacencias ocupan O(l+b). El historial antes/después agrega copias solo en modo didáctico; enumerar todas las asignaciones costaría3ᵇ.",
    ],
    time: "O(l+b)",
    space: "O(l+b)",
    oral: [
      "Cada botón suma1 módulo3; minimizo número total de pulsaciones.",
      "Convierto luces compartidas en aristas y las de un botón en valores fijos.",
      "Pruebo tres valores de raíz, propago y comparo costes4,2,3 del ejemplo.",
      "Una raíz determina toda la componente; verifico contradicciones y sumo mínimos de componentes independientes.",
      "Tres recorridos siguen siendo lineales; recordar luces sin botón y residuos negativos.",
    ],
    checkpoints: checks(
      "A=1 obliga B=1 y C=0; coste2. No confundir mínimo con la primera rama válida.",
      "Grafo de botones, valores mod3 y restricciones de luces con0/1 botón.",
      "Tres veces vértices+aristas; memoria lineal sin instantáneas.",
      "Toda solución tiene una de tres semillas; una arista hacia un visitado debe comprobarse, no ignorarse.",
    ),
  },
};
