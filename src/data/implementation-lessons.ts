export type CodeStep = { pseudo: string; anchor: string; why: string };
export type CodeExercise = {
  prompt: string;
  template: string;
  answer: string;
  hint: string;
  why: string;
};
export type ImplementationLesson = {
  file: string;
  entry: string;
  contract: string;
  call: string;
  execution: string;
  steps: CodeStep[];
  exercises: CodeExercise[];
};
const step = (pseudo: string, anchor: string, why: string): CodeStep => ({
  pseudo,
  anchor,
  why,
});
const hole = (
  prompt: string,
  template: string,
  answer: string,
  hint: string,
  why: string,
): CodeExercise => ({ prompt, template, answer, hint, why });
export const implementationLessons: Record<string, ImplementationLesson> = {
  Y: {
    file: "compression",
    entry: "compress",
    contract:
      "Entrada: cadena binaria no vacía s. Salida: una cadena de longitud mínima alcanzable mediante XX → X. Índices desde 0. Una entrada inválida lanza Error.",
    call: 'compress("0010100") // "010"',
    execution:
      "Esta vista ejecuta compress con un observador: cada instantánea se toma dentro del solucionador, después de la instrucción resaltada. El laboratorio original ejecuta compressionTrace: elimina bloques para demostrar alcanzabilidad. Son procedimientos distintos. La solución directa conserva s y solo consulta extremos y presencia de otro símbolo; no necesita construir las eliminaciones. Sus cotas inferiores y la construcción del laboratorio justifican los mismos tres resultados.",
    steps: [
      step(
        "recibir s\nsi s está vacía o contiene algo fuera de {0,1}: error",
        "validateBinary(s);",
        "La expresión regular exige uno o más bits. Validar recorre n caracteres: O(n). Así s[0] y s[n−1] siempre existen.",
      ),
      step(
        "first ← s[0]\nlast ← s[longitud(s) − 1]",
        "const first = s[0];",
        "El acceso a cada extremo es O(1). Ninguna reducción legal puede cambiar esos extremos.",
      ),
      step(
        "different ← falso\ni ← 1\nresult ← cadena vacía",
        "let different = false;",
        "El primer bit ya coincide consigo mismo. El booleano resume si el prefijo inspeccionado contiene el otro símbolo; no hace falta un conjunto ni guardar posiciones.",
      ),
      step(
        "mientras i < longitud(s):\n  si s[i] ≠ first: different ← verdadero\n  i ← i + 1",
        "for (; i < s.length; i++) {",
        "El ciclo inspecciona exactamente n−1 posiciones. Una vez verdadero, different nunca vuelve a falso. En un alfabeto binario, diferente al primero equivale a que aparecen ambos símbolos.",
      ),
      step(
        "si different = falso:\n  result ← first",
        "result = first;",
        "Caso uniforme: conservar un bit es obligatorio y alcanzable colapsando pares. Ejemplo 0000 → 0. Este caso se comprueba antes que los extremos.",
      ),
      step(
        "en otro caso, si first ≠ last:\n  result ← concatenar(first, last)",
        "result = first + last;",
        "Caso con extremos distintos: hacen falta al menos dos posiciones. Ejemplo 0011 → 01. El resultado ya contiene los dos símbolos.",
      ),
      step(
        'en otro caso:\n  other ← si first = "0" entonces "1", si no "0"\n  result ← concatenar(first, other, last)',
        'const other = first === "0" ? "1" : "0";',
        "Extremos iguales y ambos símbolos: dos extremos más un bit diferente requieren tres posiciones. Ejemplo 0010100 → 010. La construcción prueba que esa cota se alcanza.",
      ),
      step(
        "devolver result",
        "return result;",
        "El resultado tiene como máximo tres bits. Validación O(n) + barrido O(n) + ramas O(1) = O(n), espacio auxiliar O(1) sin observador. Guardar la traza añade O(n) espacio. report solo observa; no decide ni modifica s.",
      ),
    ],
    exercises: [
      hole(
        "Completa el índice del último carácter.",
        "const last = s[___];",
        "s.length - 1",
        "La primera posición tiene índice cero.",
        "En una cadena de n caracteres los índices van de 0 a n−1.",
      ),
      hole(
        "Completa la condición que detecta ambos símbolos.",
        "if (___) different = true;",
        "s[i] !== first",
        "Compara el bit actual con el primero, no con el anterior.",
        "Encontrar un bit diferente basta. El booleano acumula la información de todo el prefijo.",
      ),
      hole(
        "Construye el caso de extremos iguales con ambos símbolos.",
        "result = ___;",
        "first + other + last",
        "Debes conservar los dos extremos e incluir el símbolo distinto.",
        "Los tres símbolos alcanzan la cota inferior sin efectuar eliminaciones.",
      ),
    ],
  },
  P: {
    file: "turning-red",
    entry: "solveRed",
    contract:
      "Entrada Lights: colors usa R=0, G=1, B=2; buttons[b] lista índices de luces, cada luz tiene a lo sumo dos botones. Salida: cost mínimo, presses por botón o null si es imposible. withTrace activa instantáneas.",
    call: "solveRed({colors:[1], buttons:[[0]]}) // cost: 2, presses: [2]",
    execution:
      "La propagación y los tres intentos proceden de solveRed. Cada evento agrupa una asignación, contradicción o comprobación; no es un intérprete instrucción por instrucción. Pulsar botones manualmente comprueba una solución, pero no encuentra por sí solo el mínimo.",
    steps: [
      step(
        "validar entrada\nown[l] ← lista de botones incidentes en l\nadj[b] ← lista vacía; answer[b] ← 0; visited[b] ← falso",
        "validateLights(input);",
        "owners invierte las listas botón→luz. La adyacencia relaciona variables que aparecen juntas; values=-1 significa todavía sin asignar.",
      ),
      step(
        "para cada luz l:\n  si own[l] está vacío y colors[l] ≠ 0: devolver imposible\n  si tiene dos botones a,b: añadir aristas a→b y b→a con color[l]",
        "for (let l = 0; l < colors.length; l++) {",
        "Una luz sin control no puede cambiar. Una luz con un botón será una restricción unaria, comprobada después.",
      ),
      step(
        "total ← 0\npara root desde 0 hasta botones−1:\n  si visited[root]: continuar\n  stack ← [root]; component ← []; lights ← conjunto vacío\n  marcar root visitado\n  mientras stack no vacío: sacar u, guardar u y sus luces; apilar vecinos no visitados y marcarlos",
        "for (let root = 0; root < n; root++) {",
        "Marcar al insertar evita duplicados. Las componentes no comparten variables: se pueden minimizar por separado.",
      ),
      step(
        "best ← infinito; bestValues ← []\npara trial en 0,1,2:\n  poner values[u] ← −1 para u en component\n  values[root] ← trial; todo ← [root]; valid ← verdadero",
        "for (let trial = 0; trial < 3; trial++) {",
        "Toda solución fija uno de tres valores en la raíz. El reinicio es local a la componente, evitando un barrido global por cada raíz.",
      ),
      step(
        "mientras todo no vacío y valid:\n  u ← extraer(todo)\n  para cada arista (u,v,color):\n    forced ← ((−color−values[u]) mod 3 + 3) mod 3\n    si values[v] = −1: asignar forced y apilar v\n    si ya asignado y values[v] ≠ forced: valid ← falso; salir del ciclo de aristas",
        "const forced = mod(-e.color - values[u]);",
        "Se despeja x_v de color+x_u+x_v≡0. En JavaScript % puede ser negativo; mod normaliza a {0,1,2}. Un vecino ya asignado comprueba ciclos.",
      ),
      step(
        "si valid:\n  para cada l en lights:\n    sum ← colors[l] + suma(values[b] para b en own[l])\n    si sum mod 3 ≠ 0: valid ← falso; salir",
        "const sum = colors[l] + own[l].reduce((s, b) => s + values[b], 0);",
        "Esta segunda comprobación incluye las restricciones de un único botón; una propagación sin contradicciones no basta.",
      ),
      step(
        "si valid:\n  cost ← suma(values[u] para u en component)\n  si cost < best: guardar cost y copia de valores\ntras los tres intentos: si best = infinito devolver imposible\nsi no: copiar bestValues a answer y sumar best a total\ntras todas las componentes: devolver total, answer",
        "const cost = component.reduce((s, u) => s + values[u], 0);",
        "Elegir el menor coste por componente produce el mínimo global. Tres recorridos por arista y luz son O(B+L); arrays y listas O(B+L). Las instantáneas educativas no forman parte de esa cota.",
      ),
    ],
    exercises: [
      hole(
        "Despeja el vecino forzado.",
        "const forced = ___;",
        "mod(-e.color - values[u])",
        "La suma de color y dos variables debe ser cero módulo 3.",
        "Restamos los términos conocidos y normalizamos el residuo.",
      ),
    ],
  },
  Q: {
    file: "extended",
    entry: "solveQueue",
    contract:
      "Entrada: order, permutación de etiquetas 1..n en orden de retirada. Salida answer: esperanza de movimientos; events opcionales. Fenwick usa índices desde 1.",
    call: "solveQueue([4,2,5,3,1]) // answer: 7",
    execution:
      "Los estados de Fenwick vienen de solveQueue. La simulación física del laboratorio usa queuePhysical con una elección de pilas; es una realización aleatoria, no el algoritmo para calcular la esperanza.",
    steps: [
      step(
        "n ← longitud(order)\ncomprobar n>0, etiquetas enteras distintas entre 1 y n\nBIT[0..n] ← 0\npara q de 1 a n: add(q,1)\ntwice ← 2*n",
        "const bit = new Fenwick(n),",
        "twice representa el doble de la esperanza; las n retiradas obligatorias ya están incluidas. Se acumulan enteros para evitar medios hasta el retorno.",
      ),
      step(
        "add(i,delta):\n  mientras i ≤ n:\n    tree[i] ← tree[i] + delta\n    i ← i + (i AND −i)",
        "for (; i <= this.n; i += i & -i) this.tree[i] += delta;",
        "lowbit aísla el bit menos significativo. Subimos por los intervalos que contienen esa etiqueta; cada nivel cambia un bit, O(log n). Nunca llamar add con i=0.",
      ),
      step(
        "sum(i):\n  s ← 0\n  mientras i>0:\n    s ← s + tree[i]\n    i ← i − (i AND −i)\n  devolver s",
        "for (; i > 0; i -= i & -i) s += this.tree[i];",
        "Quitamos un intervalo disjunto del prefijo cada vez. El resultado cuenta etiquetas activas ≤i en O(log n).",
      ),
      step(
        "para i desde 0 hasta n−1:\n  q ← order[i]\n  add(q,−1)\n  si i=0: count ← n−q\n  si i>0:\n    h ← min(order[i−1],q)\n    count ← n−i−1−sum(h)\n  twice ← twice+count",
        "const count = i ? n - i - 1 - bit.sum(h) : n - q;",
        "Se retira q ANTES de consultar: quedan n−i−1 objetos. Restar el prefijo deja los mayores que h. Cada elegible aporta 1/2. La primera retirada tiene su propio umbral de llegada.",
      ),
      step(
        "devolver twice/2",
        "return { answer: twice / 2, events };",
        "Inicializar con n actualizaciones y hacer n consultas/retiradas cuesta O(n log n), espacio O(n). active, removed, visited y state sirven para visualizar; trace=true guarda copias y puede consumir O(n²).",
      ),
    ],
    exercises: [
      hole(
        "Cuenta los activos mayores que h tras retirar q.",
        "const count = i ? ___ : n - q;",
        "n - i - 1 - bit.sum(h)",
        "Resta del total restante el prefijo que llega hasta h.",
        "La retirada anterior y la actual ya no deben contarse.",
      ),
    ],
  },
  W: {
    file: "extended",
    entry: "solveLiar",
    contract:
      "Entrada: cinco respuestas enteras a las filas questions, con como máximo una mentira. Salida: terna no negativa compatible, o null. Es el decodificador local; el protocolo interactivo de envío/flush queda fuera de esta función.",
    call: "solveLiar([2,3,1,6,999]) // answer: [2,3,1]",
    execution:
      "Cada evento es una terna de ecuaciones resuelta y contrastada por solveLiar. El laboratorio simula las respuestas y una mentira; no se conecta a un juez interactivo.",
    steps: [
      step(
        "questions ← [(1,0,0),(0,1,0),(0,0,1),(1,1,1),(1,2,3)]\nrecibir cinco respuestas; validar enteros 0..100000\nanswer ← null",
        "export const questions = [",
        "Las primeras tres preguntan cantidades individuales; las dos últimas añaden redundancia. Cualesquiera tres filas son independientes.",
      ),
      step(
        "para i=0..2:\n  para j=i+1..3:\n    para k=j+1..4:\n      ids ← [i,j,k]\n      A ← filas questions en ids\n      d ← det(A)",
        "triples: for (let i = 0; i < 3; i++)",
        "Los límites generan exactamente las 10 ternas sin repetir. Al menos una contiene solo respuestas verdaderas.",
      ),
      step(
        "det(A) ← a00(a11*a22−a12*a21) − a01(a10*a22−a12*a20) + a02(a10*a21−a11*a20)\npara c en 0,1,2:\n  Ac ← A con columna c reemplazada por respuestas[ids]\n  nums[c] ← det(Ac)",
        "export const det = (a: number[][]) =>",
        "La fórmula de Cramer resuelve el sistema sin tolerancias de coma flotante. Para estas filas, d nunca es cero; las pruebas comprueban esa propiedad.",
      ),
      step(
        "candidate[c] ← nums[c]/d\nintegral ← cada nums[c] divisible por d y cada candidate[c] ≥0\nagreements ← []\nsi integral:\n  para r=0..4:\n    si suma(questions[r][c]*candidate[c], c=0..2)=replies[r]: agregar r",
        "const agreements = integral",
        "No se acepta cualquier solución de tres ecuaciones. Se exigen cantidades enteras no negativas y compatibilidad global.",
      ),
      step(
        "si longitud(agreements) ≥4:\n  answer ← candidate\n  salir de los tres ciclos\nsi ninguna terna sirve: answer sigue null\ndevolver answer",
        "if (next.accepted) {",
        "break triples sale de los tres ciclos, no solo del interior. Dos candidatos aceptados comparten al menos tres filas y por independencia serían iguales. 10 sistemas de tamaño 3 y 5 verificaciones: O(1) tiempo/espacio.",
      ),
    ],
    exercises: [
      hole(
        "Completa la condición de aceptación.",
        "accepted: ___",
        "agreements.length >= 4",
        "Se permite una mentira entre cinco respuestas.",
        "Tres coincidencias solo resuelven una terna; cuatro permiten corregir un error.",
      ),
    ],
  },
  U: {
    file: "trains",
    entry: "solveTrain",
    contract:
      "Entrada: inventarios s de rectas y c de curvas, 0≤s≤100000, 4≤c≤100000. Salida: track, palabra S/L/R de longitud máxima, más parámetros constructivos.",
    call: 'solveTrain(2,8) // track: "RLLSLRLLSL", longitud 10',
    execution:
      "solveTrain elige una base y la amplía. La animación ejecuta checkTrack sobre la palabra resultante: comprueba celdas, giro y cierre. El validador no decide la optimalidad ni es la construcción; ambas funciones están disponibles en Código completo.",
    steps: [
      step(
        "validar inventarios\ns ← s−(s mod 2)\nc ← c−(c mod 2)\nsi s=0:\n  c ← c−(c mod 4)\n  si c=8: c ← 4",
        "s -= s % 2;",
        "Se aplican las cotas de paridad y la excepción de ocho curvas sin rectas demostradas en la lección. s y c pasan a ser las cantidades que se usarán.",
      ),
      step(
        "k ← 0; t ← 0\nsi c=4:\n  base ← LLLL; gaps ← [0,2]; t ← s/2\n  para cada posición i de base:\n    emitir S repetida t veces si i está en gaps\n    emitir base[i]",
        "if (c === 4) {",
        "Insertar igual número de rectas en lados opuestos conserva el cierre y permite usar todas las rectas pares.",
      ),
      step(
        "si c>4:\n  si s=0: base ← LRRLRRLRRLRR; gaps ← [0,6]; word ← LR\n  si s>0:\n    base ← LSLLSL si c mod 4=0, si no LSLSLLRL\n    gaps ← [0,3]; word ← RL\n  k ← (c−número de curvas de base)/4\n  t ← 0 si s=0, si no (s−2)/2",
        'base = !s ? "LRRLRRLRRLRR" : c % 4 === 0 ? "LSLLSL" : "LSLSLLRL";',
        "Cada inserción de word en dos huecos añade cuatro curvas. Las bases con rectas ya gastan dos, por eso se resta 2 al calcular t.",
      ),
      step(
        "para cada posición i de base:\n  si i está en gaps: emitir word repetida k veces y S repetida t veces\n  emitir base[i]\ndevolver track y parámetros",
        'const word = !s ? "LR" : "RL";',
        "map produce fragmentos y join los concatena. repeat materializa la salida: O(s+c) tiempo y espacio, aunque elegir los parámetros requiere O(1).",
      ),
      step(
        "validación separada checkTrack:\n(x,y,d) ← (0,0,0); seen ← conjunto vacío\npara piece en track:\n  rechazar celda repetida o símbolo fuera de SLR\n  insertar (x,y) en seen\n  d ← (d + (L:3,R:1,S:0)) mod 4\n  (x,y) ← (x,y) + vector[d]\naceptar si longitud≥4 y (x,y,d)=(0,0,0)",
        "export function checkTrack(track: string, trace = false) {",
        "La tabla de direcciones codifica este, sur, oeste, norte. El cierre debe incluir la orientación. El conjunto detecta intersecciones por celda en O(s+c) esperado; guardar todas las instantáneas añade coste.",
      ),
    ],
    exercises: [
      hole(
        "Calcula las ampliaciones para las curvas restantes.",
        "k = ___;",
        '(c - [...base].filter((x) => x !== "S").length) / 4',
        "Cuenta las curvas ya usadas; cada pareja de inserciones añade cuatro.",
        "El divisor 4 cuenta dos palabras de dos curvas cada una.",
      ),
    ],
  },
  S: {
    file: "extended",
    entry: "solveBridge",
    contract:
      "Entrada: tiempos positivos y capacidad C≥2. Salida: dp[N][0], tabla de costes prepagados y celdas opcionales. La recurrencia está contrastada localmente; la normalización general se apoya en Backhouse–Truong y el módulo sigue parcialmente verificado.",
    call: "solveBridge([1,2,5,10],2) // answer: 17",
    execution:
      "La tabla muestra celdas calculadas por solveBridge y el índice i que obtuvo el mínimo. No representa viajes individuales. El recorrido manual explica un calendario concreto; transformar cada bolsa DP en viajes es una construcción distinta.",
    steps: [
      step(
        "validar N≥2, tiempos positivos y capacidad entera≥2\nt ← [0] + ordenar tiempos\nC ← min(capacidad,N)\nprefix[0] ← 0\npara i=1..N: prefix[i] ← prefix[i−1]+t[i]\ncrear filas vacías dp[0..N]",
        "const t = [0, ...times.toSorted((a, b) => a - b)],",
        "El cero ficticio permite usar índices 1..N. prefix[i] paga de una vez los i tiempos rápidos en cada transición.",
      ),
      step(
        "para n=2..N:\n  para e=0..suelo((N−n)/C):\n    si n≤C y e=0:\n      dp[n][e] ← t[n]\n      continuar con siguiente estado",
        "for (let n = 2; n <= N; n++)",
        "n es el número de personas del subproblema y e su saldo de bolsas vacías. El estado base es un solo cruce. Solo se materializa la región que puede necesitar F(N,0).",
      ),
      step(
        "best ← infinito; choice ← −1\nsi n≤C:\n  lo ← 2; hi ← min(n,e+1)\nsi n>C:\n  lo ← max(0,C+2−n); hi ← min(C−1,e+1)",
        "const lo = n <= C ? 2 : Math.max(0, C + 2 - n),",
        "Los límites impiden subproblemas fuera del dominio. No se deben unificar los dos casos: para n≤C existen transiciones dentro de la misma fila hacia e menor.",
      ),
      step(
        "para i=lo..hi:\n  nextN ← i si n≤C, si no n−C+i\n  candidate ← t[n]+prefix[i]+dp[nextN][e+1−i]\n  si candidate<best: best ← candidate; choice ← i\ndp[n][e] ← best\nsi se pide traza: guardar (n,e,best,choice)",
        "candidate = t[n] + prefix[i] + dp[nextN][e + 1 - i];",
        "Se paga el cruce más lento, los retornos prepagados y el resto. nextN<n o nextN=n con e menor: el orden de ciclos garantiza disponibilidad. Un mínimo vacío queda en infinito.",
      ),
      step(
        "devolver dp[N][0]",
        "return { answer: dp[N][0], dp, cells, times: t.slice(1) };",
        "Ordenar cuesta O(N log N). Hay O(N+N²/C) estados; cada uno prueba hasta C opciones, y los límites dan O(N²) tiempo total. La tabla ocupa O(N+N²/C). Esta función calcula costes, no devuelve un calendario.",
      ),
    ],
    exercises: [
      hole(
        "Completa el coste de una transición.",
        "candidate = ___;",
        "t[n] + prefix[i] + dp[nextN][e + 1 - i]",
        "Suma cruce más lento, retornos prepagados y subproblema.",
        "El índice e cambia en 1−i; omitirlo cambia el significado del estado.",
      ),
    ],
  },
  R: {
    file: "rotations",
    entry: "rotationClass",
    contract:
      "Entrada: grafo no dirigido simple, vértices 0..n−1, etiquetas start y target de longitud n. Salida possible, puentes, bloques y clasificación de cada componente sin puentes. Se asumen las precondiciones del enunciado.",
    call: "rotationClass(3,[[0,1],[1,2],[2,0]],[1,2,3],[2,3,1]) // possible: true",
    execution:
      "El grafo y las clasificaciones son resultados reales de rotationClass. Los pasos del ejemplo son un recorrido matemático revisado: no se presenta una rotación visual como si fuera la ejecución de lowlink, KMP o paridad.",
    steps: [
      step(
        "crear adj con pares (vecino,idArista) en ambos sentidos\ntin ← −1; low ← 0; parent,pe ← −1; cursor ← 0\nclock ← 0; edgeStack,blocks ← []; bridges ← conjunto vacío",
        "const tin = Array(n).fill(-1),",
        "tin marca descubrimiento; low es el menor tin alcanzable bajando por el árbol y una arista de retorno. cursor conserva el siguiente vecino del DFS iterativo; pe distingue la arista padre.",
      ),
      step(
        "para cada root no descubierto:\n  stack ← [root]; tin[root] ← low[root] ← clock++\n  mientras stack no vacío:\n    u ← último de stack\n    si quedan vecinos: consumir (v,e)\n      si e=pe[u]: continuar\n      si v no descubierto: asignar parent,pe,tin,low; apilar e y v\n      si tin[v]<tin[u]: low[u] ← min(low[u],tin[v]); apilar e",
        "while (stack.length) {",
        "Cada cursor solo avanza. Las aristas de retorno se apilan una vez, hacia un ancestro; no se confunden con la arista del árbol.",
      ),
      step(
        "si u no tiene vecinos pendientes:\n  sacar u de stack\n  p ← parent[u]\n  si p existe:\n    low[p] ← min(low[p],low[u])\n    si low[u]>tin[p]: marcar pe[u] como puente\n    si low[u]≥tin[p]: sacar aristas hasta pe[u], guardar un bloque",
        "if (low[u] > tin[p]) bridges.add(pe[u]);",
        "La desigualdad estricta detecta puentes; la no estricta separa bloques biconexos. La pila de vértices simula el retorno de una llamada recursiva sin desbordar la pila del lenguaje.",
      ),
      step(
        "comp ← −1; parts ← []\npara cada u sin componente:\n  recorrer con lista nodes creciendo desde u\n  seguir solo aristas que no sean puentes\n  asignar comp[v] al insertar v\n  guardar nodes",
        "const comp = Array(n).fill(-1),",
        "Ningún ciclo usa un puente, por tanto ninguna rotación transporta etiquetas a través de él. Las partes se resuelven independientemente.",
      ),
      step(
        "full ← falso; blockCount ← 0 para cada parte\npara cada bloque de más de una arista:\n  contar vértices distintos y sumar blockCount\n  si aristas≠vértices o longitud es par: full[parte] ← verdadero",
        "if (block.length !== vertices.size || block.length % 2 === 0)",
        "Un bloque no cíclico o un ciclo par habilita el grupo simétrico en la parte. Esta clasificación usa el teorema demostrado en Construir; contar grados por sí solo no lo demuestra.",
      ),
      step(
        "para cada parte:\n  a,b ← etiquetas iniciales y finales\n  same ← ordenar(a)=ordenar(b)\n  si es singleton: devolver same para esa parte\n  si hay un único bloque y todos tienen grado interno 2:\n    construir order siguiendo el vecino distinto del anterior\n    pattern ← target[order]; text ← start[order]",
        "const pattern = order.map((v) => target[v]),",
        "Un ciclo aislado solo permite desplazamientos cíclicos, incluso cuando su longitud es par. Se trata antes del caso full; no basta igualdad de multiconjuntos.",
      ),
      step(
        "KMP:\n  pi[0] ← 0; j ← 0\n  para i=1..m−1: retroceder j=pi[j−1] mientras j>0 y no coincidan; incrementar j si coinciden; pi[i]←j\n  reiniciar j ← 0\n  repetir búsqueda sobre text[i mod m] para i=0..2m−2\n  si j=m: rotación encontrada",
        "for (let i = 1, j = 0; i < pattern.length; i++) {",
        "pi[i] guarda el mayor prefijo propio que también es sufijo del patrón hasta i. Retroceder por pi reutiliza coincidencias sin volver a comparar todo; construir pi y buscar cuesta O(m). Se recorren 2m−1 posiciones para cubrir todas las rotaciones sin duplicar físicamente text.",
      ),
      step(
        "si full: aceptar si same\nsi no same: rechazar\nsi hay etiquetas repetidas: aceptar\nsi todas distintas:\n  where[etiqueta] ← posición en a\n  p ← posiciones de b en a\n  contar cycles siguiendo p desde cada posición no vista\n  aceptar si (m−cycles) mod 2=0\ndevolver conjunción de las partes",
        "const where = new Map(a.map((v, i) => [v, i])),",
        "Cada ciclo de permutación de longitud l aporta l−1 transposiciones. Duplicados permiten invertir la paridad sin cambiar etiquetas visibles. DFS/KMP/paridad O(n+m); ordenar etiquetas añade O(n log n). Espacio O(n+m).",
      ),
    ],
    exercises: [
      hole(
        "Distingue un puente de la frontera de un bloque.",
        "if (___) bridges.add(pe[u]);",
        "low[u] > tin[p]",
        "Si hay retorno exactamente al padre, todavía pertenece a un ciclo.",
        "La condición de puente es estricta. ≥ se usa para separar bloques.",
      ),
    ],
  },
  X: {
    file: "quartets",
    entry: "checkQuartets",
    contract:
      "Entrada: actions ask/quartet, índices de jugadores/cartas desde cero; deck define el mazo. Salida: primera acción incompatible (desde 1), o null, y matching por prefijo si trace=true. Usar trace=false para evaluar la complejidad del solucionador.",
    call: "checkQuartets([], undefined, false) // possible: true, firstFailure: null",
    execution:
      "Cada estado de matching sale de checkQuartets después de procesar una acción. Se muestra una asignación compatible del reparto inicial, no un reparto real conocido ni una animación de cada llamada recursiva de augment.",
    steps: [
      step(
        "C ← suits*perSuit; exigir players*hand=C\ndomains[c] ← todos los jugadores\nowners[c],fixed[c] ← −1\nobligations ← []; failure ← vacío; firstFailure ← null",
        "const domains = Array.from({ length: C }, () =>",
        "domains y fixed se refieren al dueño INICIAL. owners es el dueño ACTUAL tras revelar/transferir; −1 desconocido, −2 carta retirada en un cuarteto.",
      ),
      step(
        "reveal(card,p):\n  si fixed[card] conocido: exigir owners[card]=p; retornar\n  exigir p en domains[card]\n  fixed[card] ← p; owners[card] ← p; domains[card] ← [p]\n  eliminar obligaciones de p satisfechas por card\n  quitar card de los candidatos de las demás obligaciones",
        "const reveal = (card: number, p: number) => {",
        "La primera revelación fija quién tenía la carta al principio. Una revelación posterior comprueba la posesión actual y no reescribe el reparto inicial.",
      ),
      step(
        "para cada acción a de jugador p:\n  si pregunta carta de palo s:\n    si p no tiene una carta conocida del palo:\n      candidates ← cartas desconocidas del palo que admiten dueño inicial p\n      intersectar con obligación previa (p,s), o crearla",
        "if (!cards.some((c) => owners[c] === p)) {",
        "Para preguntar hay que poseer alguna carta del palo. Una obligación exige un testigo sin elegir prematuramente cuál; se mantiene la intersección acumulada.",
      ),
      step(
        "si respuesta sí: reveal(card,from); owners[card] ← p\nsi respuesta no y carta conocida: exigir owners[card]≠from\nsi respuesta no y desconocida: quitar from de domains[card]\nsi anuncia cuarteto: para cada carta del palo, reveal(c,p); owners[c]←−2",
        "if (a.yes) {",
        "La transferencia solo actualiza owners. Una respuesta negativa restringe el reparto inicial únicamente mientras la carta no se haya revelado.",
      ),
      step(
        "match():\n  unknown ← cartas con fixed<0; slots ← []\n  para cada jugador p:\n    free ← hand−número de cartas inicialmente fijadas a p\n    required ← obligaciones de p\n    si free<|required|: fallo\n    añadir un hueco por obligación, con sus candidatos admisibles\n    añadir free−|required| huecos genéricos, con unknown cuyo dominio contenga p",
        "const match = () => {",
        "Un hueco obligatorio reserva una carta testigo; los demás completan el tamaño inicial de la mano. La semántica inicial evita restar dos veces una carta transferida.",
      ),
      step(
        "occupied[card] ← −1; matching[slot] ← −1\naugment(s,seen):\n  para c candidato de s que no esté en seen:\n    marcar c\n    si occupied[c]=−1 o augment(occupied[c],seen):\n      occupied[c] ← s; matching[s] ← c; devolver verdadero\n  devolver falso\npara cada slot s: intentar augment(s, conjunto vacío)",
        "const augment = (s: number, seen: Set<number>): boolean => {",
        "El camino aumentante recoloca cartas previamente asignadas; el conjunto seen pertenece a un intento y evita ciclos. Un simple greedy puede fallar aunque exista reparto.",
      ),
      step(
        "possible ← sin fallo y matched=|unknown| y |slots|=|unknown|\nsi no possible: firstFailure ← índiceAcción+1; detener\ndevolver possible global, firstFailure e historial opcional",
        "const possible =",
        "Todas las cartas y todos los huecos deben cubrirse. Por prefijo, hasta C aumentos recorren O(C²) aristas: O(C³); A acciones dan O(A·C³), espacio O(C²) sin historial, con mazo fijo 32 cartas.",
      ),
    ],
    exercises: [
      hole(
        "Permite recolocar una carta ocupada.",
        "if (occupied[c] < 0 || ___) { /* asignar c a s */ }",
        "augment(occupied[c], seen)",
        "Busca otro lugar para el hueco que tenía esa carta.",
        "La recursión construye el camino aumentante; seen evita repetir cartas.",
      ),
    ],
  },
  T: {
    file: "geometry",
    entry: "solvePyramids",
    contract:
      "Entrada: dos Pyramid=[x,y,u,v,h], lado orientado de base cuadrada y altura positiva. Salida: distancia aproximada, mejor par de puntos y 16 candidatos. iterations=90 por defecto; se asumen bases válidas del enunciado.",
    call: "solvePyramids([0,0,10,0,5],[20,0,30,0,5]).answer // ≈24.142135624",
    execution:
      "Los candidatos y puntos salen del optimizador real. El recorrido visual compara pares de lados; no simula cada evaluación ternaria. La prueba de convexidad y la cota de error real están en Construir; las pruebas también usan un oráculo independiente por despliegue.",
    steps: [
      step(
        "pyramid([x,y,u,v,h]):\n  dx ← u−x; dy ← v−y\n  base ← [(x,y),(u,v),(u−dy,v+dx),(x−dy,y+dx)]\n  apex ← ((x+u−dy)/2,(y+v+dx)/2,h)",
        "function pyramid(p: Pyramid) {",
        "Rotar el lado 90° construye el cuadrado. El ápice está sobre su centro; h es la coordenada vertical.",
      ),
      step(
        "interpolate(a,b,t) ← a+t*(b−a)\npara i=0..3:\n  para j=0..3:\n    p(t) ← interpolate(baseA[i],baseA[(i+1) mod 4],t)\n    q(u) ← interpolate(baseB[j],baseB[(j+1) mod 4],u)\n    f(t,u) ← distancia3D(apexA,p)+distancia2D(p,q)+distancia3D(q,apexB)",
        "const f = (t: number, u: number) => {",
        "Fijar dos lados reduce el problema a dos parámetros en [0,1]. La suma de normas es convexa; Math.hypot evita expandir cuadrados manualmente.",
      ),
      step(
        "minimize(f,I):\n  lo ← 0; hi ← 1\n  repetir I veces:\n    a ← lo+(hi−lo)/3; b ← hi−(hi−lo)/3\n    si f(a)≤f(b): hi ← b\n    si no: lo ← a\n  evaluar 0,1,(lo+hi)/2\n  devolver argumento y valor mínimos",
        "function minimize(f: (x: number) => number, iterations: number) {",
        "La convexidad permite descartar un tercio. Se evalúan explícitamente extremos: el óptimo puede estar en una esquina o una base tocando a la otra.",
      ),
      step(
        "outer ← minimize(t ↦ minimize(u ↦ f(t,u),I).value,I)\ninner ← minimize(u ↦ f(outer.x,u),I)\nguardar i,j,t=outer.x,u=inner.x,distance=inner.value y puntos\nordenar candidatos por distance\ndevolver el primero y los 16 candidatos",
        "const outer = minimize(",
        "Cada evaluación exterior realiza una minimización interior: O(16·I²) evaluaciones, O(1) memoria en el número de lados. Es una aproximación numérica, no igualdad algebraica exacta; I determina precisión junto con la escala geométrica.",
      ),
    ],
    exercises: [
      hole(
        "Descarta el tercio correcto en una función convexa.",
        "if (f(a) <= f(b)) ___; else lo = a;",
        "hi = b",
        "Si el punto izquierdo no es peor, no necesitas el tercio derecho.",
        "El mínimo queda en [lo,b]; no se debe asignar hi=a.",
      ),
    ],
  },
  V: {
    file: "geometry",
    entry: "solveDice",
    contract:
      "Entrada: listas no vacías de valores positivos de dos dados. Salida: minimum y maximum, puntos de puntuación y envolvente. Empatar aporta 1/2; dicePoints orienta los dados para que a no pierda frente a b.",
    call: "solveDice([1],[1]) // minimum: 0.5, maximum: 0.5",
    execution:
      "Los puntos, hull e intersecciones se calculan con solveDice. El recorrido explicado muestra combinaciones convexas; no representa una partida aleatoria ni las iteraciones internas de la búsqueda binaria.",
    steps: [
      step(
        "ordenar caras en a,b\nlower(d,x,upper):\n  l ← 0; r ← longitud(d)\n  mientras l<r:\n    m ← suelo((l+r)/2)\n    si d[m]<x o (upper y d[m]=x): l ← m+1\n    si no: r ← m\n  devolver l",
        "const lower = (a: number[], x: number, upper = false) => {",
        "lower cuenta valores estrictamente menores; upper=true cuenta menores o iguales. El intervalo [l,r) contiene la frontera, incluso cuando todas las caras empatan.",
      ),
      step(
        "score(v,d) ← (lower(d,v,false)+lower(d,v,true))/(2*|d|)\nsi promedio(score(v,b), v en a)<1/2: intercambiar a,b\nvalues ← únicos ordenados de {1}, caras de a,b y cada cara+1\npoints ← (v,score(v,a),score(v,b)) para v en values",
        "const score = (v: number, d: number[]) =>",
        "Menores se cuentan dos veces y empates una: victoria=1, empate=1/2. Solo cambia la puntuación en caras o justo después; no hay que enumerar todos los enteros posibles.",
      ),
      step(
        "eliminar puntos consecutivos de coordenadas iguales\ncross(a,b,c) ← (bx−ax)(cy−ay)−(by−ay)(cx−ax)\nhalf(arr):\n  h ← []\n  para p en arr:\n    mientras |h|>1 y cross(h[−2],h[−1],p)≤0: sacar último\n    insertar p\n  devolver h\nhull ← half(points) y half(points invertidos), sin extremos duplicados\nsi hull vacío: incluir único punto",
        "const half = (arr: typeof points) => {",
        "Las dos puntuaciones son monótonas con v, de modo que los puntos ya vienen ordenados. La pila conserva giros estrictos; cada punto se inserta y elimina como máximo una vez.",
      ),
      step(
        "minimum ← infinito; maximum ← −infinito\nconsider(x,y):\n  si x≥1/2−tolerancia: minimum ← min(minimum,y)\n  si y≤1/2+tolerancia: maximum ← max(maximum,x)",
        "const consider = (x: number, y: number) => {",
        "El problema es optimizar una coordenada bajo un umbral de la otra. Se usa 1e−12 solo para robustez numérica de la frontera.",
      ),
      step(
        "para cada arista p→q del hull (incluyendo cierre):\n  consider(p)\n  si px≠qx: t ← (1/2−px)/(qx−px); si 0≤t≤1 considerar p+t(q−p) con x=1/2\n  si py≠qy: t ← (1/2−py)/(qy−py); si 0≤t≤1 considerar p+t(q−p) con y=1/2\ndevolver minimum,maximum,points,hull",
        "for (let i = 0; i < hull.length; i++) {",
        "Un óptimo lineal está en un vértice del polígono recortado: vértices originales o intersecciones. Ordenar y O(N) búsquedas de O(log N) dominan: O(N log N), memoria O(N); la envolvente es O(N).",
      ),
    ],
    exercises: [
      hole(
        "Calcula la fracción de una arista donde x=1/2.",
        "const t = ___;",
        "(0.5 - p.x) / (q.x - p.x)",
        "Resuelve p.x+t*(q.x−p.x)=0.5; antes se comprueba denominador no nulo.",
        "Aceptar solo 0≤t≤1 asegura que el punto cae en el segmento.",
      ),
    ],
  },
  Z: {
    file: "extended",
    entry: "solveLevers",
    contract:
      "Entrada: counts de longitud 3^k, codificación ternaria con primer dígito menos significativo; 1≤k≤5, suma=2^n, n≤40. Salida: vectores de palancas cuya distribución es counts, proyecciones y reconstrucción. Los recuentos usan Number exacto hasta 2^40, no operadores bit a bit.",
    call: "solveLevers([1,1,0],1) // answer: [[1]]",
    execution:
      "Las proyecciones, masas y capas DP son calculadas por solveLevers y leverDistribution. El recorrido por fases explica estas tablas; no pretende mostrar cada suma del algoritmo. La solución se verifica regenerando toda la distribución.",
    steps: [
      step(
        "m ← 3^k; vectors ← todos los k dígitos ternarios\nvalidar counts y suma potencia de dos\nn ← log2(suma counts)\ndot(x,v) ← suma(x[j]*v[j]) mod 3\npara cada x en vectors:\n  row ← [0,0,0]\n  para cada v: row[dot(x,v)] += counts[encode(v)]\n  f[x] ← mínimo exponente de 2 en entradas no nulas de row",
        "export function solveLevers",
        "Proyectar reduce cada palanca a residuo 0,1,2. La valuación común da el número de palancas ortogonales; se ignoran entradas nulas al tomar el mínimo.",
      ),
      step(
        "mass(generators):\n  perpendicular ← x ortogonal a todos los generadores\n  h ← |perpendicular|\n  devolver (3*suma(f[x] para x en perpendicular)/h−n)/2\nzeros ← mass([])\nanswer provisional ← zeros copias del vector cero",
        "const mass",
        "La fórmula invierte las sumas sobre hiperplanos. El espacio generado vacío es {0}, así que su masa cuenta palancas nulas. La derivación por incidencia está en Construir.",
      ),
      step(
        "para u no nulo con encode(u)≤encode(−u):\n  multiplicidad ← mass([u])−zeros\n  añadir multiplicidad copias de u\nexigir que se obtengan exactamente n palancas",
        "const zeros",
        "Cada recta de F3 tiene dos vectores opuestos. Se elige un representante único; aún falta resolver los signos.",
      ),
      step(
        "leverDistribution(levers,k):\n  D[0] ← 1; otros D ← 0; layers ← [D]\n  para u en levers:\n    next ← copia de D\n    para v en vectors: next[encode(v+u)] += D[encode(v)]\n    D ← next; guardar D en layers\n  devolver D,layers",
        "const next = [...counts];",
        "La copia conserva subconjuntos que no usan u; la suma añade los que sí. Leer siempre la capa anterior impide usar dos veces la misma palanca. La suma vectorial es componente a componente módulo 3.",
      ),
      step(
        "para cada shift alcanzable por la DP provisional:\n  si para todo s, counts[s]=D[encode(vectors[s]+shift)]: elegir shift\nsi ninguno existe: error\nstate ← encode(shift)\npara i desde n hasta 1:\n  si layers[i−1][state]>0: no seleccionar palanca i−1\n  si no: marcarla, state ← encode(vectors[state]−u[i−1])\nnegar módulo 3 las palancas marcadas\ndevolver answer",
        "let v = vectors[shift];",
        "Cambiar u por −u traslada la distribución en −u; por eso la búsqueda compara counts[s] con D[s+shift]. Retroceder recupera un subconjunto que suma shift. O(k·9^k+n·k·3^k), capas O(n·3^k) más vectores/proyecciones; no es una búsqueda de 2^n subconjuntos.",
      ),
    ],
    exercises: [
      hole(
        "Completa la transición para usar una palanca una vez.",
        "next[encode(vectorAdd(v, u))] += ___;",
        "counts[s]",
        "Lee la capa anterior, nunca next.",
        "Usar next convertiría el problema 0/1 en una actualización que reutiliza la misma palanca.",
      ),
    ],
  },
};
