import { deepDives } from "./deep-dives";
export type Example = { input: string; output: string; note?: string };
export type Problem = {
  id: string;
  name: string;
  level: number;
  topic: string;
  tags: string[];
  minutes: number;
  summary: string;
  input: string;
  output: string;
  limits: string;
  examples: Example[];
  questions: string[];
  hints: string[];
  strategies: { name: string; cost: string; description: string }[];
  variables: string[];
  steps: string[];
  proof: string;
  time: string;
  space: string;
  derivation: string;
  edges: string[];
  oral: string[];
  followups: string[];
  exercise: {
    question: string;
    options: string[];
    answer: number;
    feedback: string;
  };
  verified: string;
  pending: string[];
  pages: string;
};
export const referencePDF =
  "https://icpc.global/worldfinals/problems/2022-ICPC-World-Finals/finals2022solutions.pdf";
export const statementURL = (id: string) =>
  `https://codeforces.com/gym/105254/problem/${id}`;
export const solutionURL = (id: string) =>
  `https://icpcarchive.github.io/ICPC-World-Finals/2022-ICPC-World-Finals/solutions/${id}.html`;
type Introduction = Omit<
  Problem,
  | "variables"
  | "steps"
  | "proof"
  | "time"
  | "space"
  | "derivation"
  | "oral"
  | "verified"
  | "pending"
>;
const baseProblems: Introduction[] = [
  {
    id: "Y",
    name: "Compression",
    level: 1,
    topic: "Invariantes",
    tags: ["Cadenas", "Reducciones", "Correctitud"],
    minutes: 35,
    pages: "19–20",
    summary:
      "DRY sustituye dos copias consecutivas de una misma subcadena por una sola: XX → X. Dada una cadena binaria, encuentra la cadena más corta que se puede alcanzar. Una operación puede eliminar un bloque entero, no solo un carácter repetido.",
    input: "Una cadena no vacía formada por 0 y 1.",
    output:
      "Una cadena de longitud mínima alcanzable mediante operaciones DRY.",
    limits:
      "1 ≤ n ≤ 100 000. El editor usa hasta 24 bits para poder enumerar operaciones.",
    examples: [
      { input: "1111", output: "1" },
      { input: "101", output: "101" },
      { input: "10110", output: "10" },
    ],
    questions: [
      "¿Qué operaciones puedes aplicar a 10110? ¿Y a 101?",
      "¿Puede cambiar el primer o el último carácter?",
      "¿Puedes eliminar la última aparición de un símbolo?",
    ],
    hints: [
      "Observa qué ocurre en los extremos cuando XX se sustituye por X.",
      "Comprime primero cada grupo de bits iguales. Queda una cadena alternante.",
      "En una cadena alternante de longitud ≥ 4, los primeros cuatro bits son XX con |X| = 2.",
    ],
    strategies: [
      {
        name: "Explorar todas las reducciones",
        cost: "Exponencial",
        description:
          "Enumera operaciones y visita cadenas alcanzables. Es útil como oráculo para entradas diminutas, pero el número de cadenas puede crecer hasta 2ⁿ.",
      },
      {
        name: "Reducir de forma constructiva",
        cost: "O(n) con una representación adecuada",
        description:
          "Colapsa grupos iguales y elimina pares del prefijo alternante hasta que queden a lo sumo tres símbolos. Las copias de cadenas del visualizador cuestan más.",
      },
      {
        name: "Leer los invariantes",
        cost: "O(n) tiempo · O(1) auxiliar",
        description:
          "Si solo aparece un bit, devuelve ese bit. Si los extremos difieren, devuelve ambos. Si coinciden y aparecen los dos símbolos, devuelve primero + opuesto + último.",
      },
    ],
    edges: [
      "Un solo bit",
      "Todos los bits iguales",
      "Extremos iguales con ambos símbolos: 010",
      "Cadena alternante larga",
    ],
    followups: [
      "¿Por qué la regla deja de ser suficiente con tres símbolos?",
      "¿Por qué 010 no se puede comprimir?",
      "¿Una cota inferior demuestra por sí sola que la respuesta es alcanzable?",
    ],
    exercise: {
      question: "¿Cuál es la reducción mínima de 01110?",
      options: ["0", "01", "010"],
      answer: 2,
      feedback:
        "Los extremos son 0 y se debe conservar algún 1. Por tanto hacen falta al menos tres caracteres. 01110 → 0110 → 010 alcanza esa cota.",
    },
  },
  {
    id: "U",
    name: "Toy Train Tracks",
    level: 2,
    topic: "Construcción",
    tags: ["Paridad", "Módulo 4", "Geometría discreta"],
    minutes: 45,
    pages: "11–12",
    summary:
      "Dispones de piezas rectas y curvas de 90°. Construye un único circuito cerrado, sin cruzarse ni ocupar una celda dos veces, que use la mayor cantidad posible de piezas.",
    input: "Dos enteros s y c: existencias de rectas y curvas.",
    output:
      "Una cadena con S, L y R que describa un circuito de longitud máxima; puede haber varias respuestas.",
    limits:
      "0 ≤ s ≤ 100 000; 4 ≤ c ≤ 100 000. Cada pieza ocupa una celda de la cuadrícula.",
    examples: [
      {
        input: "4 12",
        output: "LSRLLRLSLSRLLSRL",
        note: "Es una construcción oficial, no la única.",
      },
      { input: "1 5", output: "LLLL" },
    ],
    questions: [
      "¿Cerrar la orientación garantiza volver al punto inicial?",
      "¿Qué pasa si añades una recta en cada uno de dos lados opuestos?",
      "¿Puedes usar ocho curvas y ninguna recta?",
    ],
    hints: [
      "La orientación, la posición y las celdas ocupadas son tres condiciones distintas.",
      "Un circuito utiliza cantidades pares de rectas y curvas.",
      "Separa el caso sin rectas y las clases de c módulo 4.",
    ],
    strategies: [
      {
        name: "Buscar secuencias de piezas",
        cost: "Exponencial",
        description:
          "Probar S/L/R y rechazar intersecciones permite explorar casos pequeños; no sirve para construir hasta 200 000 piezas.",
      },
      {
        name: "Plantillas ampliables",
        cost: "O(s+c)",
        description:
          "Usar circuitos base y ampliaciones simétricas. La paridad limita cuánto se puede aprovechar. El caso de ocho curvas sin rectas requiere tratamiento especial.",
      },
    ],
    edges: [
      "s = 0 y c = 8",
      "Inventarios impares",
      "Mínimo c = 4",
      "Cierre de orientación sin cierre de posición",
    ],
    followups: [
      "¿Por qué no basta con contar giros?",
      "¿Cómo verificarías automáticamente que una salida es válida?",
    ],
    exercise: {
      question: "Una secuencia acaba con la misma orientación. ¿Ya es válida?",
      options: ["Sí", "No: faltan posición, intersecciones e inventario"],
      answer: 1,
      feedback:
        "Cuatro giros recuperan la orientación, pero aún hay que comprobar que el circuito se cierra en la posición correcta y no se cruza.",
    },
  },
  {
    id: "P",
    name: "Turning Red",
    level: 2,
    topic: "Grafos",
    tags: ["DFS", "Restricciones", "Módulo 3"],
    minutes: 55,
    pages: "1–2",
    summary:
      "Cada botón cambia sus luces de rojo a verde, de verde a azul y de azul a rojo. Cada luz tiene como máximo dos botones. Encuentra el mínimo número total de pulsaciones que deja todas las luces rojas, o demuestra que es imposible.",
    input:
      "l luces, b botones, colores iniciales y lista de luces de cada botón.",
    output: "Mínimo de pulsaciones, o impossible.",
    limits:
      "1 ≤ l ≤ 200 000; 0 ≤ b ≤ 2l. Una luz aparece en como máximo dos listas. Cada botón del enunciado controla al menos una luz.",
    examples: [
      {
        input: "8 6\nGBRBRRRG\n2 1 4\n1 2\n4 4 5 6 7\n3 5 6 7\n1 8\n1 8",
        output: "8",
      },
      { input: "4 3\nRGBR\n2 1 2\n2 2 3\n2 3 4", output: "impossible" },
      { input: "4 4\nGBRG\n2 1 2\n2 2 3\n2 3 4\n1 4", output: "6" },
      { input: "3 3\nRGB\n1 1\n1 2\n1 3", output: "3" },
    ],
    questions: [
      "¿Tiene sentido pulsar un botón tres veces?",
      "Si conoces xᵢ, ¿qué valor obliga una luz compartida a tomar a xⱼ?",
      "¿Qué ocurre con una luz azul sin botones?",
    ],
    hints: [
      "Codifica R=0, G=1, B=2 y suma módulo 3.",
      "Una luz compartida exige c + xᵢ + xⱼ ≡ 0 (mod 3).",
      "Prueba los tres valores de un botón raíz por componente y propaga.",
    ],
    strategies: [
      {
        name: "Enumerar todas las pulsaciones",
        cost: "O(3ᵇ · (l+b))",
        description:
          "Cada botón solo necesita 0, 1 o 2 pulsaciones. Evaluar todas las asignaciones es un buen oráculo pequeño.",
      },
      {
        name: "Propagar por componentes",
        cost: "O(l+b)",
        description:
          "Listas de adyacencia conectan botones que comparten una luz. DFS o una pila calcula todos los valores a partir de una raíz; cada componente requiere solo tres intentos.",
      },
    ],
    edges: [
      "Luz verde sin botones: imposible",
      "Luz roja sin botones: satisfecha",
      "Dos luces compartidas que exigen sumas distintas",
      "Una luz con un único botón",
      "Varias componentes independientes",
    ],
    followups: [
      "¿Por qué no basta con encontrar cualquier solución?",
      "¿Qué cambiaría si una luz tuviera tres botones?",
      "¿Cómo detectas contradicciones en un ciclo?",
    ],
    exercise: {
      question: "Una luz verde une i y j. Si xᵢ = 2, ¿cuánto vale xⱼ?",
      options: ["0", "1", "2"],
      answer: 0,
      feedback: "Verde vale 1: 1 + 2 + xⱼ ≡ 0 módulo 3. Por tanto xⱼ = 0.",
    },
  },
  {
    id: "W",
    name: "Riddle of the Sphinx",
    level: 2,
    topic: "Álgebra",
    tags: ["Sistemas lineales", "Interacción", "Redundancia"],
    minutes: 40,
    pages: "15–16",
    summary:
      "Debes descubrir tres enteros no negativos mediante exactamente cinco preguntas sobre combinaciones lineales. Como máximo una respuesta puede ser falsa. El diseño de las preguntas debe permitir corregir ese error.",
    input:
      "Por ronda emites tres coeficientes y recibes una respuesta. No es un archivo de entrada tradicional.",
    output: "Tras las cinco consultas, los tres valores desconocidos.",
    limits:
      "Coeficientes entre 0 y 10; respuestas entre 0 y 100 000. Cinco rondas, a lo sumo una mentira.",
    examples: [
      {
        input:
          "Consultas: (1,1,1), (1,1,1), (5,0,1), (1,0,0), (1,1,0)\nRespuestas: 12,13,24,4,8",
        output: "4 4 4",
        note: "Transcripción de una interacción oficial. Las consultas no son las de nuestra propuesta.",
      },
      {
        input:
          "Consultas: (4,4,4), (1,0,0), (0,1,0), (0,0,1), (0,0,0)\nRespuestas: 2023,0,42,2024,0",
        output: "0 42 2024",
      },
    ],
    questions: [
      "¿Por qué tres preguntas independientes no bastan si una puede mentir?",
      "¿Qué significa que dos ternas expliquen cuatro respuestas cada una?",
    ],
    hints: [
      "Usa información redundante, además de independencia.",
      "Elige cinco filas tales que cualquier terna sea independiente.",
      "Prueba candidatos recuperados de ternas y exige que satisfagan al menos cuatro respuestas.",
    ],
    strategies: [
      {
        name: "Repetir cada incógnita tres veces",
        cost: "9 consultas",
        description:
          "La mayoría tolera una mentira, pero excede el presupuesto de cinco preguntas.",
      },
      {
        name: "Cinco ecuaciones redundantes",
        cost: "O(1)",
        description:
          "Preguntar por a, b, c, a+b+c y a+2b+3c. Resolver ternas y contar acuerdos con las cinco respuestas.",
      },
    ],
    edges: [
      "No hay mentira",
      "Una respuesta falsa coincide accidentalmente con la verdadera",
      "Valores cero",
      "Candidato fraccionario al usar una fila falsa",
    ],
    followups: [
      "¿Qué falla si la última fila es (1,1,2)?",
      "¿Puedes distinguir una mentira que devuelve el valor correcto?",
    ],
    exercise: {
      question:
        "Dos candidatos que satisfacen cuatro de cinco filas comparten al menos…",
      options: ["Dos filas", "Tres filas", "Cuatro filas"],
      answer: 1,
      feedback:
        "Por inclusión-exclusión comparten al menos 4+4−5=3 filas. Su independencia garantiza unicidad.",
    },
  },
  {
    id: "Q",
    name: "Doing the Container Shuffle",
    level: 3,
    topic: "Estructuras de datos",
    tags: ["Esperanza", "Fenwick Tree", "Orden"],
    minutes: 65,
    pages: "3–4",
    summary:
      "Los contenedores 1…n llegan en orden y cada uno va al azar a una de dos pilas. Los camiones los piden en una permutación dada. Calcula el número esperado de movimientos, incluidos los movimientos al camión.",
    input: "n y una permutación a de 1…n que indica el orden de retirada.",
    output: "Esperanza del número de movimientos, con error absoluto ≤ 10⁻³.",
    limits:
      "1 ≤ n ≤ 1 000 000. Las elecciones de pila son independientes y equiprobables.",
    examples: [
      { input: "5\n4 2 5 3 1", output: "7.000" },
      { input: "6\n1 2 3 4 5 6", output: "13.500" },
    ],
    questions: [
      "¿Cuántos movimientos al camión son inevitables?",
      "¿Qué orden permanece al pasar elementos de una pila a otra?",
      "¿Puedes sumar esperanzas sin enumerar todas las colocaciones?",
    ],
    hints: [
      "Concatena la primera pila de abajo arriba con la segunda de arriba abajo.",
      "Mover el elemento superior de una pila a la otra no cambia ese orden conjunto.",
      "Cuenta los contenedores aún presentes entre solicitudes consecutivas mediante frecuencias y prefijos.",
    ],
    strategies: [
      {
        name: "Enumerar colocaciones y simular",
        cost: "O(2ⁿ n²) como cota simple",
        description:
          "Un oráculo pequeño recorre las 2ⁿ asignaciones y simula todas las retiradas.",
      },
      {
        name: "Esperanza y frecuencias",
        cost: "O(n log n)",
        description:
          "La linealidad de la esperanza reduce movimientos a contribuciones individuales. Un Fenwick mantiene cuántos índices siguen activos bajo un umbral.",
      },
    ],
    edges: [
      "n = 1",
      "Orden inverso",
      "Orden creciente",
      "Primer pedido: no tiene predecesor",
    ],
    followups: [
      "¿La linealidad de la esperanza requiere independencia?",
      "¿Qué operaciones ofrece Fenwick que no ofrece una suma prefija estática?",
    ],
    exercise: {
      question:
        "Después de retirar un contenedor, necesitas actualizar un conteo y consultar prefijos. ¿Qué elegirías?",
      options: ["Suma prefija estática", "Fenwick Tree"],
      answer: 1,
      feedback:
        "Fenwick permite ambas operaciones en O(log n). Una suma prefija estática exige reconstruir valores después de las retiradas.",
    },
  },
  {
    id: "T",
    name: "Carl's Vacation",
    level: 3,
    topic: "Geometría",
    tags: ["Superficies", "Desarrollo plano", "Precisión"],
    minutes: 60,
    pages: "9–10",
    summary:
      "Una hormiga viaja entre los vértices superiores de dos pirámides cuadradas rectas. Solo puede recorrer sus superficies y el suelo. Encuentra la menor distancia.",
    input:
      "Para cada pirámide: una arista orientada de la base y la altura. La base queda a la izquierda de esa arista.",
    output: "Distancia mínima con error absoluto o relativo ≤ 10⁻⁶.",
    limits:
      "Coordenadas entre −100 000 y 100 000; alturas entre 1 y 100 000; bases sin intersección de área positiva.",
    examples: [{ input: "0 0 10 0 4\n9 18 34 26 42", output: "60.866649532" }],
    questions: [
      "¿Por qué la distancia 3D directa no es una ruta permitida?",
      "¿Qué conserva rotar una cara rígida alrededor de su base?",
    ],
    hints: [
      "Desarrolla una cara lateral sobre el suelo.",
      "Hay cuatro elecciones de cara en cada pirámide.",
      "Una línea en el desarrollo solo es válida si cruza las aristas de salida y entrada.",
    ],
    strategies: [
      {
        name: "Optimizar puntos de cruce",
        cost: "Depende de la precisión",
        description:
          "Parametrizar un punto en cada arista y minimizar la suma de distancias es una alternativa numérica; requiere justificar convexidad y error.",
      },
      {
        name: "Desarrollar caras",
        cost: "O(1)",
        description:
          "Explorar las 16 parejas de caras, aplanarlas y comprobar la geometría de cada ruta candidata.",
      },
    ],
    edges: [
      "Bases que se tocan",
      "Cruce en un vértice",
      "Segmentos paralelos o colineales",
      "Coordenadas grandes y alturas pequeñas",
    ],
    followups: [
      "¿Cómo calculas la altura inclinada de una cara?",
      "¿Qué tolerancia usarías al comprobar una intersección?",
    ],
    exercise: {
      question:
        "¿Qué debes comprobar después de unir los vértices desarrollados?",
      options: [
        "Solo la longitud",
        "Que el segmento atraviese las dos aristas en el orden válido",
      ],
      answer: 1,
      feedback:
        "Una línea corta que no pase por la salida y la entrada correctas no corresponde a una ruta sobre las superficies permitidas.",
    },
  },
  {
    id: "V",
    name: "Three Kinds of Dice",
    level: 4,
    topic: "Geometría",
    tags: ["Probabilidad", "Convex hull", "Optimización"],
    minutes: 75,
    pages: "13–14",
    summary:
      "Dos dados tienen un ganador en esperanza. Diseña conceptualmente un tercero: optimiza su puntuación frente a uno bajo una restricción de puntuación frente al otro. Un empate en una tirada vale medio punto.",
    input:
      "Dos listas de caras. El dado con ventaja es D₁, aunque no venga primero en la entrada.",
    output:
      "Mínimo score(D₃,D₂) sujeto a score(D₃,D₁) ≥ 1/2 y máximo score(D₃,D₁) sujeto a score(D₃,D₂) ≤ 1/2. Pueden usar dados distintos.",
    limits:
      "De 1 a 100 000 caras por dado; valores entre 1 y 10⁹; error absoluto ≤ 10⁻⁶.",
    examples: [
      { input: "6 1 1 6 6 8 8\n3 2 4 9", output: "0.291666667 0.750000000" },
      { input: "4 9 3 7 5\n3 4 2 3", output: "0.500000000 0.500000000" },
    ],
    questions: [
      "¿Basta comparar la media de los valores de las caras?",
      "¿Qué representa mezclar dos posibles valores de una cara?",
    ],
    hints: [
      "Para un valor v, calcula la puntuación esperada de v frente a cada dado.",
      "Representa esas dos puntuaciones como un punto.",
      "Mezclar caras produce combinaciones convexas de los puntos.",
    ],
    strategies: [
      {
        name: "Enumerar dados candidatos",
        cost: "Sin cota finita útil",
        description:
          "No existe en la entrada un límite para el número de caras del dado buscado; enumerarlo directamente no es una estrategia práctica.",
      },
      {
        name: "Región de puntuaciones",
        cost: "O(N log N)",
        description:
          "Ordenar caras, calcular puntos de puntuación para valores relevantes y optimizar sobre su envolvente convexa recortada por un semiplano.",
      },
    ],
    edges: [
      "Dados con distinto número de caras",
      "Valores repetidos",
      "Menor valor permitido: 1",
      "Óptimo exactamente en 1/2",
    ],
    followups: [
      "¿Por qué medias de caras no determinan quién gana?",
      "¿Qué pasa si olvidas dividir por el número de caras?",
    ],
    exercise: {
      question: "Un dado con 3 caras de tipo A y una de tipo B produce…",
      options: ["p(A)+p(B)", "0.75 p(A)+0.25 p(B)"],
      answer: 1,
      feedback:
        "Todas las caras son equiprobables. El punto de puntuaciones es su promedio ponderado por multiplicidad.",
    },
  },
  {
    id: "X",
    name: "Quartets",
    level: 4,
    topic: "Grafos",
    tags: ["Matching bipartito", "Restricciones", "Información parcial"],
    minutes: 85,
    pages: "17–18",
    summary:
      "Observas acciones de un juego de cuatro jugadores y 32 cartas. Debes decidir si existe un reparto inicial compatible con todo lo observado, o identificar la primera acción que hace inevitable que alguien haya mentido.",
    input:
      "n acciones de pedir una carta con respuesta yes/no o mostrar un cuarteto.",
    output:
      "yes si existe un reparto compatible; si no, no y el índice de la primera acción incompatible.",
    limits:
      "1 ≤ n ≤ 1000; 4 jugadores, 8 cartas iniciales por jugador, 8 conjuntos de 4 cartas. El enunciado garantiza validez salvo las dos formas de engaño especificadas.",
    examples: [
      {
        input: "4\n1 A 2 3C no\n2 A 3 3A yes\n2 A 4 3D yes\n2 A 1 3C no",
        output: "no\n4",
      },
      {
        input:
          "6\n1 A 2 3C no\n2 A 3 3A yes\n2 A 4 3D yes\n2 A 1 3B no\n1 A 4 5B yes\n1 Q 5",
        output: "yes",
      },
    ],
    questions: [
      "¿La ausencia de una contradicción local garantiza un reparto global?",
      "¿Qué diferencia hay entre dueño inicial y dueño actual?",
    ],
    hints: [
      "Expresa cada observación como una restricción sobre el reparto inicial.",
      "Una petición implica poseer alguna carta del mismo conjunto.",
      "Representa 32 huecos iniciales y 32 identidades de cartas como un grafo bipartito.",
    ],
    strategies: [
      {
        name: "Buscar repartos con poda",
        cost: "Exponencial en cartas",
        description:
          "Puede aprovechar muchas restricciones, pero el peor caso sigue siendo combinatorio.",
      },
      {
        name: "Matching de huecos a cartas",
        cost: "O(n · C · E) con caminos aumentantes",
        description:
          "Con C=32 y E≤C², comprobar un matching perfecto tras cada acción proporciona un esquema polinomial. La dificultad está en traducir correctamente la información.",
      },
    ],
    edges: [
      "Pedir una carta que uno ya posee no constituye engaño por sí solo",
      "Cuarteto retirado",
      "Una obligación se satisface con una transferencia conocida",
      "Contradicción global sin contradicción individual",
    ],
    followups: [
      "¿Por qué una sola carta no puede satisfacer dos huecos?",
      "¿Qué restricciones surgen de una respuesta negativa?",
    ],
    exercise: {
      question:
        "Dos huecos solo admiten la misma carta. ¿Existe un matching que llene ambos?",
      options: ["Sí", "No"],
      answer: 1,
      feedback:
        "Una identidad de carta solo se puede usar una vez. Las posibilidades locales no garantizan una asignación global.",
    },
  },
  {
    id: "R",
    name: "Zoo Management",
    level: 4,
    topic: "Grafos",
    tags: ["Puentes", "Ciclos", "Permutaciones"],
    minutes: 85,
    pages: "5–6",
    summary:
      "Todos los recintos de un zoológico están ocupados. Puedes rotar animales simultáneamente por ciclos de túneles, sin que se encuentren. Decide si es alcanzable una distribución objetivo; puede haber varios animales del mismo tipo.",
    input:
      "Grafo no dirigido simple; etiqueta inicial y final de cada vértice.",
    output: "possible o impossible.",
    limits:
      "n,m ≤ 400 000; n ≥ 1; etiquetas ≤ 10⁶. El multiconjunto global inicial y final coincide.",
    examples: [
      { input: "3 3\n1 4\n4 7\n7 1\n1 2\n2 3\n1 3", output: "possible" },
      { input: "2 1\n1 2\n2 1\n1 2", output: "impossible" },
      {
        input:
          "5 6\n10 40\n20 30\n30 50\n40 20\n50 10\n1 2\n2 3\n1 3\n3 4\n3 5\n4 5",
        output: "possible",
      },
      {
        input: "4 4\n10 10\n10 20\n20 10\n20 20\n1 2\n2 3\n3 4\n1 4",
        output: "impossible",
      },
    ],
    questions: [
      "¿Puede un movimiento usar un puente?",
      "¿Puedes intercambiar dos animales que comparten un túnel?",
      "¿Qué cambia cuando dos animales tienen la misma etiqueta?",
    ],
    hints: [
      "Los movimientos permitidos se descomponen en rotaciones de ciclos.",
      "Al eliminar puentes quedan componentes independientes.",
      "Un ciclo simple admite rotaciones; estructuras con varios ciclos pueden generar grupos de permutaciones mayores.",
    ],
    strategies: [
      {
        name: "Explorar configuraciones",
        cost: "Hasta O(n!) estados con etiquetas distintas",
        description:
          "BFS puede validar grafos diminutos; no es una solución para cientos de miles de recintos.",
      },
      {
        name: "Clasificar componentes sin puentes",
        cost: "O(n log n + m) en un diseño con ordenación",
        description:
          "Detectar puentes, separar ciclos simples de componentes con varios ciclos y comprobar las permutaciones permitidas. Comparar multiconjuntos con ordenación da una cota determinista.",
      },
    ],
    edges: [
      "Grafo sin aristas",
      "Un puente entre ciclos",
      "Ciclo simple con etiquetas repetidas",
      "Ciclos impares unidos por vértices",
      "Aristas pertenecientes a más de un ciclo",
    ],
    followups: [
      "¿Por qué las etiquetas repetidas afectan a la paridad?",
      "¿Un ciclo simple permite cualquier permutación par?",
    ],
    exercise: {
      question:
        "Dos recintos unidos por un único túnel quieren intercambiar animales. ¿Es posible?",
      options: ["Sí, simultáneamente", "No"],
      answer: 1,
      feedback:
        "Se encontrarían dentro del túnel. La arista es un puente y ningún ciclo permitido la utiliza.",
    },
  },
  {
    id: "S",
    name: "Bridging the Gap",
    level: 5,
    topic: "Programación dinámica",
    tags: ["Estados", "Optimización", "Costes"],
    minutes: 100,
    pages: "7",
    summary:
      "Un grupo debe cruzar de noche un puente con una sola antorcha y capacidad c. Cada cruce tarda lo que el caminante más lento del grupo. Minimiza el tiempo hasta que todos estén al otro lado.",
    input: "n, capacidad c y los n tiempos de cruce.",
    output: "Tiempo total mínimo, entero.",
    limits:
      "2 ≤ n,c ≤ 10 000; tiempos entre 1 y 10⁹. La capacidad puede superar n.",
    examples: [
      { input: "4 2\n1 2 10 5", output: "17" },
      { input: "4 6\n1 2 10 5", output: "10" },
    ],
    questions: [
      "¿Por qué devolver siempre al más rápido puede ser subóptimo?",
      "¿Qué información de cruces futuros puedes pagar por adelantado?",
    ],
    hints: [
      "Ordena los tiempos y piensa en grupos de lentos que ya no necesitan volver.",
      "Se pueden contabilizar anticipadamente regresos de caminantes rápidos.",
      "El estado lleva cuántos lentos cruzaron y cuántos regresos prepagados quedan.",
    ],
    strategies: [
      {
        name: "Estados por subconjuntos y antorcha",
        cost: "Exponencial en n",
        description:
          "Dijkstra en estados (personas al otro lado, lado de antorcha) es un oráculo exacto pequeño.",
      },
      {
        name: "DP estructural",
        cost: "O(n²)",
        description:
          "Tras demostrar la forma de cruces óptimos, se comprime el estado a lentos transportados y créditos de regreso. Los límites del estado y las transiciones son parte esencial de la optimización.",
      },
    ],
    edges: [
      "Capacidad ≥ n",
      "Tiempos iguales",
      "Capacidad 2",
      "Último cruce sin regreso",
      "Créditos insuficientes o estados inalcanzables",
    ],
    followups: [
      "¿Por qué no se paga regreso tras el último cruce?",
      "¿Qué necesitas probar para comprimir un estado?",
    ],
    exercise: {
      question:
        "Hay cuatro personas con tiempos 1, 2, 5, 10 y capacidad 6. El óptimo es…",
      options: ["10", "17", "18"],
      answer: 0,
      feedback:
        "Todos caben en un único cruce. El más lento tarda 10 y no se necesita regresar con la antorcha.",
    },
  },
  {
    id: "Z",
    name: "Archaeological Recovery",
    level: 5,
    topic: "Álgebra",
    tags: ["Módulo 3", "Subespacios", "Reconstrucción"],
    minutes: 110,
    pages: "21–22",
    summary:
      "Se perdió la descripción de n palancas que rotan k pirámides. Conoces el multiconjunto de configuraciones producido por todos los subconjuntos de palancas. Reconstruye cualquier conjunto de palancas que produzca exactamente esas frecuencias.",
    input: "n, k, t y t configuraciones A/E/I con su multiplicidad.",
    output:
      "n vectores de acciones +, − o 0; cualquier solución compatible es válida.",
    limits:
      "1 ≤ n ≤ 40; 1 ≤ k ≤ 5; t ≤ 3ᵏ. Las frecuencias suman 2ⁿ y se garantiza que existe solución.",
    examples: [
      { input: "2 3 4\nEEE 1\nEIA 1\nIAE 1\nAAA 1", output: "+-0\n+++" },
      {
        input: "3 2 2\nIA 4\nAA 4",
        output: "-0\n00\n00",
        note: "Las salidas no son únicas; se verifican regenerando frecuencias.",
      },
    ],
    questions: [
      "¿Por qué importan las multiplicidades y no solo los estados alcanzables?",
      "¿Qué sucede con las frecuencias si agregas una palanca nula?",
    ],
    hints: [
      "A,E,I representan 0,1,2 en el espacio vectorial módulo 3.",
      "Proyecta las configuraciones mediante productos escalares para obtener un problema unidimensional.",
      "Primero recupera cuántas palancas hay en cada dirección salvo signo; luego corrige signos mediante una traslación.",
    ],
    strategies: [
      {
        name: "Buscar todos los conjuntos de palancas",
        cost: "(3ᵏ)ⁿ candidatos ordenados",
        description:
          "Es inviable. Solo sirve como idea de oráculo para n y k diminutos.",
      },
      {
        name: "Proyecciones y subespacios",
        cost: "O(k·3²ᵏ + n·3ᵏ) en una implementación directa",
        description:
          "Las proyecciones revelan conteos de vectores ortogonales. Conteos en subespacios recuperan direcciones; una DP sobre 3ᵏ estados y traslaciones resuelve los signos.",
      },
    ],
    edges: [
      "Palancas nulas",
      "Muchas configuraciones iguales",
      "Signos indistinguibles en parte de la distribución",
      "Frecuencias hasta 2⁴⁰: no usar enteros de 32 bits",
    ],
    followups: [
      "¿Por qué recuperar los signos no exige probar 2ⁿ elecciones?",
      "¿Qué información se pierde si solo guardas el soporte?",
    ],
    exercise: {
      question: "Añadir una palanca que no mueve nada…",
      options: ["No cambia las frecuencias", "Duplica todas las frecuencias"],
      answer: 1,
      feedback:
        "Cada subconjunto anterior tiene dos versiones: con y sin la palanca nula. Ambas producen la misma configuración.",
    },
  },
];

/** The second-iteration lesson is authoritative; introductory statements/examples remain intact. */
export const problems: Problem[] = baseProblems.map((p) => {
  const d = deepDives[p.id];
  return {
    ...p,
    variables: d.structures,
    steps: d.code.map((c) => `${c.line} — ${c.why}`),
    proof: d.proof.join(" "),
    time: d.time,
    space: d.space,
    derivation: d.costs.join(" "),
    oral: d.oral,
    verified: `${d.status}. ${d.evidence}`,
    pending: d.status === "Parcialmente verificado" ? d.limitations : [],
  };
});
